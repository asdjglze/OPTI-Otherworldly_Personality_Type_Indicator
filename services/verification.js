// 版本号: v1.0.0
/**
 * 人机验证服务
 * 
 * 功能: 验证题库管理、IP限制、AI验证
 * 限制: 每个IP重试三次后需等待一小时
 * 存储: 使用专门的SQLite文件
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 数据库文件路径
const DB_DIR = path.join(__dirname, '..', 'data', 'verification_data');
const DB_FILE = path.join(DB_DIR, 'verification.db');

// 题库文件路径
const QUIZ_FILE = path.join(__dirname, '..', 'data', 'verification_quiz.json');

// 配置
const CONFIG = {
    maxRetries: 3,              // 最大重试次数
    banDuration: 60 * 60 * 1000, // 封禁时长（1小时）
    tokenExpiry: 10 * 60 * 1000  // 验证令牌有效期（10分钟）
};

// 数据库连接
let db = null;

// 题库缓存
let quizCache = null;

/**
 * 初始化数据库
 */
async function initDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve();
            return;
        }
        
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
        
        db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                console.error('[验证服务] 数据库连接失败:', err);
                reject(err);
                return;
            }
            
            console.log('[验证服务] 数据库连接成功');
            
            // 启用WAL模式
            db.run('PRAGMA journal_mode = WAL;');
            
            // 创建表
            db.exec(`
                -- IP访问记录表
                CREATE TABLE IF NOT EXISTS ip_records (
                    ip TEXT PRIMARY KEY,
                    attempt_count INTEGER DEFAULT 0,
                    last_attempt_at DATETIME,
                    banned_until DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                
                -- 验证令牌表
                CREATE TABLE IF NOT EXISTS verification_tokens (
                    token TEXT PRIMARY KEY,
                    ip TEXT NOT NULL,
                    question_id TEXT NOT NULL,
                    question TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    used INTEGER DEFAULT 0
                );
                
                -- 验证记录表
                CREATE TABLE IF NOT EXISTS verification_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ip TEXT NOT NULL,
                    token TEXT NOT NULL,
                    question_id TEXT NOT NULL,
                    user_answer TEXT,
                    is_correct INTEGER,
                    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                
                -- 索引
                CREATE INDEX IF NOT EXISTS idx_ip_records_ip ON ip_records(ip);
                CREATE INDEX IF NOT EXISTS idx_tokens_ip ON verification_tokens(ip);
                CREATE INDEX IF NOT EXISTS idx_records_ip ON verification_records(ip);
            `, (err) => {
                if (err) {
                    console.error('[验证服务] 创建表失败:', err);
                    reject(err);
                } else {
                    console.log('[验证服务] 表创建成功');
                    resolve();
                }
            });
        });
    });
}

/**
 * 加载题库
 */
function loadQuiz() {
    if (quizCache) {
        return quizCache;
    }
    
    try {
        if (!fs.existsSync(QUIZ_FILE)) {
            console.error('[验证服务] 题库文件不存在');
            return null;
        }
        
        const data = fs.readFileSync(QUIZ_FILE, 'utf8');
        quizCache = JSON.parse(data);
        console.log(`[验证服务] 题库加载成功，共 ${quizCache.questions.length} 道题目`);
        return quizCache;
    } catch (error) {
        console.error('[验证服务] 加载题库失败:', error);
        return null;
    }
}

/**
 * 获取随机题目
 */
function getRandomQuestion() {
    const quiz = loadQuiz();
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * quiz.questions.length);
    return quiz.questions[randomIndex];
}

/**
 * 检查IP是否被封禁
 * 
 * @param {string} ip - IP地址
 * @returns {Promise<Object>} 检查结果
 */
async function checkIPStatus(ip) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get(
            'SELECT * FROM ip_records WHERE ip = ?',
            [ip],
            (err, row) => {
                if (err) {
                    console.error('[验证服务] 查询IP失败:', err);
                    resolve({ allowed: true });
                    return;
                }
                
                if (!row) {
                    resolve({ allowed: true, attemptCount: 0 });
                    return;
                }
                
                // 检查是否被封禁
                if (row.banned_until && new Date(row.banned_until) > new Date()) {
                    const remainingTime = Math.ceil((new Date(row.banned_until) - new Date()) / 1000 / 60);
                    resolve({
                        allowed: false,
                        reason: `操作过于频繁，请等待 ${remainingTime} 分钟后再试`,
                        attemptCount: row.attempt_count,
                        bannedUntil: row.banned_until
                    });
                    return;
                }
                
                // 如果封禁已过期，重置计数
                if (row.banned_until && new Date(row.banned_until) <= new Date()) {
                    db.run(
                        'UPDATE ip_records SET attempt_count = 0, banned_until = NULL WHERE ip = ?',
                        [ip]
                    );
                    resolve({ allowed: true, attemptCount: 0 });
                    return;
                }
                
                resolve({ allowed: true, attemptCount: row.attempt_count });
            }
        );
    });
}

