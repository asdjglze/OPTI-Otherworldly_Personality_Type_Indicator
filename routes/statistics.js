// 版本号: v1.0.0
/**
 * 统计路由
 * 
 * 功能: 处理统计数据相关的API请求（公开数据）
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * GET /api/statistics
 * 获取统计数据（公开数据，前端可直接访问）
 */
router.get('/statistics', (req, res) => {
    try {
        const dataDir = path.join(__dirname, '../data');
        
        let characterStats = null;
        let compatibilityStats = null;
        
        const statsPath = path.join(dataDir, 'mbti_statistics.json');
        if (fs.existsSync(statsPath)) {
            characterStats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
        }
        
        const compatStatsPath = path.join(dataDir, 'mbti_compatibility_stats.json');
        if (fs.existsSync(compatStatsPath)) {
            compatibilityStats = JSON.parse(fs.readFileSync(compatStatsPath, 'utf-8'));
        }
        
        res.json({
            success: true,
            data: {
                characterStats: characterStats,
                compatibilityStats: compatibilityStats
            }
        });
        
    } catch (error) {
        console.error('获取统计数据失败:', error);
        res.status(500).json({
            success: false,
            error: '获取统计数据失败'
        });
    }
});

module.exports = router;
