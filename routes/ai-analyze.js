// 版本号: v1.0.0
/**
 * AI分析路由
 * 
 * 功能: 处理AI分析请求，包含次数限制和并发控制
 * 特性: 
 * - SSE流式响应，支持心跳保活
 * - 后台执行，即使前端断开也会完成分析并保存结果
 * - 限制: 每个用户只能进行一次AI分析
 */

const express = require('express');
const router = express.Router();
const sqliteDb = require('../services/sqlite-db');
const aiService = require('../services/ai-service');
const dataService = require('../services/data');
const calculator = require('../services/calculator');

/**
 * 构建完整的AI分析结果
 * 
 * @param {Object} aiResult - AI返回的原始结果
 * @param {string} gender - 性别
 * @returns {Object} 完整的结果对象
 */
function buildFullResult(aiResult, gender, questions, answers, skippedQuestions, usedModel) {
    const mbtiType = aiResult.type;
    
    let dimensionScores = aiResult.dimensionScores;
    if (!dimensionScores && aiResult.dimensions) {
        dimensionScores = {
            EI: { 
                leftScore: aiResult.dimensions.I || 50, 
                rightScore: aiResult.dimensions.E || 50,
                leftElement: 'hydro',
                rightElement: 'anemo'
            },
            SN: { 
                leftScore: aiResult.dimensions.S || 50, 
                rightScore: aiResult.dimensions.N || 50,
                leftElement: 'pyro',
                rightElement: 'geo'
            },
            TF: { 
                leftScore: aiResult.dimensions.T || 50, 
                rightScore: aiResult.dimensions.F || 50,
                leftElement: 'electro',
                rightElement: 'dendro'
            },
            JP: { 
                leftScore: aiResult.dimensions.J || 50, 
                rightScore: aiResult.dimensions.P || 50,
                leftElement: 'cryo',
                rightElement: 'physical'
            }
        };
    }
    
    return {
        type: mbtiType,
        label: dataService.getTypeLabel(mbtiType),
        typeLabel: dataService.getTypeLabel(mbtiType),
        elements: calculator.getMBTIElements(mbtiType),
        dimensionScores: dimensionScores,
        dimensions: aiResult.dimensions,
        functionStack: calculator.functionStackMap[mbtiType] || { dominant: '', auxiliary: '', tertiary: '', inferior: '' },
        characterFull: dataService.getCharacterFull(mbtiType, gender),
        characterExamples: dataService.getCharacterExamples(mbtiType),
        careerInfo: dataService.getCareerInfo(mbtiType),
        socialStyle: dataService.getSocialStyle(mbtiType),
        familyStyle: dataService.getFamilyStyle(mbtiType),
        personalGrowth: dataService.getPersonalGrowth(mbtiType),
        functionDescriptions: dataService.getFunctionDescriptions(mbtiType),
        compatibilityPairs: dataService.getCompatibilityPairs(mbtiType),
        temperamentInfo: dataService.getTemperamentInfo(mbtiType),
        cardSummary: dataService.getCardSummary(mbtiType),
        descTemplate: dataService.getDescTemplate(mbtiType),
        gender: gender,
        isAIAnalysis: true,
        // 原始答题数据（用于导出）
        questions: questions || [],
        answers: answers || [],
        skippedQuestions: skippedQuestions || [],
        usedModel: usedModel || null,
        // AI分析特有字段
        analysis: aiResult.analysis,
        cognitiveFunctions: aiResult.cognitiveFunctions,
        confidence: aiResult.confidence,
        alternativeHypotheses: aiResult.alternativeHypotheses,
        detailedEvidence: aiResult.detailedEvidence,
        caveats: aiResult.caveats,
        skippedQuestionsAnalysis: aiResult.skippedQuestionsAnalysis
    };
}

/**
 * 从请求中获取用户名
 * 
 * @param {Object} req - 请求对象
 * @returns {Promise<string|null>} 用户名或null
 */
async function getUsername(req) {
    const token = req.cookies && req.cookies.auth_token;
    if (!token) return null;
    
    const user = await sqliteDb.verifySession(token);
    return user ? user.username : null;
}

/**
 * 检查用户AI分析配额
 * 
 * GET /api/ai/check-quota
 */
router.get('/check-quota', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.json({
                success: false,
                error: '请先登录',
                canAnalyze: false,
                remainingCount: 0
            });
        }
        
        const quotaInfo = await sqliteDb.canUserAnalyze(username);
        
        res.json({
            success: true,
            canAnalyze: quotaInfo.canAnalyze,
            reason: quotaInfo.reason,
            remainingCount: quotaInfo.remainingCount
        });
    } catch (error) {
        console.error('[AI分析] 检查配额失败:', error);
        res.json({
            success: false,
            error: '检查配额失败',
            canAnalyze: false,
            remainingCount: 0
        });
    }
});

