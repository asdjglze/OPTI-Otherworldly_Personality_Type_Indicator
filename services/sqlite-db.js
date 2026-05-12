// 版本号: v1.0.0
/**
 * SQLite数据库服务
 * 
 * 功能: 统一管理所有用户数据，支持并发访问
 * 包含: 用户账号、会话、答卷结果、AI分析、配额管理
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// 数据库文件路径
const DB_DIR = path.join(__dirname, '..', 'data', 'user_data');
const DB_FILE = path.join(DB_DIR, 'mbti.db');

// 数据库连接实例
let db = null;

// 正在进行AI分析的用户集合（内存缓存，防止并发请求）
const analyzingUsers = new Set();

/**
 * 初始化数据库连接
 * 
 * @returns {Promise<void>}
 */
function initDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve();
            return;
        }
        
        // 确保目录存在
        const fs = require('fs');
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
        
        db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                console.error('[SQLite数据库] 连接失败:', err);
                reject(err);
                return;
            }
            
            console.log('[SQLite数据库] 连接成功:', DB_FILE);
            
            // 启用WAL模式，提高并发性能
            db.run('PRAGMA journal_mode = WAL;', (err) => {
                if (err) {
                    console.error('[SQLite数据库] 启用WAL模式失败:', err);
                } else {
                    console.log('[SQLite数据库] WAL模式已启用');
                }
            });
            
            // 创建表
            createTables().then(resolve).catch(reject);
        });
    });
}

/**
 * 创建数据库表
 * 
 * @returns {Promise<void>}
 */
function createTables() {
    return new Promise((resolve, reject) => {
        const sql = `
            -- 用户账号表
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                invite_code TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login_at DATETIME
            );
            
            -- 会话表
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                FOREIGN KEY (username) REFERENCES users(username)
            );
            
            -- 普通答卷结果表
            CREATE TABLE IF NOT EXISTS normal_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                mbti_type TEXT,
                gender TEXT,
                result_json TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (username) REFERENCES users(username)
            );
            
            -- AI分析配额表
            CREATE TABLE IF NOT EXISTS ai_analysis_quota (
                username TEXT PRIMARY KEY,
                analysis_count INTEGER DEFAULT 0,
                last_analysis_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (username) REFERENCES users(username)
            );
            
            -- AI分析结果表
            CREATE TABLE IF NOT EXISTS ai_analysis_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                mbti_type TEXT,
                gender TEXT,
                result_json TEXT NOT NULL,
                used_model TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (username) REFERENCES users(username)
            );
            
            -- 答题进度表（普通答题和AI答题进度分开存储）
            CREATE TABLE IF NOT EXISTS answer_progress (
                username TEXT NOT NULL,
                progress_type TEXT NOT NULL,
                progress_json TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (username, progress_type),
                FOREIGN KEY (username) REFERENCES users(username)
            );
            
            -- 索引
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
            CREATE INDEX IF NOT EXISTS idx_sessions_username ON sessions(username);
            CREATE INDEX IF NOT EXISTS idx_normal_results_username ON normal_results(username);
            CREATE INDEX IF NOT EXISTS idx_normal_results_created ON normal_results(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_ai_quota_username ON ai_analysis_quota(username);
            CREATE INDEX IF NOT EXISTS idx_ai_results_username ON ai_analysis_results(username);
            CREATE INDEX IF NOT EXISTS idx_ai_results_created ON ai_analysis_results(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_progress_username ON answer_progress(username);
        `;
        
        db.exec(sql, (err) => {
            if (err) {
                console.error('[SQLite数据库] 创建表失败:', err);
                reject(err);
                return;
            }
            console.log('[SQLite数据库] 表创建成功');
            resolve();
        });
    });
}

/**
 * 生成密码哈希
 * 
 * @param {string} password - 原始密码
 * @param {string} salt - 盐值
 * @returns {string} 密码哈希
 */
