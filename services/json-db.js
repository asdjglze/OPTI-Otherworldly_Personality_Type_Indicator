// 版本号: v1.0.0
/**
 * JSON数据库服务
 * 
 * 功能: 存储用户AI分析结果
 * 存储: 使用用户UA+IP哈希作为唯一标识
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 数据库文件路径
const DB_DIR = path.join(__dirname, '..', 'data', 'user_results');
const DB_FILE = path.join(DB_DIR, 'results.json');

// 确保目录存在
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

/**
 * 生成用户唯一标识
 * 
 * @param {string} userAgent - 用户UA
 * @param {string} ip - 用户IP
 * @returns {string} 用户唯一标识（哈希值）
 */
function generateUserId(userAgent, ip) {
    const raw = `${userAgent || 'unknown'}|${ip || 'unknown'}`;
    return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
}

/**
 * 加载数据库
 * 
 * @returns {Object} 数据库对象
 */
function loadDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const content = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('[JSON数据库] 加载失败:', error);
    }
    return { users: {} };
}

/**
 * 保存数据库
 * 
 * @param {Object} db - 数据库对象
 */
function saveDatabase(db) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
        console.log('[JSON数据库] 保存成功');
    } catch (error) {
        console.error('[JSON数据库] 保存失败:', error);
    }
}

/**
 * 保存用户结果
 * 
 * @param {string} userAgent - 用户UA
 * @param {string} ip - 用户IP
 * @param {Object} result - 分析结果
 * @returns {string} 用户ID
 */
function saveResult(userAgent, ip, result) {
    const userId = generateUserId(userAgent, ip);
    const db = loadDatabase();
    
    // 添加时间戳
    const resultWithMeta = {
        ...result,
        savedAt: new Date().toISOString(),
        userId: userId
    };
    
    // 保存结果（保留最近10条）
    if (!db.users[userId]) {
        db.users[userId] = {
            results: [],
            userAgent: userAgent
        };
    }
    
    db.users[userId].results.unshift(resultWithMeta);
    
    // 只保留最近10条
    if (db.users[userId].results.length > 10) {
        db.users[userId].results = db.users[userId].results.slice(0, 10);
    }
    
    // 更新最后活跃时间
    db.users[userId].lastActive = new Date().toISOString();
    
    saveDatabase(db);
    
    console.log('[JSON数据库] 用户结果已保存, userId:', userId);
    
    return userId;
}

/**
 * 获取用户最新结果
 * 
 * @param {string} userAgent - 用户UA
 * @param {string} ip - 用户IP
 * @returns {Object|null} 最新结果或null
 */
function getLatestResult(userAgent, ip) {
    const userId = generateUserId(userAgent, ip);
    const db = loadDatabase();
    
    if (db.users[userId] && db.users[userId].results.length > 0) {
        console.log('[JSON数据库] 找到用户最新结果, userId:', userId);
        return db.users[userId].results[0];
    }
    
    console.log('[JSON数据库] 未找到用户结果, userId:', userId);
    return null;
}

/**
 * 获取用户所有结果
 * 
 * @param {string} userAgent - 用户UA
 * @param {string} ip - 用户IP
 * @returns {Array} 结果数组
 */
function getAllResults(userAgent, ip) {
    const userId = generateUserId(userAgent, ip);
    const db = loadDatabase();
    
    if (db.users[userId]) {
        return db.users[userId].results;
    }
    
    return [];
}

/**
 * 清理过期数据（超过30天）
 * 注意：此功能已禁用，用户数据永久保存
 */
function cleanupOldData() {
    // 已禁用自动清理，用户数据永久保存
    console.log('[JSON数据库] 自动清理已禁用，数据永久保存');
}

// 启动时不再自动清理
// cleanupOldData();

// 不再定时清理
// setInterval(cleanupOldData, 24 * 60 * 60 * 1000);

module.exports = {
    generateUserId,
    saveResult,
    getLatestResult,
    getAllResults,
    cleanupOldData
};
