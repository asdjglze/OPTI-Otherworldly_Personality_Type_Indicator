// 版本号: v1.0.0
/**
 * 管理员认证服务
 * 
 * 功能: 管理员账号登录、令牌生成和验证
 * 安全: 使用SHA256哈希存储密码，令牌使用不可逆哈希
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 管理员数据文件路径
const ADMIN_FILE = path.join(__dirname, '..', 'data', 'admin_accounts.json');

// 令牌有效期（24小时）
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * 加载管理员数据
 * 
 * @returns {Object} 管理员数据
 */
function loadAdminData() {
    try {
        if (!fs.existsSync(ADMIN_FILE)) {
            // 创建默认管理员账号
            const defaultData = {
                admins: [
                    {
                        id: 1,
                        username: 'mbti_admin_2026',
                        passwordHash: hashPassword('Mbti@Admin#2026!Secure', 'default_salt'),
                        salt: 'default_salt',
                        createdAt: new Date().toISOString(),
                        lastLoginAt: null
                    }
                ],
                tokens: [],
                createdAt: new Date().toISOString()
            };
            fs.writeFileSync(ADMIN_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
            console.log('[管理员服务] 创建默认管理员账号: mbti_admin_2026 / Mbti@Admin#2026!Secure');
            return defaultData;
        }
        
        const data = fs.readFileSync(ADMIN_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[管理员服务] 加载管理员数据失败:', error);
        return { admins: [], tokens: [], createdAt: new Date().toISOString() };
    }
}

/**
 * 保存管理员数据
 * 
 * @param {Object} data - 管理员数据
 * @returns {boolean} 是否成功
 */
function saveAdminData(data) {
    try {
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('[管理员服务] 保存管理员数据失败:', error);
        return false;
    }
}

/**
 * 密码哈希
 * 
 * @param {string} password - 原始密码
 * @param {string} salt - 盐值
 * @returns {string} 哈希值
 */
function hashPassword(password, salt) {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

/**
 * 生成令牌哈希（不可逆）
 * 
 * @param {string} username - 用户名
 * @param {string} timestamp - 时间戳
 * @param {string} randomStr - 随机字符串
 * @returns {string} 令牌哈希
 */
function generateTokenHash(username, timestamp, randomStr) {
    const data = `${username}|${timestamp}|${randomStr}|${crypto.randomBytes(16).toString('hex')}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 管理员登录
 * 
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Object} 登录结果
 */
function login(username, password) {
    const data = loadAdminData();
    
    const admin = data.admins.find(a => a.username === username);
    
    if (!admin) {
        return { success: false, error: '用户名或密码错误' };
    }
    
    const passwordHash = hashPassword(password, admin.salt);
    
    if (passwordHash !== admin.passwordHash) {
        return { success: false, error: '用户名或密码错误' };
    }
    
    // 生成令牌
    const timestamp = Date.now().toString();
    const randomStr = crypto.randomBytes(16).toString('hex');
    const tokenHash = generateTokenHash(username, timestamp, randomStr);
    
    // 保存令牌
    const token = {
        hash: tokenHash,
        adminId: admin.id,
        username: admin.username,
        createdAt: timestamp,
        expiresAt: Date.now() + TOKEN_EXPIRY
    };
    
    data.tokens.push(token);
    
    // 清理过期令牌
    data.tokens = data.tokens.filter(t => t.expiresAt > Date.now());
    
    // 更新最后登录时间
    const adminIndex = data.admins.findIndex(a => a.id === admin.id);
    if (adminIndex !== -1) {
        data.admins[adminIndex].lastLoginAt = new Date().toISOString();
    }
    
    saveAdminData(data);
    
    console.log('[管理员服务] 管理员登录成功:', username);
    
    return {
        success: true,
        token: tokenHash,
        expiresAt: token.expiresAt,
        username: admin.username
    };
}

/**
 * 验证管理员令牌
 * 
 * @param {string} tokenHash - 令牌哈希
 * @returns {Object} 验证结果
 */
function verifyToken(tokenHash) {
    if (!tokenHash) {
        return { valid: false, error: '未提供令牌' };
    }
    
    const data = loadAdminData();
    
    const token = data.tokens.find(t => t.hash === tokenHash);
    
    if (!token) {
        return { valid: false, error: '令牌无效' };
    }
    
    if (token.expiresAt < Date.now()) {
        // 删除过期令牌
        data.tokens = data.tokens.filter(t => t.expiresAt > Date.now());
        saveAdminData(data);
        return { valid: false, error: '令牌已过期' };
    }
    
    return {
        valid: true,
        adminId: token.adminId,
        username: token.username
    };
}

/**
 * 管理员登出
 * 
 * @param {string} tokenHash - 令牌哈希
 * @returns {boolean} 是否成功
 */
function logout(tokenHash) {
    if (!tokenHash) return false;
    
    const data = loadAdminData();
    const originalLength = data.tokens.length;
    
    data.tokens = data.tokens.filter(t => t.hash !== tokenHash);
    
    if (data.tokens.length < originalLength) {
        saveAdminData(data);
        console.log('[管理员服务] 管理员已登出');
        return true;
    }
    
    return false;
}

/**
 * 创建管理员账号
 * 
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {number} creatorId - 创建者ID
 * @returns {Object} 创建结果
 */
function createAdmin(username, password, creatorId = null) {
    const data = loadAdminData();
    
    // 检查用户名是否已存在
    if (data.admins.find(a => a.username === username)) {
        return { success: false, error: '用户名已存在' };
    }
    
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    
    const newAdmin = {
        id: data.admins.length > 0 ? Math.max(...data.admins.map(a => a.id)) + 1 : 1,
        username: username,
        passwordHash: passwordHash,
        salt: salt,
        createdAt: new Date().toISOString(),
        createdBy: creatorId,
        lastLoginAt: null
    };
    
    data.admins.push(newAdmin);
    
    if (saveAdminData(data)) {
        console.log('[管理员服务] 创建管理员账号成功:', username);
        return { success: true, admin: { id: newAdmin.id, username: newAdmin.username } };
    }
    
    return { success: false, error: '保存失败' };
}

/**
 * 修改管理员密码
 * 
 * @param {number} adminId - 管理员ID
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Object} 修改结果
 */
function changePassword(adminId, oldPassword, newPassword) {
    const data = loadAdminData();
    
    const adminIndex = data.admins.findIndex(a => a.id === adminId);
    
    if (adminIndex === -1) {
        return { success: false, error: '管理员不存在' };
    }
    
    const admin = data.admins[adminIndex];
    
    // 验证旧密码
    if (hashPassword(oldPassword, admin.salt) !== admin.passwordHash) {
        return { success: false, error: '旧密码错误' };
    }
    
    // 生成新密码哈希
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordHash = hashPassword(newPassword, newSalt);
    
    data.admins[adminIndex].passwordHash = newPasswordHash;
    data.admins[adminIndex].salt = newSalt;
    
    // 清除该管理员的所有令牌
    data.tokens = data.tokens.filter(t => t.adminId !== adminId);
    
    if (saveAdminData(data)) {
        console.log('[管理员服务] 修改密码成功:', admin.username);
        return { success: true, message: '密码修改成功，请重新登录' };
    }
    
    return { success: false, error: '保存失败' };
}

/**
 * 删除管理员账号
 * 
 * @param {number} adminId - 管理员ID
 * @returns {Object} 删除结果
 */
function deleteAdmin(adminId) {
    const data = loadAdminData();
    
    const adminIndex = data.admins.findIndex(a => a.id === adminId);
    
    if (adminIndex === -1) {
        return { success: false, error: '管理员不存在' };
    }
    
    // 不允许删除最后一个管理员
    if (data.admins.length <= 1) {
        return { success: false, error: '不能删除最后一个管理员账号' };
    }
    
    const username = data.admins[adminIndex].username;
    data.admins.splice(adminIndex, 1);
    
    // 清除该管理员的所有令牌
    data.tokens = data.tokens.filter(t => t.adminId !== adminId);
    
    if (saveAdminData(data)) {
        console.log('[管理员服务] 删除管理员账号成功:', username);
        return { success: true };
    }
    
    return { success: false, error: '保存失败' };
}

/**
 * 获取所有管理员列表
 * 
 * @returns {Array} 管理员列表
 */
function getAllAdmins() {
    const data = loadAdminData();
    return data.admins.map(a => ({
        id: a.id,
        username: a.username,
        createdAt: a.createdAt,
        lastLoginAt: a.lastLoginAt
    }));
}

// 导出模块
module.exports = {
    login,
    logout,
    verifyToken,
    createAdmin,
    changePassword,
    deleteAdmin,
    getAllAdmins
};