function hashPassword(password, salt) {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

/**
 * 生成会话token
 * 
 * @returns {string} 会话token
 */
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// ==================== 用户认证相关 ====================

/**
 * 用户注册
 * 
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} inviteCode - 邀请码
 * @returns {Promise<Object>} 注册结果
 */
async function register(username, password, inviteCode) {
    await initDatabase();
    
    if (!username || username.length < 3) {
        return { success: false, error: '用户名至少需要3个字符' };
    }
    
    if (!password || password.length < 6) {
        return { success: false, error: '密码至少需要6个字符' };
    }
    
    // 验证邀请码
    const inviteCodeService = require('./invite-code');
    const codeValidation = inviteCodeService.verifyInviteCode(inviteCode);
    
    if (!codeValidation.valid) {
        return { success: false, error: codeValidation.error };
    }
    
    return new Promise((resolve) => {
        // 检查用户名是否已存在
        db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error('[SQLite数据库] 查询失败:', err);
                resolve({ success: false, error: '注册失败，请稍后重试' });
                return;
            }
            
            if (row) {
                resolve({ success: false, error: '用户名已存在' });
                return;
            }
            
            // 生成盐值和密码哈希
            const salt = crypto.randomBytes(16).toString('hex');
            const passwordHash = hashPassword(password, salt);
            
            // 创建用户
            db.run(
                'INSERT INTO users (username, password_hash, salt, invite_code, created_at) VALUES (?, ?, ?, ?, ?)',
                [username, passwordHash, salt, inviteCode, new Date().toISOString()],
                (err) => {
                    if (err) {
                        console.error('[SQLite数据库] 创建用户失败:', err);
                        resolve({ success: false, error: '注册失败，请稍后重试' });
                        return;
                    }
                    
                    // 使用邀请码
                    const useResult = inviteCodeService.useInviteCode(inviteCode, username);
                    
                    if (!useResult.success) {
                        console.error('[SQLite数据库] 使用邀请码失败:', useResult.error);
                        // 注册成功但邀请码使用失败，记录日志
                    }
                    
                    console.log('[SQLite数据库] 用户注册成功:', username, ', 邀请码:', inviteCode);
                    resolve({ success: true, message: '注册成功' });
                }
            );
        });
    });
}

/**
 * 用户登录
 * 
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<Object>} 登录结果
 */
async function login(username, password) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
            if (err) {
                console.error('[SQLite数据库] 查询失败:', err);
                resolve({ success: false, error: '登录失败，请稍后重试' });
                return;
            }
            
            if (!user) {
                resolve({ success: false, error: '用户名或密码错误' });
                return;
            }
            
            // 验证密码
            const passwordHash = hashPassword(password, user.salt);
            if (passwordHash !== user.password_hash) {
                resolve({ success: false, error: '用户名或密码错误' });
                return;
            }
            
            // 生成会话token
            const token = generateToken();
            const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7天有效期
            
            // 保存会话
            db.run(
                'INSERT INTO sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)',
                [token, username, Date.now(), expiresAt],
                (err) => {
                    if (err) {
                        console.error('[SQLite数据库] 保存会话失败:', err);
                        resolve({ success: false, error: '登录失败，请稍后重试' });
                        return;
                    }
                    
                    // 更新最后登录时间
                    db.run(
                        'UPDATE users SET last_login_at = ? WHERE username = ?',
                        [new Date().toISOString(), username]
                    );
                    
                    console.log('[SQLite数据库] 用户登录成功:', username);
                    
                    resolve({
                        success: true,
                        token: token,
                        expiresAt: expiresAt,
                        username: username
                    });
                }
            );
        });
    });
}

/**
 * 验证会话
 * 
 * @param {string} token - 会话token
 * @returns {Promise<Object|null>} 用户信息或null
 */
