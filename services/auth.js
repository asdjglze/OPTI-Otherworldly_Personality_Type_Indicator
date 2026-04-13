// 版本号: v1.0.0
/**
 * 用户认证服务
 * 
 * 功能: 处理用户注册、登录、会话管理
 * 存储: 用户账号信息、会话cookie
 * 并发安全: 使用内存缓存 + 写入锁
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 数据库文件路径
const DB_DIR = path.join(__dirname, '..', 'data', 'user_data');
const USERS_FILE = path.join(DB_DIR, 'users.json');

// 确保目录存在
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// 内存缓存
let dbCache = null;
let isWriting = false;
let writeQueue = [];

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

/**
 * 加载用户数据库（使用内存缓存）
 * 
 * @returns {Object} 用户数据库
 */
function loadDatabase() {
    // 优先使用内存缓存
    if (dbCache) {
        return dbCache;
    }
    
    try {
        if (fs.existsSync(USERS_FILE)) {
            const content = fs.readFileSync(USERS_FILE, 'utf8');
            dbCache = JSON.parse(content);
            return dbCache;
        }
    } catch (error) {
        console.error('[用户认证] 加载数据库失败:', error);
    }
    
    dbCache = { users: {}, sessions: {} };
    return dbCache;
}

/**
 * 保存用户数据库（带写入锁）
 * 
 * @param {Object} db - 数据库对象
 * @param {Function} callback - 保存完成回调
 */
function saveDatabase(db, callback) {
    // 更新内存缓存
    dbCache = db;
    
    // 如果正在写入，加入队列
    if (isWriting) {
        writeQueue.push({ db: db, callback: callback });
        return;
    }
    
    isWriting = true;
    
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2), 'utf8');
        console.log('[用户认证] 数据库保存成功');
        
        if (callback) callback(true);
    } catch (error) {
        console.error('[用户认证] 保存数据库失败:', error);
        if (callback) callback(false);
    }
    
    isWriting = false;
    
    // 处理队列中的写入请求
    if (writeQueue.length > 0) {
        const next = writeQueue.shift();
        // 使用最新的数据（队列中最后一个）
        while (writeQueue.length > 0) {
            const skipped = writeQueue.shift();
            if (skipped.callback) skipped.callback(true);
        }
        saveDatabase(next.db, next.callback);
    }
}

/**
 * 用户注册
 * 
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Object} 注册结果
 */
function register(username, password) {
    if (!username || username.length < 3) {
        return { success: false, error: '用户名至少需要3个字符' };
    }
    
    if (!password || password.length < 6) {
        return { success: false, error: '密码至少需要6个字符' };
    }
    
    const db = loadDatabase();
    
    // 检查用户名是否已存在
    if (db.users[username]) {
        return { success: false, error: '用户名已存在' };
    }
    
    // 生成盐值和密码哈希
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    
    // 创建用户
    db.users[username] = {
        username: username,
        passwordHash: passwordHash,
        salt: salt,
        createdAt: new Date().toISOString(),
        // 用户数据
        results: [],      // 已提交的答卷（上限50条）
        normalProgress: null,  // 普通答题进度
        aiProgress: null       // AI答题进度
    };
    
    saveDatabase(db);
    
    console.log('[用户认证] 用户注册成功:', username);
    
    return { success: true, message: '注册成功' };
}

/**
 * 用户登录
 * 
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Object} 登录结果（包含token）
 */
function login(username, password) {
    const db = loadDatabase();
    
    // 检查用户是否存在
    if (!db.users[username]) {
        return { success: false, error: '用户名或密码错误' };
    }
    
    const user = db.users[username];
    
    // 验证密码
    const passwordHash = hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) {
        return { success: false, error: '用户名或密码错误' };
    }
    
    // 生成会话token
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7天有效期
    
    // 保存会话
    db.sessions[token] = {
        username: username,
        createdAt: Date.now(),
        expiresAt: expiresAt
    };
    
    // 更新用户最后登录时间
    user.lastLoginAt = new Date().toISOString();
    
    saveDatabase(db);
    
    console.log('[用户认证] 用户登录成功:', username);
    
    return {
        success: true,
        token: token,
        expiresAt: expiresAt,
        username: username
    };
}

/**
 * 验证会话
 * 
 * @param {string} token - 会话token
 * @returns {Object|null} 用户信息或null
 */
function verifySession(token) {
    if (!token) return null;
    
    const db = loadDatabase();
    const session = db.sessions[token];
    
    if (!session) return null;
    
    // 检查是否过期
    if (Date.now() > session.expiresAt) {
        // 删除过期会话
        delete db.sessions[token];
        saveDatabase(db);
        return null;
    }
    
    // 获取用户信息
    const user = db.users[session.username];
    if (!user) return null;
    
    return {
        username: user.username,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
    };
}

/**
 * 用户登出
 * 
 * @param {string} token - 会话token
 * @returns {boolean} 是否成功
 */
