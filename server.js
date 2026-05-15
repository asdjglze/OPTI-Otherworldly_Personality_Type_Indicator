// 版本号: v1.0.0
/**
 * 原神版MBTI后端服务 - 主入口
 * 
 * 功能: 启动Express服务器，配置中间件和路由
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const resultRoutes = require('./routes/result');
const statisticsRoutes = require('./routes/statistics');
const aiAnalyzeRoutes = require('./routes/ai-analyze');
const aiRoutes = require('./routes/ai');
const dataRoutes = require('./routes/data');
const userRoutes = require('./routes/user');
const mallmRoutes = require('./routes/mallm');
const inviteRoutes = require('./routes/invite');
const adminRoutes = require('./routes/admin');
const verificationRoutes = require('./routes/verification');
const logger = require('./services/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api', userRoutes);
app.use('/api', resultRoutes);
app.use('/api', statisticsRoutes);
app.use('/api', aiAnalyzeRoutes);
app.use('/api', aiRoutes);
app.use('/api', dataRoutes);
app.use('/api/mallm', mallmRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);

// 安全防护：禁止外部访问敏感文件
const BLOCKED_EXTENSIONS = ['.db', '.db-wal', '.db-shm', '.sqlite', '.env', '.bak', '.backup', '.sql', '.tar', '.gz', '.zip', '.log'];
const BLOCKED_FILENAMES = ['package.json', 'package-lock.json', 'yarn.lock', '.gitignore', 'server.js', 'INSTALL.md', 'LICENSE', 'README.md'];
const BLOCKED_PATHS = [/\/data\/user_data\//, /\/data\/user_results\//, /\/services\//, /\/routes\//, /\/config\//, /\/logs\//];

app.use((req, res, next) => {
    const url = req.path.toLowerCase();
    const ext = path.extname(url);
    
    if (BLOCKED_EXTENSIONS.includes(ext)) {
        return res.status(403).send('Forbidden');
    }
    
    const basename = path.basename(url).toLowerCase();
    if (BLOCKED_FILENAMES.includes(basename)) {
        return res.status(403).send('Forbidden');
    }
    
    if (url.startsWith('/.')) {
        return res.status(403).send('Forbidden');
    }
    
    for (const pattern of BLOCKED_PATHS) {
        if (pattern.test(url)) {
            return res.status(403).send('Forbidden');
        }
    }
    
    next();
});

// 全局请求日志中间件：记录用户行为（不记录CSS/JS/图片等静态资源）
const ASSET_EXTENSIONS = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.mp3', '.mp4', '.webm', '.woff', '.woff2', '.ttf', '.eot', '.otf', '.map'];

const API_ACTION_MAP = [
    { pattern: '/api/submit', action: '提交答卷', method: 'POST' },
    { pattern: '/api/init', action: '获取初始化数据', method: 'GET' },
    { pattern: '/api/auth/register', action: '用户注册', method: 'POST' },
    { pattern: '/api/auth/login', action: '用户登录', method: 'POST' },
    { pattern: '/api/auth/logout', action: '用户登出', method: 'POST' },
    { pattern: '/api/user/result', action: '获取个人答卷列表', method: 'GET' },
    { pattern: '/api/user/result', action: '保存答卷结果', method: 'POST' },
    { pattern: '/api/user/progress/ai', action: '保存/获取AI答题进度', method: null },
    { pattern: '/api/user/progress', action: '保存/获取普通答题进度', method: null },
    { pattern: '/api/user/export/answers', action: '导出答卷', method: 'GET' },
    { pattern: '/api/user/export/report', action: '导出分析报告', method: 'GET' },
    { pattern: '/api/user/history', action: '查看答题历史', method: 'GET' },
    { pattern: '/api/user/check', action: '检查登录状态', method: 'GET' },
    { pattern: '/api/statistics', action: '获取统计数据', method: 'GET' },
    { pattern: '/api/ai-analyze', action: 'AI分析', method: 'POST' },
    { pattern: '/api/ai', action: 'AI相关请求', method: null },
    { pattern: '/api/mallm', action: 'MALLM对话', method: 'POST' },
    { pattern: '/api/mallm/reset', action: '重置MALLM', method: 'POST' },
    { pattern: '/api/mallm/status', action: '查询MALLM状态', method: 'GET' },
    { pattern: '/api/invite', action: '邀请相关', method: null },
    { pattern: '/api/admin', action: '管理后台请求', method: null },
    { pattern: '/api/verification', action: '验证码请求', method: null },
    { pattern: '/data/questions', action: '获取题库数据', method: 'GET' },
    { pattern: '/data/mbti', action: '获取MBTI数据', method: 'GET' },
    { pattern: '/data/character_data', action: '获取角色数据', method: 'GET' },
];

function matchAction(reqPath, reqMethod) {
    const lowerPath = reqPath.toLowerCase();
    const lowerMethod = reqMethod.toUpperCase();
    
    for (const entry of API_ACTION_MAP) {
        if (lowerPath.startsWith(entry.pattern.toLowerCase()) && (entry.method === null || entry.method.toUpperCase() === lowerMethod)) {
            return entry.action;
        }
    }
    
    if (lowerPath.startsWith('/api/')) {
        return 'API请求';
    }
    if (lowerPath.startsWith('/data/') && lowerPath.endsWith('.json')) {
        return '获取JSON数据文件';
    }
    if (lowerPath === '/' || lowerPath === '/index.html') {
        return '访问首页';
    }
    if (lowerPath.endsWith('.html')) {
        return '访问页面';
    }
    
    return null;
}

// 以下路径由路由内部详细记录（包含答题详情），全局中间件跳过避免重复
const ROUTE_LOGGED_PATHS = [
    { pattern: '/api/submit', method: 'POST' },
    { pattern: '/api/auth/register', method: 'POST' },
    { pattern: '/api/auth/login', method: 'POST' },
    { pattern: '/api/auth/logout', method: 'POST' },
    { pattern: '/api/user/result', method: 'POST' },
    { pattern: '/api/user/progress', method: 'POST' },
    { pattern: '/api/user/progress/ai', method: 'POST' },
    { pattern: '/api/user/export/answers', method: 'GET' },
    { pattern: '/api/user/export/report', method: 'GET' },
];

function isRouteLogged(reqPath, reqMethod) {
    const lowerPath = reqPath.toLowerCase();
    const lowerMethod = reqMethod.toUpperCase();
    for (const entry of ROUTE_LOGGED_PATHS) {
        if (lowerPath.startsWith(entry.pattern.toLowerCase()) && lowerMethod === entry.method.toUpperCase()) {
            return true;
        }
    }
    return false;
}

app.use((req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    if (ASSET_EXTENSIONS.includes(ext)) {
        return next();
    }
    
    if (isRouteLogged(req.path, req.method)) {
        return next();
    }
    
    const action = matchAction(req.path, req.method);
    if (action) {
        const detail = req.path.startsWith('/data/questions/') ? `文件路径=${req.path}` : undefined;
        logger.logUserAction(req, null, action, detail);
    }
    
    next();
});

// 禁止缓存HTML文件，确保前端强制更新
app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

app.listen(PORT, () => {
    console.log(`原神版MBTI服务已启动: http://localhost:${PORT}`);
});

module.exports = app;