async function verifySession(token) {
    if (!token) return null;
    
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get(
            `SELECT s.*, u.created_at as user_created_at, u.last_login_at 
             FROM sessions s 
             JOIN users u ON s.username = u.username 
             WHERE s.token = ?`,
            [token],
            (err, session) => {
                if (err || !session) {
                    resolve(null);
                    return;
                }
                
                // 检查是否过期
                if (Date.now() > session.expires_at) {
                    // 删除过期会话
                    db.run('DELETE FROM sessions WHERE token = ?', [token]);
                    resolve(null);
                    return;
                }
                
                resolve({
                    username: session.username,
                    createdAt: session.user_created_at,
                    lastLoginAt: session.last_login_at
                });
            }
        );
    });
}

/**
 * 用户登出
 * 
 * @param {string} token - 会话token
 * @returns {Promise<boolean>} 是否成功
 */
async function logout(token) {
    if (!token) return false;
    
    await initDatabase();
    
    return new Promise((resolve) => {
        db.run('DELETE FROM sessions WHERE token = ?', [token], (err) => {
            if (err) {
                console.error('[SQLite数据库] 删除会话失败:', err);
                resolve(false);
                return;
            }
            console.log('[SQLite数据库] 用户登出成功');
            resolve(true);
        });
    });
}

// ==================== 普通答卷结果相关 ====================

/**
 * 保存用户答卷结果
 * 
 * @param {string} username - 用户名
 * @param {Object} result - 答卷结果
 * @returns {Promise<boolean>} 是否成功
 */
async function saveResult(username, result) {
    await initDatabase();
    
    return new Promise((resolve) => {
        const resultJson = JSON.stringify(result);
        const now = new Date().toISOString();
        
        db.run(
            'INSERT INTO normal_results (username, mbti_type, gender, result_json, created_at) VALUES (?, ?, ?, ?, ?)',
            [username, result.type, result.gender, resultJson, now],
            (err) => {
                if (err) {
                    console.error('[SQLite数据库] 保存答卷失败:', err);
                    resolve(false);
                    return;
                }
                console.log('[SQLite数据库] 保存答卷成功, 用户:', username);
                resolve(true);
            }
        );
    });
}

/**
 * 获取用户所有答卷结果（简化数据，用于列表显示）
 * 
 * @param {string} username - 用户名
 * @returns {Promise<Array>} 答卷结果列表
 */
async function getResults(username) {
    await initDatabase();
    
    return new Promise((resolve) => {
        // 使用 UNION ALL 一次查询两个表，更高效
        // 只查询列表需要的字段，不解析完整 JSON
        const sql = `
            SELECT 
                mbti_type as type,
                gender,
                created_at as savedAt,
                'normal' as source
            FROM normal_results 
            WHERE username = ?
            
            UNION ALL
            
            SELECT 
                mbti_type as type,
                gender,
                created_at as savedAt,
                'ai' as source
            FROM ai_analysis_results 
            WHERE username = ?
            
            ORDER BY savedAt DESC
            LIMIT 50
        `;
        
        db.all(sql, [username, username], (err, rows) => {
            if (err) {
                console.error('[SQLite数据库] 查询答卷列表失败:', err);
                resolve([]);
                return;
            }
            
            // 简化结果，前端只需要这些字段显示列表
            const results = rows.map(row => ({
                type: row.type,
                gender: row.gender,
                savedAt: row.savedAt,
                isAIAnalysis: row.source === 'ai'
            }));
            
            resolve(results);
        });
    });
}

/**
 * 获取指定答卷的完整详情
 * 
 * @param {string} username - 用户名
 * @param {number} index - 答卷索引（按时间倒序）
 * @returns {Promise<Object|null>} 完整的答卷结果
 */
