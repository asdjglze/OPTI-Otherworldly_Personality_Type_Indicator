// 版本号: v1.0.0
/**
 * 邀请码管理服务
 * 
 * 功能: 管理邀请码的创建、验证、使用
 * 存储: 使用JSON文件存储邀请码数据
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 邀请码文件路径
const INVITE_CODES_FILE = path.join(__dirname, '..', 'data', 'invite_codes.json');

/**
 * 加载邀请码数据
 * 
 * @returns {Object} 邀请码数据
 */
function loadInviteCodes() {
    try {
        if (!fs.existsSync(INVITE_CODES_FILE)) {
            // 创建默认邀请码文件
            const defaultData = {
                codes: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(INVITE_CODES_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
            return defaultData;
        }
        
        const data = fs.readFileSync(INVITE_CODES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[邀请码服务] 加载邀请码失败:', error);
        return { codes: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }
}

/**
 * 保存邀请码数据
 * 
 * @param {Object} data - 邀请码数据
 * @returns {boolean} 是否成功
 */
function saveInviteCodes(data) {
    try {
        data.updatedAt = new Date().toISOString();
        fs.writeFileSync(INVITE_CODES_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('[邀请码服务] 保存邀请码失败:', error);
        return false;
    }
}

/**
 * 生成唯一邀请码ID
 * 
 * @returns {string} 邀请码ID
 */
function generateInviteCodeId() {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
}

/**
 * 创建邀请码
 * 
 * @param {number} maxUses - 最大使用次数
 * @param {string} description - 描述
 * @returns {Object} 创建结果
 */
function createInviteCode(maxUses = 1, description = '') {
    const data = loadInviteCodes();
    
    const code = {
        id: generateInviteCodeId(),
        maxUses: maxUses,
        usedCount: 0,
        description: description,
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
    };
    
    data.codes.push(code);
    
    if (saveInviteCodes(data)) {
        console.log('[邀请码服务] 创建邀请码成功:', code.id);
        return { success: true, code: code };
    } else {
        return { success: false, error: '保存邀请码失败' };
    }
}

/**
 * 批量创建邀请码
 * 
 * @param {number} count - 创建数量
 * @param {number} maxUses - 每个邀请码的最大使用次数
 * @param {string} description - 描述
 * @returns {Object} 创建结果
 */
function createInviteCodes(count, maxUses = 1, description = '') {
    const data = loadInviteCodes();
    const createdCodes = [];
    
    for (let i = 0; i < count; i++) {
        const code = {
            id: generateInviteCodeId(),
            maxUses: maxUses,
            usedCount: 0,
            description: description,
            createdAt: new Date().toISOString(),
            createdBy: 'admin'
        };
        
        data.codes.push(code);
        createdCodes.push(code);
    }
    
    if (saveInviteCodes(data)) {
        console.log('[邀请码服务] 批量创建邀请码成功, 数量:', count);
        return { success: true, codes: createdCodes };
    } else {
        return { success: false, error: '保存邀请码失败' };
    }
}

/**
 * 验证邀请码
 * 
 * @param {string} codeId - 邀请码ID
 * @returns {Object} 验证结果
 */
function verifyInviteCode(codeId) {
    const data = loadInviteCodes();
    
    const code = data.codes.find(c => c.id === codeId);
    
    if (!code) {
        return { valid: false, error: '邀请码不存在' };
    }
    
    if (code.usedCount >= code.maxUses) {
        return { valid: false, error: '该邀请码可使用次数为0' };
    }
    
    return { valid: true, code: code };
}

/**
 * 使用邀请码（扣减次数）
 * 
 * @param {string} codeId - 邀请码ID
 * @param {string} username - 使用者用户名
 * @returns {Object} 使用结果
 */
function useInviteCode(codeId, username) {
    const data = loadInviteCodes();
    
    const codeIndex = data.codes.findIndex(c => c.id === codeId);
    
    if (codeIndex === -1) {
        return { success: false, error: '邀请码不存在' };
    }
    
    const code = data.codes[codeIndex];
    
    if (code.usedCount >= code.maxUses) {
        return { success: false, error: '该邀请码可使用次数为0' };
    }
    
    // 记录使用
    code.usedCount++;
    if (!code.usedBy) {
        code.usedBy = [];
    }
    code.usedBy.push({
        username: username,
        usedAt: new Date().toISOString()
    });
    
    data.codes[codeIndex] = code;
    
    if (saveInviteCodes(data)) {
        console.log('[邀请码服务] 邀请码已使用:', codeId, ', 使用者:', username);
        return { success: true, remainingUses: code.maxUses - code.usedCount };
    } else {
        return { success: false, error: '保存邀请码失败' };
    }
}

/**
 * 删除邀请码
 * 
 * @param {string} codeId - 邀请码ID
 * @returns {Object} 删除结果
 */
function deleteInviteCode(codeId) {
    const data = loadInviteCodes();
    
    const codeIndex = data.codes.findIndex(c => c.id === codeId);
    
    if (codeIndex === -1) {
        return { success: false, error: '邀请码不存在' };
    }
    
    data.codes.splice(codeIndex, 1);
    
    if (saveInviteCodes(data)) {
        console.log('[邀请码服务] 删除邀请码成功:', codeId);
        return { success: true };
    } else {
        return { success: false, error: '保存邀请码失败' };
    }
}

/**
 * 获取所有邀请码
 * 
 * @returns {Array} 邀请码列表
 */
function getAllInviteCodes() {
    const data = loadInviteCodes();
    return data.codes;
}

/**
 * 获取邀请码统计信息
 * 
 * @returns {Object} 统计信息
 */
function getInviteCodeStats() {
    const data = loadInviteCodes();
    
    const total = data.codes.length;
    const used = data.codes.filter(c => c.usedCount >= c.maxUses).length;
    const available = total - used;
    const totalUses = data.codes.reduce((sum, c) => sum + c.usedCount, 0);
    
    return {
        total: total,
        used: used,
        available: available,
        totalUses: totalUses
    };
}

// 导出模块
module.exports = {
    createInviteCode,
    createInviteCodes,
    verifyInviteCode,
    useInviteCode,
    deleteInviteCode,
    getAllInviteCodes,
    getInviteCodeStats
};