/**
 * 记录IP尝试
 * 
 * @param {string} ip - IP地址
 * @returns {Promise<Object>} 记录结果
 */
async function recordIPAttempt(ip) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get(
            'SELECT * FROM ip_records WHERE ip = ?',
            [ip],
            (err, row) => {
                if (err) {
                    console.error('[验证服务] 查询IP失败:', err);
                    resolve({ success: false });
                    return;
                }
                
                const now = new Date().toISOString();
                
                if (!row) {
                    // 新IP，创建记录
                    db.run(
                        'INSERT INTO ip_records (ip, attempt_count, last_attempt_at, created_at) VALUES (?, 1, ?, ?)',
                        [ip, now, now],
                        (err) => {
                            if (err) {
                                console.error('[验证服务] 创建IP记录失败:', err);
                                resolve({ success: false });
                            } else {
                                resolve({ success: true, attemptCount: 1 });
                            }
                        }
                    );
                } else {
                    // 更新现有记录
                    const newCount = row.attempt_count + 1;
                    
                    if (newCount >= CONFIG.maxRetries) {
                        // 达到最大重试次数，封禁IP
                        const bannedUntil = new Date(Date.now() + CONFIG.banDuration).toISOString();
                        
                        db.run(
                            'UPDATE ip_records SET attempt_count = ?, last_attempt_at = ?, banned_until = ? WHERE ip = ?',
                            [newCount, now, bannedUntil, ip],
                            (err) => {
                                if (err) {
                                    console.error('[验证服务] 更新IP记录失败:', err);
                                    resolve({ success: false });
                                } else {
                                    resolve({
                                        success: true,
                                        attemptCount: newCount,
                                        banned: true,
                                        bannedUntil: bannedUntil
                                    });
                                }
                            }
                        );
                    } else {
                        // 更新尝试次数
                        db.run(
                            'UPDATE ip_records SET attempt_count = ?, last_attempt_at = ? WHERE ip = ?',
                            [newCount, now, ip],
                            (err) => {
                                if (err) {
                                    console.error('[验证服务] 更新IP记录失败:', err);
                                    resolve({ success: false });
                                } else {
                                    resolve({ success: true, attemptCount: newCount });
                                }
                            }
                        );
                    }
                }
            }
        );
    });
}

/**
 * 重置IP尝试次数（验证成功后）
 * 
 * @param {string} ip - IP地址
 */
async function resetIPAttempts(ip) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.run(
            'UPDATE ip_records SET attempt_count = 0, banned_until = NULL WHERE ip = ?',
            [ip],
            (err) => {
                if (err) {
                    console.error('[验证服务] 重置IP失败:', err);
                }
                resolve(!err);
            }
        );
    });
}

/**
 * 生成验证令牌
 * 
 * @param {string} ip - IP地址
 * @param {Object} question - 题目对象
 * @returns {string} 验证令牌
 */
async function generateVerificationToken(ip, question) {
    await initDatabase();
    
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = new Date(now + CONFIG.tokenExpiry).toISOString();
    
    return new Promise((resolve) => {
        db.run(
            'INSERT INTO verification_tokens (token, ip, question_id, question, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
            [token, ip, question.id, JSON.stringify(question), new Date(now).toISOString(), expiresAt],
            (err) => {
                if (err) {
                    console.error('[验证服务] 生成令牌失败:', err);
                    resolve(null);
                } else {
                    resolve(token);
                }
            }
        );
    });
}

/**
 * 验证令牌有效性
 * 
 * @param {string} token - 验证令牌
 * @returns {Promise<Object|null>} 令牌信息
 */
async function verifyToken(token) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get(
            'SELECT * FROM verification_tokens WHERE token = ? AND used = 0',
            [token],
            (err, row) => {
                if (err || !row) {
                    resolve(null);
                    return;
                }
                
                // 检查是否过期
                if (new Date(row.expires_at) < new Date()) {
                    resolve(null);
                    return;
                }
                
                // 解析题目信息
                let questionData = null;
                try {
                    questionData = JSON.parse(row.question);
                } catch (e) {
                    questionData = { question: row.question };
                }
                
                resolve({
                    ip: row.ip,
                    questionId: row.question_id,
                    question: questionData.question,
                    answer: questionData.answer,
                    analysis: questionData.analysis
                });
            }
        );
    });
}

/**
 * 标记令牌已使用
 * 
 * @param {string} token - 验证令牌
 */
