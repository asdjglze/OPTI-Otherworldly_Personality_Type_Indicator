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
const BLOCKED_PATHS = [/\/data\/user_data\//, /\/data\/user_results\//, /\/services\//, /\/routes\//, /\/config\//];

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
