// 版本号: v1.0.0
/**
 * 数据路由
 * 
 * 功能: 提供前端初始化所需的少量数据API
 */

const express = require('express');
const router = express.Router();
const dataService = require('../services/data');
const logger = require('../services/logger');

/**
 * GET /api/init
 * 获取前端初始化所需的少量数据（仅欢迎页面需要的数据）
 */
router.get('/init', (req, res) => {
    try {
        const initData = {
            success: true,
            data: {
                aboutTestData: dataService.loadJson('about_test.json')
            }
        };
        
        res.json(initData);
        
    } catch (error) {
        logger.logError(req, null, '获取初始化数据失败', error.message, error.stack);
        res.status(500).json({
            success: false,
            error: '获取初始化数据失败'
        });
    }
});

module.exports = router;