async function getResultDetail(username, index) {
    await initDatabase();
    
    return new Promise((resolve) => {
        // 先获取索引对应的记录
        const sql = `
            SELECT 
                result_json,
                mbti_type as type,
                gender,
                created_at as savedAt,
                'normal' as source
            FROM normal_results 
            WHERE username = ?
            
            UNION ALL
            
            SELECT 
                result_json,
                mbti_type as type,
                gender,
                created_at as savedAt,
                'ai' as source
            FROM ai_analysis_results 
            WHERE username = ?
            
            ORDER BY savedAt DESC
            LIMIT 1 OFFSET ?
        `;
        
        db.get(sql, [username, username, index], (err, row) => {
            if (err || !row) {
                console.error('[SQLite数据库] 查询答卷详情失败:', err);
                resolve(null);
                return;
            }
            
            try {
                const result = JSON.parse(row.result_json);
                result.savedAt = row.savedAt;
                result.isAIAnalysis = row.source === 'ai';
                resolve(result);
            } catch (e) {
                console.error('[SQLite数据库] 解析答卷JSON失败:', e);
                resolve(null);
            }
        });
    });
}

// ==================== AI分析相关 ====================

/**
 * 检查用户是否可以进行AI分析
 * 
 * @param {string} username - 用户名
 * @returns {Promise<Object>} 检查结果
 */
async function canUserAnalyze(username) {
    await initDatabase();
    
    // 如果用户正在分析中，禁止再次请求
    if (analyzingUsers.has(username)) {
        return {
            canAnalyze: false,
            reason: '您正在进行AI分析，请等待当前分析完成',
            remainingCount: 0
        };
    }
    
    return new Promise((resolve) => {
        db.get(
            'SELECT analysis_count FROM ai_analysis_quota WHERE username = ?',
            [username],
            (err, row) => {
                if (err) {
                    console.error('[SQLite数据库] 查询配额失败:', err);
                    resolve({ canAnalyze: false, reason: '查询失败', remainingCount: 0 });
                    return;
                }
                
                if (!row) {
                    resolve({ canAnalyze: true, reason: '首次分析', remainingCount: 1 });
                } else if (row.analysis_count >= 1) {
                    resolve({ canAnalyze: false, reason: '您已经使用过AI分析功能，每位用户仅限一次', remainingCount: 0 });
                } else {
                    resolve({ canAnalyze: true, reason: '剩余分析次数', remainingCount: 1 - row.analysis_count });
                }
            }
        );
    });
}

/**
 * 标记用户开始AI分析
 * 
 * @param {string} username - 用户名
 */
function startAnalysis(username) {
    analyzingUsers.add(username);
    console.log('[SQLite数据库] 用户开始分析:', username);
}

/**
 * 取消用户分析标记
 * 
 * @param {string} username - 用户名
 */
function cancelAnalysis(username) {
    analyzingUsers.delete(username);
    console.log('[SQLite数据库] 用户取消分析:', username);
}

/**
 * 记录AI分析结果并扣减次数
 * 
 * @param {string} username - 用户名
 * @param {Object} result - 分析结果
 * @returns {Promise<boolean>} 是否成功
 */
async function recordAnalysisResult(username, result) {
    await initDatabase();
    
    return new Promise((resolve) => {
        const resultJson = JSON.stringify(result);
        const now = new Date().toISOString();
        const usedModel = result.usedModel ? `${result.usedModel.provider}/${result.usedModel.model}` : 'unknown';
        
        db.serialize(() => {
            db.run('BEGIN TRANSACTION;');
            
            // 插入分析结果
            db.run(
                'INSERT INTO ai_analysis_results (username, mbti_type, gender, result_json, used_model, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [username, result.type, result.gender, resultJson, usedModel, now],
                (err) => {
                    if (err) {
                        db.run('ROLLBACK;');
                        analyzingUsers.delete(username);
                        console.error('[SQLite数据库] 保存AI结果失败:', err);
                        resolve(false);
                        return;
                    }
                    
                    // 更新配额
                    db.run(
                        `INSERT INTO ai_analysis_quota (username, analysis_count, last_analysis_at, created_at) VALUES (?, 1, ?, ?)
                         ON CONFLICT(username) DO UPDATE SET analysis_count = analysis_count + 1, last_analysis_at = excluded.last_analysis_at`,
                        [username, now, now],
                        (err) => {
                            if (err) {
                                db.run('ROLLBACK;');
                                analyzingUsers.delete(username);
                                console.error('[SQLite数据库] 更新配额失败:', err);
                                resolve(false);
                                return;
                            }
                            
                            db.run('COMMIT;', (err) => {
                                analyzingUsers.delete(username);
                                if (err) {
                                    console.error('[SQLite数据库] 提交事务失败:', err);
                                    resolve(false);
                                    return;
                                }
                                console.log('[SQLite数据库] AI分析结果已保存, 用户:', username);
                                resolve(true);
                            });
                        }
                    );
                }
            );
        });
    });
}

