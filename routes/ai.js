// 版本号: v1.0.0
/**
 * AI分析路由
 * 
 * 功能: 提供AI模型列表和题目生成接口
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getAvailableModels, getSystemDefaultModel } = require('../config/model-config');

/**
 * 获取可用AI模型列表
 * 
 * GET /api/ai-models
 */
router.get('/ai-models', (req, res) => {
    try {
        const availableModels = getAvailableModels();
        const defaultModel = getSystemDefaultModel();

        res.json({
            success: true,
            data: {
                models: availableModels,
                defaultModel: defaultModel
            }
        });
    } catch (error) {
        console.error('[AI路由] 获取模型列表失败:', error);
        res.json({
            success: false,
            error: '获取模型列表失败'
        });
    }
});

/**
 * 加载题目池
 * 
 * @returns {Array} 题目数组
 */
function loadQuestionPool() {
    try {
        const filePath = path.join(__dirname, '..', 'data', 'ai-questions.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error('[AI路由] 加载题目池失败:', e);
        return [];
    }
}

/**
 * 从题目池随机抽取题目
 * 
 * @param {number} count - 需要抽取的题目数量
 * @param {Array} excludeIds - 需要排除的题目ID列表（用于换题）
 * @returns {Array} 抽取的题目数组
 */
function pickRandomQuestions(count, excludeIds) {
    const pool = loadQuestionPool();
    if (pool.length === 0) return [];

    const excludeSet = new Set(excludeIds || []);
    const available = pool.filter(q => !excludeSet.has(q.id));

    const shuffled = available.sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);

    return picked.map((q, index) => ({
        ...q,
        id: 'ai_' + Date.now() + '_' + index
    }));
}

/**
 * 获取AI生成题目
 * 
 * GET /api/ai-questions?count=10
 */
router.get('/ai-questions', (req, res) => {
    try {
        const count = parseInt(req.query.count) || 10;
        const questions = pickRandomQuestions(count);

        if (questions.length === 0) {
            return res.json({
                success: false,
                error: '题库为空'
            });
        }

        res.json({
            success: true,
            data: {
                questions: questions
            }
        });
    } catch (error) {
        console.error('[AI路由] 获取题目失败:', error);
        res.json({
            success: false,
            error: '获取题目失败'
        });
    }
});

/**
 * 替换单道题目
 * 
 * POST /api/ai-questions/replace
 * Body: { replaceIndex: number, currentQuestionIds: Array }
 */
router.post('/ai-questions/replace', (req, res) => {
    try {
        const { currentQuestionIds, replaceIndex } = req.body;
        const questions = pickRandomQuestions(1, currentQuestionIds || []);

        if (questions.length === 0) {
            return res.json({
                success: false,
                error: '没有更多题目可换'
            });
        }

        res.json({
            success: true,
            data: {
                question: questions[0]
            }
        });
    } catch (error) {
        console.error('[AI路由] 换题失败:', error);
        res.json({
            success: false,
            error: '换题失败'
        });
    }
});

module.exports = router;
