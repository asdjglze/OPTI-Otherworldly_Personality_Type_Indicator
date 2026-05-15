// 版本号: v1.0.0
/**
 * 人机验证路由
 * 
 * 功能: 提供验证题目、验证答案
 * 限制: IP访问频率限制
 */

const express = require('express');
const router = express.Router();
const verificationService = require('../services/verification');
const logger = require('../services/logger');

/**
 * 获取客户端IP
 */
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           'unknown';
}

/**
 * GET /api/verification/question
 * 获取验证题目
 */
router.get('/question', async (req, res) => {
    try {
        const ip = getClientIP(req);
        
        // 检查IP状态
        const ipStatus = await verificationService.checkIPStatus(ip);
        
        if (!ipStatus.allowed) {
            return res.status(429).json({
                success: false,
                error: ipStatus.reason,
                banned: true,
                bannedUntil: ipStatus.bannedUntil
            });
        }
        
        // 获取随机题目
        const question = verificationService.getRandomQuestion();
        
        if (!question) {
            return res.status(500).json({
                success: false,
                error: '获取验证题目失败'
            });
        }
        
        // 生成验证令牌
        const token = await verificationService.generateVerificationToken(ip, question);
        
        if (!token) {
            return res.status(500).json({
                success: false,
                error: '生成验证令牌失败'
            });
        }
        
        res.json({
            success: true,
            token: token,
            question: question.question,
            type: question.type,
            difficulty: question.difficulty,
            attemptCount: ipStatus.attemptCount,
            maxRetries: 3
        });
    } catch (error) {
        logger.logError(req, null, '验证获取题目失败', error.message, error.stack);
        res.status(500).json({
            success: false,
            error: '服务器错误'
        });
    }
});

/**
 * POST /api/verification/verify
 * 验证答案
 * Body: { token: string, answer: string }
 */
router.post('/verify', async (req, res) => {
    try {
        const ip = getClientIP(req);
        const { token, answer } = req.body;
        
        if (!token || !answer) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数'
            });
        }
        
        // 检查IP状态
        const ipStatus = await verificationService.checkIPStatus(ip);
        
        if (!ipStatus.allowed) {
            return res.status(429).json({
                success: false,
                error: ipStatus.reason,
                banned: true
            });
        }
        
        // 验证令牌
        const tokenInfo = await verificationService.verifyToken(token);
        
        if (!tokenInfo) {
            return res.status(400).json({
                success: false,
                error: '验证令牌无效或已过期'
            });
        }
        
        // 检查IP是否匹配
        if (tokenInfo.ip !== ip) {
            return res.status(403).json({
                success: false,
                error: 'IP地址不匹配'
            });
        }
        
        // 使用AI验证答案
        const verifyResult = await verificationService.verifyAnswerWithAI(
            tokenInfo.question, 
            answer,
            tokenInfo.answer,
            tokenInfo.analysis
        );
        
        if (!verifyResult.success) {
            return res.status(500).json({
                success: false,
                error: verifyResult.error || 'AI验证失败'
            });
        }
        
        // 记录验证结果
        await verificationService.recordVerification(
            ip,
            token,
            tokenInfo.questionId,
            answer,
            verifyResult.isCorrect
        );
        
        // 标记令牌已使用
        await verificationService.markTokenUsed(token);
        
        if (verifyResult.isCorrect) {
            // 验证成功，重置IP尝试次数
            await verificationService.resetIPAttempts(ip);
            
            // 生成验证通过的令牌（用于注册）
            const verifiedToken = `verified_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            
            res.json({
                success: true,
                verified: true,
                verifiedToken: verifiedToken,
                reason: verifyResult.reason
            });
        } else {
            // 验证失败，记录IP尝试
            const attemptResult = await verificationService.recordIPAttempt(ip);
            
            res.json({
                success: true,
                verified: false,
                reason: verifyResult.reason || '答案不正确',
                attemptCount: attemptResult.attemptCount,
                maxRetries: 3,
                banned: attemptResult.banned || false
            });
        }
    } catch (error) {
        logger.logError(req, null, '验证答案失败', error.message, error.stack);
        res.status(500).json({
            success: false,
            error: '服务器错误'
        });
    }
});

/**
 * GET /api/verification/status
 * 获取验证状态
 */
router.get('/status', async (req, res) => {
    try {
        const ip = getClientIP(req);
        
        const ipStatus = await verificationService.checkIPStatus(ip);
        
        res.json({
            success: true,
            allowed: ipStatus.allowed,
            attemptCount: ipStatus.attemptCount || 0,
            maxRetries: 3,
            banned: !ipStatus.allowed,
            bannedUntil: ipStatus.bannedUntil || null,
            reason: ipStatus.reason || null
        });
    } catch (error) {
        logger.logError(req, null, '验证获取状态失败', error.message, error.stack);
        res.status(500).json({
            success: false,
            error: '服务器错误'
        });
    }
});

/**
 * GET /api/verification/stats
 * 获取验证统计（管理员接口）
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await verificationService.getVerificationStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.logError(req, null, '验证获取统计失败', error.message, error.stack);
        res.status(500).json({
            success: false,
            error: '服务器错误'
        });
    }
});

module.exports = router;