function logout(token) {
    if (!token) return false;
    
    const db = loadDatabase();
    
    if (db.sessions[token]) {
        delete db.sessions[token];
        saveDatabase(db);
        console.log('[用户认证] 用户登出成功');
        return true;
    }
    
    return false;
}

/**
 * 获取用户完整数据
 * 
 * @param {string} username - 用户名
 * @returns {Object|null} 用户数据
 */
function getUserData(username) {
    const db = loadDatabase();
    return db.users[username] || null;
}

/**
 * 保存用户答卷结果
 * 
 * @param {string} username - 用户名
 * @param {Object} result - 答卷结果
 * @returns {boolean} 是否成功
 */
function saveResult(username, result) {
    const db = loadDatabase();
    const user = db.users[username];
    
    if (!user) return false;
    
    // 添加时间戳
    result.savedAt = new Date().toISOString();
    result.username = username;
    
    // 添加到结果列表
    user.results.unshift(result);
    
    // 限制最多50条
    if (user.results.length > 50) {
        user.results = user.results.slice(0, 50);
    }
    
    saveDatabase(db);
    console.log('[用户认证] 保存答卷成功, 用户:', username, ', 总数:', user.results.length);
    
    return true;
}

/**
 * 获取用户所有答卷结果
 * 
 * @param {string} username - 用户名
 * @returns {Array} 答卷结果列表
 */
function getResults(username) {
    const db = loadDatabase();
    const user = db.users[username];
    
    return user ? user.results : [];
}

/**
 * 获取用户指定答卷结果
 * 
 * @param {string} username - 用户名
 * @param {number} index - 答卷索引
 * @returns {Object|null} 答卷结果
 */
function getResultByIndex(username, index) {
    const db = loadDatabase();
    const user = db.users[username];
    
    if (!user || !user.results[index]) return null;
    
    return user.results[index];
}

/**
 * 保存普通答题进度
 * 
 * @param {string} username - 用户名
 * @param {Object} progress - 进度数据
 * @returns {boolean} 是否成功
 */
function saveNormalProgress(username, progress) {
    const db = loadDatabase();
    const user = db.users[username];
    
    if (!user) return false;
    
    progress.savedAt = new Date().toISOString();
    user.normalProgress = progress;
    
    saveDatabase(db);
    console.log('[用户认证] 保存普通答题进度成功, 用户:', username);
    
    return true;
}

/**
 * 获取普通答题进度
 * 
 * @param {string} username - 用户名
 * @returns {Object|null} 进度数据
 */
function getNormalProgress(username) {
    const db = loadDatabase();
    const user = db.users[username];
    
    return user ? user.normalProgress : null;
}

/**
 * 清除普通答题进度
 * 
 * @param {string} username - 用户名
 * @returns {boolean} 是否成功
 */
function clearNormalProgress(username) {
    const db = loadDatabase();
    const user = db.users[username];
    
    if (!user) return false;
    
    user.normalProgress = null;
    saveDatabase(db);
    
    return true;
}

/**
 * 保存AI答题进度
 * 
 * @param {string} username - 用户名
 * @param {Object} progress - 进度数据
 * @returns {boolean} 是否成功
 */
function saveAIProgress(username, progress) {
    const db = loadDatabase();
    const user = db.users[username];
    
    if (!user) return false;
    
    progress.savedAt = new Date().toISOString();
    user.aiProgress = progress;
    
    saveDatabase(db);
    console.log('[用户认证] 保存AI答题进度成功, 用户:', username);
    
    return true;
}

/**
 * 获取AI答题进度
 * 
 * @param {string} username - 用户名
 * @returns {Object|null} 进度数据
 */
function getAIProgress(username) {
    const db = loadDatabase();
    const user = db.users[username];
    
    return user ? user.aiProgress : null;
}

/**
 * 清除AI答题进度
 * 
 * @param {string} username - 用户名
 * @returns {boolean} 是否成功
 */
function clearAIProgress(username) {
    const db = loadDatabase();
    const user = db.users[username];
    
    if (!user) return false;
    
    user.aiProgress = null;
    saveDatabase(db);
    
    return true;
}

/**
 * 清理过期会话
 */
function cleanupExpiredSessions() {
    const db = loadDatabase();
    const now = Date.now();
    let cleaned = 0;
    
    for (const token in db.sessions) {
        if (db.sessions[token].expiresAt < now) {
            delete db.sessions[token];
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        saveDatabase(db);
        console.log('[用户认证] 清理过期会话:', cleaned, '个');
    }
}

// 启动时清理过期会话
cleanupExpiredSessions();

// 每小时清理一次
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

module.exports = {
    register,
    login,
    logout,
    verifySession,
    getUserData,
    saveResult,
    getResults,
    getResultByIndex,
    saveNormalProgress,
    getNormalProgress,
    clearNormalProgress,
    saveAIProgress,
    getAIProgress,
    clearAIProgress
};
