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
const dataRoutes = require('./routes/data');
const userRoutes = require('./routes/user');
const mallmRoutes = require('./routes/mallm');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api', userRoutes);
app.use('/api', resultRoutes);
app.use('/api', statisticsRoutes);
app.use('/api', aiAnalyzeRoutes);
app.use('/api', dataRoutes);
app.use('/api/mallm', mallmRoutes);

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
