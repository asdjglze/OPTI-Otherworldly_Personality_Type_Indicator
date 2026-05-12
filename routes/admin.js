// 版本号: v1.0.0
/**
 * 管理员路由
 * 
 * 功能: 管理员登录、登出、账号管理
 */

const express = require('express');
const router = express.Router();
const adminAuth = require('../services/admin-auth');

/**
 * POST /api/admin/login
 * 管理员登录
 * Body: { username: string, password: string }
 */
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, error: '请输入用户名和密码' });
        }
        
        const result = adminAuth.login(username, password);
        
        if (result.success) {
            // 设置管理员令牌到cookie
            res.cookie('admin_token', result.token, {
                maxAge: 24 * 60 * 60 * 1000, // 24小时
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            });
            
            res.json({
                success: true,
                token: result.token,
                expiresAt: result.expiresAt,
                username: result.username
            });
        } else {
            res.status(401).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('[管理员路由] 登录失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/admin/logout
 * 管理员登出
 */
router.post('/logout', (req, res) => {
    try {
        const token = req.cookies && req.cookies.admin_token;
        adminAuth.logout(token);
        
        res.clearCookie('admin_token');
        res.json({ success: true, message: '已登出' });
    } catch (error) {
        console.error('[管理员路由] 登出失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/admin/check
 * 检查管理员登录状态
 */
router.get('/check', (req, res) => {
    try {
        const token = req.cookies && req.cookies.admin_token;
        
        if (!token) {
            return res.json({ success: false, loggedIn: false });
        }
        
        const result = adminAuth.verifyToken(token);
        
        if (result.valid) {
            res.json({
                success: true,
                loggedIn: true,
                username: result.username
            });
        } else {
            res.clearCookie('admin_token');
            res.json({ success: false, loggedIn: false });
        }
    } catch (error) {
        console.error('[管理员路由] 检查登录状态失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/admin/list
 * 获取所有管理员列表（需要管理员权限）
 */
router.get('/list', (req, res) => {
    try {
        const token = req.cookies && req.cookies.admin_token;
        const verification = adminAuth.verifyToken(token);
        
        if (!verification.valid) {
            return res.status(403).json({ success: false, error: '无权限' });
        }
        
        const admins = adminAuth.getAllAdmins();
        
        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('[管理员路由] 获取管理员列表失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/admin/create
 * 创建管理员账号（需要管理员权限）
 * Body: { username: string, password: string }
 */
router.post('/create', (req, res) => {
    try {
        const token = req.cookies && req.cookies.admin_token;
        const verification = adminAuth.verifyToken(token);
        
        if (!verification.valid) {
            return res.status(403).json({ success: false, error: '无权限' });
        }
        
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, error: '请输入用户名和密码' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: '密码至少需要6个字符' });
        }
        
        const result = adminAuth.createAdmin(username, password, verification.adminId);
        
        if (result.success) {
            res.json({ success: true, message: '创建成功', admin: result.admin });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('[管理员路由] 创建管理员失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/admin/change-password
 * 修改密码
 * Body: { oldPassword: string, newPassword: string }
 */
router.post('/change-password', (req, res) => {
    try {
        const token = req.cookies && req.cookies.admin_token;
        const verification = adminAuth.verifyToken(token);
        
        if (!verification.valid) {
            return res.status(403).json({ success: false, error: '无权限' });
        }
        
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, error: '请输入旧密码和新密码' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, error: '新密码至少需要6个字符' });
        }
        
        const result = adminAuth.changePassword(verification.adminId, oldPassword, newPassword);
        
        if (result.success) {
            res.clearCookie('admin_token');
            res.json({ success: true, message: result.message });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('[管理员路由] 修改密码失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * DELETE /api/admin/:adminId
 * 删除管理员账号
 */
router.delete('/:adminId', (req, res) => {
    try {
        const token = req.cookies && req.cookies.admin_token;
        const verification = adminAuth.verifyToken(token);
        
        if (!verification.valid) {
            return res.status(403).json({ success: false, error: '无权限' });
        }
        
        const adminId = parseInt(req.params.adminId);
        
        const result = adminAuth.deleteAdmin(adminId);
        
        if (result.success) {
            res.json({ success: true, message: '删除成功' });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('[管理员路由] 删除管理员失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

module.exports = router;