/**
 * 获取用户AI分析历史
 * 
 * @param {string} username - 用户名
 * @returns {Promise<Array>} 分析结果列表
 */
async function getUserAnalysisHistory(username) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.all(
            'SELECT result_json, mbti_type, gender, used_model, created_at FROM ai_analysis_results WHERE username = ? ORDER BY created_at DESC',
            [username],
            (err, rows) => {
                if (err) {
                    console.error('[SQLite数据库] 查询AI历史失败:', err);
                    resolve([]);
                    return;
                }
                
                const results = rows.map(row => {
                    try {
                        const result = JSON.parse(row.result_json);
                        result.savedAt = row.created_at;
                        return result;
                    } catch (e) {
                        return null;
                    }
                }).filter(r => r !== null);
                
                resolve(results);
            }
        );
    });
}

/**
 * 获取用户剩余分析次数
 * 
 * @param {string} username - 用户名
 * @returns {Promise<number>} 剩余次数
 */
async function getRemainingQuota(username) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get(
            'SELECT analysis_count FROM ai_analysis_quota WHERE username = ?',
            [username],
            (err, row) => {
                if (err || !row) {
                    resolve(1);
                } else {
                    resolve(Math.max(0, 1 - row.analysis_count));
                }
            }
        );
    });
}

// ==================== 答题进度相关 ====================

/**
 * 保存答题进度
 * 
 * @param {string} username - 用户名
 * @param {string} progressType - 进度类型 (normal/ai)
 * @param {Object} progress - 进度数据
 * @returns {Promise<boolean>} 是否成功
 */
async function saveProgress(username, progressType, progress) {
    await initDatabase();
    
    return new Promise((resolve) => {
        const progressJson = JSON.stringify(progress);
        const now = new Date().toISOString();
        
        db.run(
            `INSERT INTO answer_progress (username, progress_type, progress_json, updated_at) VALUES (?, ?, ?, ?)
             ON CONFLICT(username, progress_type) DO UPDATE SET progress_json = excluded.progress_json, updated_at = excluded.updated_at`,
            [username, progressType, progressJson, now],
            (err) => {
                if (err) {
                    console.error('[SQLite数据库] 保存进度失败:', err);
                    resolve(false);
                    return;
                }
                console.log('[SQLite数据库] 保存进度成功, 用户:', username, ', 类型:', progressType);
                resolve(true);
            }
        );
    });
}

/**
 * 获取答题进度
 * 
 * @param {string} username - 用户名
 * @param {string} progressType - 进度类型 (normal/ai)
 * @returns {Promise<Object|null>} 进度数据
 */
async function getProgress(username, progressType) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get(
            'SELECT progress_json, progress_type FROM answer_progress WHERE username = ? AND progress_type = ?',
            [username, progressType],
            (err, row) => {
                if (err || !row) {
                    resolve(null);
                    return;
                }
                
                try {
                    const progress = JSON.parse(row.progress_json);
                    progress.progressType = row.progress_type;
                    resolve(progress);
                } catch (e) {
                    resolve(null);
                }
            }
        );
    });
}

/**
 * 获取进度元数据（不返回完整数据，用于快速检查）
 * 
 * @param {string} username - 用户名
 * @param {string} progressType - 进度类型 (normal/ai)
 * @returns {Promise<Object|null>} 进度元数据
 */