/**
 * 执行AI分析（SSE流式响应）
 * 
 * POST /api/ai/analyze
 * Body: { answers: Array, gender: String, questions: Array, provider: String, model: String, skippedQuestions: Array }
 * 
 * 响应格式: SSE流
 * - data: {"stage": "thinking", "content": "..."}  - AI思考过程
 * - data: {"stage": "progress", "percent": 50}     - 进度更新
 * - data: {"stage": "result", "data": {...}}       - 最终结果
 * - data: {"stage": "error", "error": "..."}       - 错误信息
 * - data: {"stage": "heartbeat"}                   - 心跳包（每15秒）
 */
router.post('/analyze', async (req, res) => {
    const username = await getUsername(req);
    
    if (!username) {
        return res.json({
            success: false,
            error: '请先登录'
        });
    }
    
    try {
        // 1. 检查配额
        const quotaInfo = await sqliteDb.canUserAnalyze(username);
        
        if (!quotaInfo.canAnalyze) {
            return res.json({
                success: false,
                error: quotaInfo.reason,
                remainingCount: quotaInfo.remainingCount
            });
        }
        
        // 2. 标记开始分析（防止并发请求）
        sqliteDb.startAnalysis(username);
        
        // 3. 获取请求数据
        const { answers, gender, questions, provider, model, skippedQuestions } = req.body;
        
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            sqliteDb.cancelAnalysis(username);
            return res.json({
                success: false,
                error: '请提供有效的答题数据'
            });
        }
        
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            sqliteDb.cancelAnalysis(username);
            return res.json({
                success: false,
                error: '题目数据无效'
            });
        }
        
        console.log(`[AI分析] 用户 ${username} 开始分析, 题目数量: ${answers.length}, 模型: ${provider}/${model}`);
        
        // 4. 设置SSE响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // 禁用Nginx缓冲
        
        // 5. 心跳定时器（每15秒发送一次心跳，防止超时）
        const heartbeatInterval = setInterval(() => {
            try {
                res.write(`data: ${JSON.stringify({ stage: 'heartbeat', timestamp: Date.now() })}\n\n`);
            } catch (e) {
                // 连接已关闭，忽略
            }
        }, 15000);
        
        // 6. 记录客户端是否断开
        let clientDisconnected = false;
        req.on('close', () => {
            clientDisconnected = true;
            console.log(`[AI分析] 用户 ${username} 前端连接已断开，但后端继续执行`);
            clearInterval(heartbeatInterval);
        });
        
        // 7. 后台执行AI分析（即使前端断开也会完成）
        const analysisTask = async () => {
            try {
                // 发送开始信号
                if (!clientDisconnected) {
                    res.write(`data: ${JSON.stringify({ stage: 'start', message: 'AI分析开始...' })}\n\n`);
                }
                
                // 调用AI服务，带思考过程回调
                const result = await aiService.analyzeAnswers(
                    questions, 
                    answers, 
                    provider || 'glm', 
                    model, 
                    gender, 
                    skippedQuestions || [],
                    // 思考过程回调 - 实时发送给前端
                    (reasoning) => {
                        if (!clientDisconnected) {
                            try {
                                res.write(`data: ${JSON.stringify({ 
                                    stage: 'thinking', 
                                    content: reasoning.substring(reasoning.length - 500) // 只发送最后500字符
                                })}\n\n`);
                            } catch (e) {
                                // 忽略写入错误
                            }
                        }
                    }
                );
                
                if (!result) {
                    sqliteDb.cancelAnalysis(username);
                    const errorMsg = 'AI服务未返回任何结果，可能是API调用失败或网络超时';
                    if (!clientDisconnected) {
                        res.write(`data: ${JSON.stringify({ stage: 'error', error: errorMsg, errorType: 'NO_RESULT' })}\n\n`);
                        res.end();
                    }
                    console.error(`[AI分析] ${errorMsg}: ${username}`);
                    return;
                }
                
                if (!result.type) {
                    sqliteDb.cancelAnalysis(username);
                    const errorMsg = `AI返回了数据但缺少MBTI类型。返回内容: ${JSON.stringify(result).substring(0, 200)}`;
                    if (!clientDisconnected) {
                        res.write(`data: ${JSON.stringify({ stage: 'error', error: errorMsg, errorType: 'INVALID_RESULT' })}\n\n`);
                        res.end();
                    }
                    console.error(`[AI分析] ${errorMsg}`);
                    return;
                }
                
                // 8. 构建完整结果
                const usedModel = { provider, model };
                const fullResult = buildFullResult(result, gender, questions, answers, skippedQuestions, usedModel);
                
                // 9. 保存结果到数据库（即使前端断开也保存）
                const saved = await sqliteDb.recordAnalysisResult(username, fullResult);
                
                if (!saved) {
                    console.error(`[AI分析] 保存结果失败: ${username}`);
                    if (!clientDisconnected) {
                        res.write(`data: ${JSON.stringify({ 
                            stage: 'error', 
                            error: '分析完成但保存到数据库失败，请联系管理员', 
                            errorType: 'SAVE_FAILED',
                            partialResult: { type: result.type }
                        })}\n\n`);
                        res.end();
                    }
                    return;
                }
                
                console.log(`[AI分析] 用户 ${username} 分析完成并保存, MBTI: ${result.type}`);
                
                // 清除AI答题进度
                await sqliteDb.clearProgress(username, 'ai');
                console.log(`[AI分析] 已清除AI答题进度, 用户: ${username}`);
                
                // 10. 发送结果给前端（如果还连接着）
                if (!clientDisconnected) {
                    res.write(`data: ${JSON.stringify({ stage: 'result', data: fullResult })}\n\n`);
                    res.end();
                } else {
                    console.log(`[AI分析] 用户 ${username} 结果已保存到数据库，用户可稍后查看`);
                }
                
            } catch (error) {
                sqliteDb.cancelAnalysis(username);
                console.error('[AI分析] 分析失败:', error);
                
                // 构建详细错误信息
                let errorMsg = error.message || '未知错误';
                let errorType = 'UNKNOWN';
                
                if (error.message?.includes('API key') || error.message?.includes('401')) {
                    errorMsg = 'API密钥无效或未配置，请联系管理员';
                    errorType = 'API_KEY_ERROR';
                } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
                    errorMsg = 'API调用频率超限，请稍后重试';
                    errorType = 'RATE_LIMIT';
                } else if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
                    errorMsg = 'AI服务响应超时，请稍后重试';
                    errorType = 'TIMEOUT';
                } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
                    errorMsg = '无法连接到AI服务，请检查网络';
                    errorType = 'NETWORK_ERROR';
                } else if (error.message?.includes('JSON')) {
                    errorMsg = `AI返回的数据格式错误: ${error.message}`;
                    errorType = 'PARSE_ERROR';
                }
                
                if (!clientDisconnected) {
                    res.write(`data: ${JSON.stringify({ 
                        stage: 'error', 
                        error: errorMsg, 
                        errorType: errorType,
                        detail: error.message
                    })}\n\n`);
                    res.end();
                }
            } finally {
                clearInterval(heartbeatInterval);
                // 无论成功还是失败，都清除分析标记
                sqliteDb.cancelAnalysis(username);
            }
        };
        
        // 启动后台任务
        analysisTask();
        
    } catch (error) {
        sqliteDb.cancelAnalysis(username);
        console.error('[AI分析] 路由错误:', error);
        
        // 检查是否已经设置了SSE头
        if (!res.headersSent) {
            res.json({
                success: false,
                error: error.message || 'AI分析失败，请稍后重试'
            });
        } else {
            try {
                res.write(`data: ${JSON.stringify({ stage: 'error', error: error.message || 'AI分析失败，请稍后重试' })}\n\n`);
                res.end();
            } catch (e) {
                // 忽略
            }
        }
    }
});

/**
 * 获取用户AI分析历史
 * 
 * GET /api/ai/history
 */
router.get('/history', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.json({
                success: false,
                error: '请先登录',
                history: []
            });
        }
        
        const history = await sqliteDb.getUserAnalysisHistory(username);
        
        res.json({
            success: true,
            history: history
        });
    } catch (error) {
        console.error('[AI分析] 获取历史失败:', error);
        res.json({
            success: false,
            error: '获取历史失败',
            history: []
        });
    }
});

/**
 * 获取剩余分析次数
 * 
 * GET /api/ai/quota
 */
router.get('/quota', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.json({
                success: false,
                remainingCount: 0
            });
        }
        
        const remainingCount = await sqliteDb.getRemainingQuota(username);
        
        res.json({
            success: true,
            remainingCount: remainingCount
        });
    } catch (error) {
        console.error('[AI分析] 获取配额失败:', error);
        res.json({
            success: false,
            remainingCount: 0
        });
    }
});

module.exports = router;
