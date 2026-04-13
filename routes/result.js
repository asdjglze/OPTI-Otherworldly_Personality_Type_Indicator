// 版本号: v1.0.0
/**
 * 结果路由
 * 
 * 功能: 处理MBTI测试结果相关的API请求
 */

const express = require('express');
const router = express.Router();
const resultService = require('../services/result');
const auth = require('../services/auth');
const calculator = require('../services/calculator');
const dataService = require('../services/data');

/**
 * 从请求中获取用户名
 * 
 * @param {Object} req - 请求对象
 * @returns {string|null} 用户名或null
 */
function getUsername(req) {
    const token = req.cookies && req.cookies.auth_token;
    if (!token) return null;
    
    const user = auth.verifySession(token);
    return user ? user.username : null;
}

/**
 * POST /api/submit
 * 提交答案，返回完整结果
 */
router.post('/submit', (req, res) => {
    try {
        const { answers, gender, questionVersion } = req.body;
        
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: '答案数据无效'
            });
        }
        
        if (!gender || !['male', 'female'].includes(gender)) {
            return res.status(400).json({
                success: false,
                error: '性别参数无效'
            });
        }
        
        const result = resultService.submit(answers, gender, questionVersion);
        
        // 获取登录用户
        const username = getUsername(req);
        
        if (username) {
            // 已登录：保存到用户数据库
            const savedResult = {
                type: result.type,
                gender: gender,
                isAIAnalysis: false,
                questionSet: questionVersion || 'mbti-200',
                dimensionScores: result.dimensionScores,
                answers: answers.map(a => a && a.coordinate !== undefined ? a.coordinate : null)
            };
            
            auth.saveResult(username, savedResult);
        }
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('提交答案失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器处理失败'
        });
    }
});

/**
 * POST /api/direct-view
 * 直接查看结果（不答题）
 */
router.post('/direct-view', (req, res) => {
    try {
        const { mbtiType, gender } = req.body;
        
        const validTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 
                           'INFJ', 'INFP', 'ENFJ', 'ENFP',
                           'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
                           'ISTP', 'ISFP', 'ESTP', 'ESFP'];
        
        if (!mbtiType || !validTypes.includes(mbtiType)) {
            return res.status(400).json({
                success: false,
                error: 'MBTI类型无效'
            });
        }
        
        if (!gender || !['male', 'female'].includes(gender)) {
            return res.status(400).json({
                success: false,
                error: '性别参数无效'
            });
        }
        
        const result = resultService.directView(mbtiType, gender);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('直接查看结果失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器处理失败'
        });
    }
});

module.exports = router;