async function markTokenUsed(token) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.run(
            'UPDATE verification_tokens SET used = 1 WHERE token = ?',
            [token],
            (err) => {
                resolve(!err);
            }
        );
    });
}

/**
 * 使用AI验证答案
 * 
 * @param {string} question - 问题
 * @param {string} userAnswer - 用户答案
 * @param {string} expectedAnswer - 预设答案
 * @param {string} analysis - 解析
 * @returns {Promise<Object>} 验证结果
 */
async function verifyAnswerWithAI(question, userAnswer, expectedAnswer, analysis) {
    try {
        require('dotenv').config();
        
        const apiKey = process.env.DEEPSEEK_API_KEY;
        const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
        
        if (!apiKey) {
            console.error('[验证服务] DeepSeek API Key 未配置');
            return { success: false, error: '验证服务未配置' };
        }
        
        const prompt = `你是一个答案验证助手。请判断用户的答案是否正确。

题目：${question}
预设答案：${expectedAnswer}
解析：${analysis}
用户答案：${userAnswer}

请返回一个简单的JSON格式结果：
{
    "is_correct": true/false,
    "reason": "简短说明原因（10字以内）"
}

注意：
1. 如果用户答案与预设答案意思相同或接近，is_correct为true
2. 如果用户答案包含预设答案的关键词，is_correct为true
3. 如果用户答案明显错误，is_correct为false
4. 只返回JSON，不要有其他内容`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-v4-flash',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
                max_tokens: 100
            })
        });
        
        if (!response.ok) {
            console.error('[验证服务] AI验证请求失败:', response.status);
            return { success: false, error: 'AI验证失败' };
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        try {
            let jsonStr = content;
            if (content.includes('```json')) {
                jsonStr = content.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || content;
            } else if (content.includes('```')) {
                jsonStr = content.match(/```\s*([\s\S]*?)\s*```/)?.[1] || content;
            }
            
            const result = JSON.parse(jsonStr);
            
            return {
                success: true,
                isCorrect: result.is_correct === true,
                reason: result.reason || ''
            };
        } catch (parseError) {
            console.error('[验证服务] 解析AI响应失败:', parseError);
            return { success: false, error: '解析验证结果失败' };
        }
    } catch (error) {
        console.error('[验证服务] AI验证异常:', error);
        return { success: false, error: '验证服务异常' };
    }
}

/**
 * 记录验证结果
 * 
 * @param {string} ip - IP地址
 * @param {string} token - 验证令牌
 * @param {string} questionId - 题目ID
 * @param {string} userAnswer - 用户答案
 * @param {boolean} isCorrect - 是否正确
 */
async function recordVerification(ip, token, questionId, userAnswer, isCorrect) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.run(
            'INSERT INTO verification_records (ip, token, question_id, user_answer, is_correct, verified_at) VALUES (?, ?, ?, ?, ?, ?)',
            [ip, token, questionId, userAnswer, isCorrect ? 1 : 0, new Date().toISOString()],
            (err) => {
                if (err) {
                    console.error('[验证服务] 记录验证结果失败:', err);
                }
                resolve(!err);
            }
        );
    });
}

/**
 * 获取验证统计
 */
async function getVerificationStats() {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get(
            `SELECT 
                (SELECT COUNT(*) FROM verification_records) as total_attempts,
                (SELECT COUNT(*) FROM verification_records WHERE is_correct = 1) as successful_attempts,
                (SELECT COUNT(DISTINCT ip) FROM ip_records) as total_ips,
                (SELECT COUNT(*) FROM ip_records WHERE banned_until > datetime('now')) as banned_ips`,
            [],
            (err, row) => {
                if (err) {
                    console.error('[验证服务] 获取统计失败:', err);
                    resolve(null);
                } else {
                    resolve(row);
                }
            }
        );
    });
}

/**
 * 清理过期数据
 */
async function cleanupExpiredData() {
    await initDatabase();
    
    const now = new Date().toISOString();
    
    // 清理过期令牌
    db.run('DELETE FROM verification_tokens WHERE expires_at < ?', [now]);
    
    // 清理过期封禁
    db.run('UPDATE ip_records SET banned_until = NULL, attempt_count = 0 WHERE banned_until < ?', [now]);
    
    console.log('[验证服务] 过期数据已清理');
}

// 导出模块
module.exports = {
    initDatabase,
    loadQuiz,
    getRandomQuestion,
    checkIPStatus,
    recordIPAttempt,
    resetIPAttempts,
    generateVerificationToken,
    verifyToken,
    markTokenUsed,
    verifyAnswerWithAI,
    recordVerification,
    getVerificationStats,
    cleanupExpiredData
};
