// 版本号: v1.0.0
/**
 * 邀请码管理路由
 * 
 * 功能: 管理邀请码的创建、查看、删除
 * 权限: 仅管理员可访问（使用管理员令牌验证）
 */

const express = require('express');
const router = express.Router();
const inviteCodeService = require('../services/invite-code');
const adminAuth = require('../services/admin-auth');

/**
 * 验证管理员权限中间件
 * 
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
function requireAdmin(req, res, next) {
    const token = req.cookies && req.cookies.admin_token;
    const verification = adminAuth.verifyToken(token);
    
    if (!verification.valid) {
        return res.status(403).json({ success: false, error: '无权限，请先登录管理员账号' });
    }
    
    req.admin = verification;
    next();
}

/**
 * POST /api/invite/create
 * 创建邀请码
 */
router.post('/create', requireAdmin, (req, res) => {
    try {
        const { maxUses = 1, description = '' } = req.body;
        
        if (maxUses < 1 || maxUses > 1000) {
            return res.status(400).json({ success: false, error: '使用次数必须在1-1000之间' });
        }
        
        const result = inviteCodeService.createInviteCode(maxUses, description);
        
        if (result.success) {
            console.log(`[邀请码管理] 管理员 ${req.admin.username} 创建邀请码: ${result.code.id}`);
            res.json({
                success: true,
                message: '邀请码创建成功',
                code: result.code
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('[邀请码管理] 创建失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/invite/create-batch
 * 批量创建邀请码
 */
router.post('/create-batch', requireAdmin, (req, res) => {
    try {
        const { count = 1, maxUses = 1, description = '' } = req.body;
        
        if (count < 1 || count > 100) {
            return res.status(400).json({ success: false, error: '一次最多创建100个邀请码' });
        }
        
        if (maxUses < 1 || maxUses > 1000) {
            return res.status(400).json({ success: false, error: '使用次数必须在1-1000之间' });
        }
        
        const result = inviteCodeService.createInviteCodes(count, maxUses, description);
        
        if (result.success) {
            console.log(`[邀请码管理] 管理员 ${req.admin.username} 批量创建邀请码: ${count}个`);
            res.json({
                success: true,
                message: `成功创建 ${count} 个邀请码`,
                codes: result.codes
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('[邀请码管理] 批量创建失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/invite/list
 * 获取所有邀请码
 */
router.get('/list', requireAdmin, (req, res) => {
    try {
        const codes = inviteCodeService.getAllInviteCodes();
        
        res.json({
            success: true,
            data: codes,
            count: codes.length
        });
    } catch (error) {
        console.error('[邀请码管理] 获取列表失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * DELETE /api/invite/:codeId
 * 删除邀请码
 */
router.delete('/:codeId', requireAdmin, (req, res) => {
    try {
        const { codeId } = req.params;
        
        const result = inviteCodeService.deleteInviteCode(codeId);
        
        if (result.success) {
            console.log(`[邀请码管理] 管理员 ${req.admin.username} 删除邀请码: ${codeId}`);
            res.json({ success: true, message: '邀请码已删除' });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('[邀请码管理] 删除失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/invite/stats
 * 获取邀请码统计信息
 */
router.get('/stats', requireAdmin, (req, res) => {
    try {
        const stats = inviteCodeService.getInviteCodeStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('[邀请码管理] 获取统计失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/invite/verify
 * 验证邀请码（公开接口，用于前端验证）
 * Body: { inviteCode: string }
 */
router.post('/verify', (req, res) => {
    try {
        const { inviteCode } = req.body;
        
        if (!inviteCode) {
            return res.json({ valid: false, error: '请输入邀请码' });
        }
        
        const result = inviteCodeService.verifyInviteCode(inviteCode);
        
        res.json({
            valid: result.valid,
            error: result.error || null
        });
    } catch (error) {
        console.error('[邀请码管理] 验证失败:', error);
        res.json({ valid: false, error: '验证失败' });
    }
});

module.exports = router;
