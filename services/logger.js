/**
 * 用户行为日志服务
 * 
 * 功能: 记录用户请求行为（访问日志），按日切割，自动清理过期日志
 * 记录内容: IP、UA、用户名、请求接口、行为描述（不记录敏感数据如答案、MBTI类型等）
 * 安全: 日志目录需配合 server.js 中的路径拦截进行保护
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs', 'access');
const RETENTION_DAYS = 30;
const MAX_LOG_SIZE = 10 * 1024 * 1024;

/**
 * 确保日志目录存在
 */
function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

/**
 * 获取当天的日志文件路径
 * 
 * @returns {string} 日志文件绝对路径
 */
function getTodayLogPath() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return path.join(LOG_DIR, `access-${dateStr}.log`);
}

/**
 * 格式化时间戳
 * 
 * @param {Date} date - 日期对象
 * @returns {string} 格式化的时间字符串
 */
function formatTimestamp(date) {
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

/**
 * 获取客户端真实IP（考虑反向代理）
 * 
 * @param {Object} req - Express请求对象
 * @returns {string} 客户端IP地址
 */
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
        return realIp.trim();
    }
    return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
}

/**
 * 脱敏处理UA字符串（截断过长内容）
 * 
 * @param {string} ua - User-Agent字符串
 * @returns {string} 脱敏后的UA
 */
function sanitizeUA(ua) {
    if (!ua) return 'unknown';
    return ua.length > 300 ? ua.substring(0, 300) + '...(truncated)' : ua;
}

/**
 * 写入日志条目
 * 
 * @param {string} level - 日志级别 (ACCESS)
 * @param {string} ip - 客户端IP
 * @param {string} ua - User-Agent
 * @param {string} username - 用户名（匿名用户则为"-"）
 * @param {string} method - HTTP方法
 * @param {string} apiPath - API路径
 * @param {string} action - 行为描述
 * @param {string} detail - 附加详情（可选，不记录敏感数据）
 */
function writeLog(level, ip, ua, username, method, apiPath, action, detail) {
    try {
        ensureLogDir();
        
        const timestamp = formatTimestamp(new Date());
        const safeUA = sanitizeUA(ua);
        const safeUser = username || '-';
        const safeAction = action || 'unknown';
        
        let line = `[${timestamp}] [${level}] ip=${ip} ua="${safeUA}" user="${safeUser}" method=${method} path=${apiPath} action="${safeAction}"`;
        if (detail) {
            line += ` detail="${detail}"`;
        }
        line += '\n';
        
        const logPath = getTodayLogPath();
        fs.appendFileSync(logPath, line, 'utf8');
        
        checkAndRotate(logPath);
    } catch (err) {
        console.error('[日志服务] 写入日志失败:', err.message);
    }
}

/**
 * 检查日志文件大小，超过限制则轮转
 * 
 * @param {string} logPath - 当前日志文件路径
 */
function checkAndRotate(logPath) {
    try {
        if (!fs.existsSync(logPath)) return;
        
        const stats = fs.statSync(logPath);
        if (stats.size > MAX_LOG_SIZE) {
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
            const rotatedPath = logPath.replace('.log', `-${timeStr}.log`);
            fs.renameSync(logPath, rotatedPath);
        }
    } catch (err) {
        // 轮转失败不阻塞正常日志记录
    }
}

/**
 * 清理过期日志文件
 * 在每次写入日志时触发检查，每天最多检查一次
 */
let lastCleanupDate = '';

function cleanupOldLogs() {
    try {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        if (lastCleanupDate === todayStr) return;
        lastCleanupDate = todayStr;
        
        if (!fs.existsSync(LOG_DIR)) return;
        
        const cutoffTime = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
        const files = fs.readdirSync(LOG_DIR);
        
        files.forEach(filename => {
            if (!filename.startsWith('access-') || !filename.endsWith('.log')) return;
            
            const filePath = path.join(LOG_DIR, filename);
            try {
                const stats = fs.statSync(filePath);
                if (stats.mtimeMs < cutoffTime) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                // 删除失败忽略
            }
        });
    } catch (err) {
        // 清理失败不阻塞正常日志记录
    }
}

/**
 * 记录用户行为日志（主要对外接口）
 * 
 * @param {Object} req - Express请求对象
 * @param {string} username - 用户名，未登录则为null或空字符串
 * @param {string} action - 行为描述（如"提交答卷"、"保存答题进度"等）
 * @param {string} detail - 附加详情（如"题库=mbti-200"，不记录敏感数据如答案内容、MBTI类型等）
 */
function logUserAction(req, username, action, detail) {
    try {
        const ip = getClientIP(req);
        const ua = req.get('User-Agent') || 'unknown';
        const method = req.method;
        const apiPath = req.originalUrl || req.path;
        
        writeLog('ACCESS', ip, ua, username, method, apiPath, action, detail);
        cleanupOldLogs();
    } catch (err) {
        console.error('[日志服务] 记录用户行为失败:', err.message);
    }
}

/**
 * 记录错误日志
 * 
 * @param {Object} req - Express请求对象
 * @param {string} username - 用户名，未登录则为null或空字符串
 * @param {string} errorType - 错误类型（如"注册失败"、"登录失败"等）
 * @param {string} errorMessage - 错误消息
 * @param {string} stack - 错误堆栈（可选）
 */
function logError(req, username, errorType, errorMessage, stack) {
    try {
        const ip = getClientIP(req);
        const ua = req.get('User-Agent') || 'unknown';
        const method = req.method;
        const apiPath = req.originalUrl || req.path;
        const safeUser = username || '-';
        const safeType = errorType || '未知错误';
        const safeMsg = errorMessage || '无错误信息';
        
        ensureLogDir();
        
        const timestamp = formatTimestamp(new Date());
        let line = `[${timestamp}] [ERROR] ip=${ip} user="${safeUser}" method=${method} path=${apiPath} errorType="${safeType}" message="${safeMsg}"`;
        if (stack) {
            const safeStack = stack.replace(/\n/g, ' | ').substring(0, 500);
            line += ` stack="${safeStack}"`;
        }
        line += '\n';
        
        const logPath = getTodayLogPath();
        fs.appendFileSync(logPath, line, 'utf8');
    } catch (err) {
        console.error('[日志服务] 记录错误日志失败:', err.message);
    }
}

module.exports = {
    logUserAction,
    logError
};