async function getProgressMeta(username, progressType) {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get(
            'SELECT progress_json, updated_at FROM answer_progress WHERE username = ? AND progress_type = ?',
            [username, progressType],
            (err, row) => {
                if (err || !row) {
                    resolve(null);
                    return;
                }
                
                try {
                    const progress = JSON.parse(row.progress_json);
                    
                    if (progressType === 'normal') {
                        // 普通答题进度
                        const answeredCount = progress.answers ? progress.answers.filter(a => a !== null && a !== undefined).length : 0;
                        resolve({
                            savedAt: row.updated_at,
                            questionSet: progress.questionSet,
                            answeredCount: answeredCount
                        });
                    } else {
                        // AI答题进度
                        const answeredCount = Object.keys(progress.answers || {}).length;
                        const totalCount = progress.questions ? progress.questions.length : 0;
                        resolve({
                            savedAt: row.updated_at,
                            answeredCount: answeredCount,
                            totalCount: totalCount
                        });
                    }
                } catch (e) {
                    resolve(null);
                }
            }
        );
    });
}

/**
 * 清除答题进度
 * 
 * @param {string} username - 用户名
 * @param {string} progressType - 进度类型 (normal/ai/all)，默认为 'all'
 * @returns {Promise<boolean>} 是否成功
 */
async function clearProgress(username, progressType = 'all') {
    await initDatabase();
    
    return new Promise((resolve) => {
        let sql, params;
        
        if (progressType === 'all') {
            sql = 'DELETE FROM answer_progress WHERE username = ?';
            params = [username];
        } else {
            sql = 'DELETE FROM answer_progress WHERE username = ? AND progress_type = ?';
            params = [username, progressType];
        }
        
        db.run(sql, params, (err) => {
            if (err) {
                console.error('[SQLite数据库] 清除进度失败:', err);
                resolve(false);
                return;
            }
            console.log('[SQLite数据库] 清除进度成功, 用户:', username, ', 类型:', progressType);
            resolve(true);
        });
    });
}

// ==================== 统计和清理 ====================

/**
 * 清理过期会话
 */
async function cleanupExpiredSessions() {
    await initDatabase();
    
    const now = Date.now();
    db.run('DELETE FROM sessions WHERE expires_at < ?', [now], function(err) {
        if (err) {
            console.error('[SQLite数据库] 清理会话失败:', err);
        } else if (this.changes > 0) {
            console.log('[SQLite数据库] 清理过期会话:', this.changes, '个');
        }
    });
}

/**
 * 获取统计信息
 * 
 * @returns {Promise<Object>} 统计信息
 */
async function getStats() {
    await initDatabase();
    
    return new Promise((resolve) => {
        db.get(
            `SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM normal_results) as total_normal_results,
                (SELECT COUNT(*) FROM ai_analysis_results) as total_ai_results`,
            [],
            (err, row) => {
                if (err) {
                    console.error('[SQLite数据库] 查询统计失败:', err);
                    resolve({ totalUsers: 0, totalNormalResults: 0, totalAiResults: 0 });
                    return;
                }
                
                resolve({
                    totalUsers: row.total_users || 0,
                    totalNormalResults: row.total_normal_results || 0,
                    totalAiResults: row.total_ai_results || 0
                });
            }
        );
    });
}

/**
 * 关闭数据库连接
 */
function closeDatabase() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('[SQLite数据库] 关闭失败:', err);
            } else {
                console.log('[SQLite数据库] 连接已关闭');
            }
            db = null;
        });
    }
}

// 启动时清理过期会话
cleanupExpiredSessions();

// 每小时清理一次
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// 导出模块
module.exports = {
    initDatabase,
    // 用户认证
    register,
    login,
    logout,
    verifySession,
    // 普通答卷
    saveResult,
    getResults,
    getResultDetail,
    // AI分析
    canUserAnalyze,
    startAnalysis,
    cancelAnalysis,
    recordAnalysisResult,
    getUserAnalysisHistory,
    getRemainingQuota,
    // 答题进度
    saveProgress,
    getProgress,
    getProgressMeta,
    clearProgress,
    // 统计
    getStats,
    closeDatabase
};
