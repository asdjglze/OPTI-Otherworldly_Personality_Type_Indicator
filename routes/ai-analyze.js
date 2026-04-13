// 版本号: v1.0.0
/**
 * AI 分析路由
 * 
 * 功能: 处理 AI 深度分析模式相关的 API 请求
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const aiService = require('../services/ai-service');
const dataService = require('../services/data');
const calculator = require('../services/calculator');
const auth = require('../services/auth');

let questionsCache = null;

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
 * 加载题库数据
 * 
 * @returns {Array} 题库数组
 */
function loadQuestions() {
    if (questionsCache) {
        return questionsCache;
    }
    
    const questionsPath = path.join(__dirname, '../data/ai-questions.json');
    
    if (!fs.existsSync(questionsPath)) {
        throw new Error('题库文件不存在: ' + questionsPath);
    }
    
    const content = fs.readFileSync(questionsPath, 'utf-8');
    questionsCache = JSON.parse(content);
    
    return questionsCache;
}

/**
 * 从题库中抽取指定数量的题目，确保覆盖所有维度
 * 
 * @param {Array} allQuestions - 完整题库
 * @param {number} count - 需要抽取的题目数量（默认5）
 * @returns {Array} 抽取的题目
 */
function selectQuestions(allQuestions, count = 5) {
    const selected = [];
    const dimensions = ['E/I', 'S/N', 'T/F', 'J/P'];
    const usedIds = new Set();
    
    // 首先确保每个维度至少有一道题
    for (const dim of dimensions) {
        const candidates = allQuestions.filter(q => 
            q.dimensions && q.dimensions.includes(dim) && !usedIds.has(q.id)
        );
        if (candidates.length > 0) {
            const randomQ = candidates[Math.floor(Math.random() * candidates.length)];
            selected.push(randomQ);
            usedIds.add(randomQ.id);
        }
    }
    
    // 如果需要更多题目，从剩余题目中随机抽取
    const remaining = allQuestions.filter(q => !usedIds.has(q.id));
    while (selected.length < count && remaining.length > 0) {
        const randomIndex = Math.floor(Math.random() * remaining.length);
        selected.push(remaining[randomIndex]);
        usedIds.add(remaining[randomIndex].id);
        remaining.splice(randomIndex, 1);
    }
    
    return selected.sort(() => Math.random() - 0.5);
}

/**
 * 替换一道题，确保换题后仍覆盖所有维度
 * 
 * @param {Array} allQuestions - 完整题库
 * @param {Array} currentQuestions - 当前5道题
 * @param {number} replaceIndex - 要替换的题目索引（0-4）
 * @returns {Object|null} 新题目或null
 */
function replaceQuestion(allQuestions, currentQuestions, replaceIndex) {
    const replacedQ = currentQuestions[replaceIndex];
    const replacedDims = replacedQ.dimensions || [];
    const currentIds = currentQuestions.map(q => q.id);
    
    const otherQuestions = currentQuestions.filter((_, i) => i !== replaceIndex);
    const coveredDims = new Set();
    otherQuestions.forEach(q => {
        if (q.dimensions) {
            q.dimensions.forEach(dim => coveredDims.add(dim));
        }
    });
    
    const uncoveredDims = replacedDims.filter(dim => !coveredDims.has(dim));
    
    let candidates;
    if (uncoveredDims.length > 0) {
        candidates = allQuestions.filter(q => 
            q.dimensions && 
            q.dimensions.some(dim => uncoveredDims.includes(dim)) &&
            !currentIds.includes(q.id)
        );
    } else {
        candidates = allQuestions.filter(q => 
            !currentIds.includes(q.id)
        );
    }
    
    if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
    }
    
    return null;
}

/**
 * 格式化题目数据返回给前端
 * 
 * @param {Object} q - 原始题目对象
 * @returns {Object} 格式化后的题目
 */
function formatQuestion(q) {
    return {
        id: q.id,
        scene: q.scene,
        question: q.question,
        hint: q.hint,
        dimensions: q.dimensions || [],
        creator: q.creator
    };
}

/**
 * GET /api/ai-models
 * 获取可用的 AI 模型列表
 */
router.get('/ai-models', (req, res) => {
    try {
        const models = aiService.getAvailableModels();
        const defaultModel = aiService.getSystemDefaultModel();
        
        res.json({
            success: true,
            data: {
                models: models,
                defaultModel: defaultModel
            }
        });
        
    } catch (error) {
        console.error('获取模型列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取模型列表失败: ' + error.message
        });
    }
});

/**
 * GET /api/ai-questions
 * 获取大模型分析模式的题目
 * 
 * Query参数:
 * - count: 题目数量（默认10，可选10或25）
 */
router.get('/ai-questions', (req, res) => {
    try {
        const count = parseInt(req.query.count) || 10;
        const validCount = [5, 10, 25].includes(count) ? count : 10;
        
        const allQuestions = loadQuestions();
        const selected = selectQuestions(allQuestions, validCount);
        
        res.json({
            success: true,
            data: {
                questions: selected.map(formatQuestion),
                allDimensions: ['E/I', 'S/N', 'T/F', 'J/P']
            }
        });
        
    } catch (error) {
        console.error('获取题目失败:', error);
        res.status(500).json({
            success: false,
            error: '获取题目失败: ' + error.message
        });
    }
});

/**
 * POST /api/ai-questions/replace
 * 换题接口
 */
router.post('/ai-questions/replace', (req, res) => {
    try {
        const { currentQuestionIds, replaceIndex } = req.body;
        
        if (!Array.isArray(currentQuestionIds) || currentQuestionIds.length < 5) {
            return res.status(400).json({
                success: false,
                error: '当前题目列表无效'
            });
        }
        
        if (replaceIndex < 0 || replaceIndex >= currentQuestionIds.length) {
            return res.status(400).json({
                success: false,
                error: '替换索引无效'
            });
        }
        
        const allQuestions = loadQuestions();
        const currentQuestions = currentQuestionIds.map(id => 
            allQuestions.find(q => q.id === id)
        ).filter(q => q);
        
        if (currentQuestions.length !== currentQuestionIds.length) {
            return res.status(400).json({
                success: false,
                error: '无法找到所有当前题目'
            });
        }
        
        const newQuestion = replaceQuestion(allQuestions, currentQuestions, replaceIndex);
        
        if (!newQuestion) {
            return res.status(400).json({
                success: false,
                error: '没有可用的替换题目'
            });
        }
        
        res.json({
            success: true,
            data: {
                question: formatQuestion(newQuestion)
            }
        });
        
    } catch (error) {
        console.error('换题失败:', error);
        res.status(500).json({
            success: false,
            error: '换题失败: ' + error.message
        });
    }
});

/**
 * POST /api/ai-analyze
 * 提交答案进行 AI 分析（支持流式进度更新）
 */
router.post('/ai-analyze', async (req, res) => {
    try {
        const { answers, gender, questions, provider, model, skippedQuestions } = req.body;
        
        console.log('[AI分析路由] 收到请求');
        console.log('[AI分析路由] answers数量:', answers ? answers.length : 0);
        console.log('[AI分析路由] gender:', gender);
        console.log('[AI分析路由] questions数量:', questions ? questions.length : 0);
        console.log('[AI分析路由] skippedQuestions数量:', skippedQuestions ? skippedQuestions.length : 0);
        
        // 支持快速测试(5题)、基础测试(10题)和完整测试(25题)
        const validAnswerCounts = [5, 10, 25];
        if (!answers || !Array.isArray(answers) || !validAnswerCounts.includes(answers.length)) {
            return res.status(400).json({
                success: false,
                error: `回答数据无效，需要5、10或25个回答，当前有${answers ? answers.length : 0}个`
            });
        }
        
        if (!gender || !['male', 'female'].includes(gender)) {
            return res.status(400).json({
                success: false,
                error: '性别参数无效'
            });
        }
        
        const expectedCount = answers.length;
        
        let questionsToAnalyze = questions;
        if (!questionsToAnalyze || questionsToAnalyze.length !== expectedCount) {
            const allQuestions = loadQuestions();
            questionsToAnalyze = answers.map(a => {
                return allQuestions.find(q => q.id === a.questionId);
            }).filter(q => q);
        }
        
        if (questionsToAnalyze.length !== expectedCount) {
            return res.status(400).json({
                success: false,
                error: `无法匹配所有题目，需要${expectedCount}道，匹配到${questionsToAnalyze.length}道`
            });
        }
        
        // 设置 SSE 响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        
        /**
         * 发送进度更新
         * @param {string} stage - 阶段名称
         * @param {string} message - 进度消息
         * @param {number} progress - 进度百分比 (0-100)
         */
        const sendProgress = (stage, message, progress = 0) => {
            res.write(`data: ${JSON.stringify({ stage, message, progress })}\n\n`);
        };
        
        // 阶段1：准备分析
        sendProgress('preparing', '正在准备分析数据...', 5);
        
        // 阶段2：连接大模型
        sendProgress('connecting', '正在连接大模型服务...', 10);
        
        // 阶段3：发送数据
        sendProgress('sending', '正在发送您的回答给大模型...', 15);
        
        // 阶段4：大模型思考中
        sendProgress('thinking', '大模型正在深度思考您的回答...', 20);
        
        // 传递抛弃的题目给AI服务（不再需要思考内容回调）
        const aiResult = await aiService.analyzeAnswers(questionsToAnalyze, answers, provider, model, gender, skippedQuestions || []);
        
        // 阶段5：生成报告
        sendProgress('generating', '正在生成分析报告...', 80);
        
        const mbtiType = aiResult.type || 'INFP'; // 默认类型防止 undefined
        
        // 确保 elements 正确生成
        const elements = calculator.getMBTIElements(mbtiType);
        console.log('[AI分析] mbtiType:', mbtiType, 'elements:', elements);
        
        const dimensionScores = {
            EI: {
                leftScore: aiResult.dimensions.I,
                rightScore: aiResult.dimensions.E,
                leftElement: 'hydro',
                rightElement: 'anemo',
                leftLabel: '内倾(I)',
                rightLabel: '外倾(E)'
            },
            SN: {
                leftScore: aiResult.dimensions.S,
                rightScore: aiResult.dimensions.N,
                leftElement: 'pyro',
                rightElement: 'geo',
                leftLabel: '感觉(S)',
                rightLabel: '直觉(N)'
            },
            TF: {
                leftScore: aiResult.dimensions.T,
                rightScore: aiResult.dimensions.F,
                leftElement: 'electro',
                rightElement: 'dendro',
                leftLabel: '思考(T)',
                rightLabel: '情感(F)'
            },
            JP: {
                leftScore: aiResult.dimensions.J,
                rightScore: aiResult.dimensions.P,
                leftElement: 'cryo',
                rightElement: 'physical',
                leftLabel: '判断(J)',
                rightLabel: '感知(P)'
            }
        };
        
        // 阶段6：组装数据
        sendProgress('assembling', '正在组装分析结果...', 90);
        
        // 构建完整结果用于返回给前端
        const fullResult = {
            type: mbtiType,
            label: aiResult.typeLabel || dataService.getTypeLabel(mbtiType),
            elements: elements,
            dimensionScores: dimensionScores,
            functionStack: aiResult.cognitiveFunctions || calculator.functionStackMap[mbtiType] || {
                dominant: '', auxiliary: '', tertiary: '', inferior: ''
            },
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
            timestamp: new Date().toISOString(),
            isAIAnalysis: true,
            usedModel: {
                provider: provider || 'glm',
                model: model || 'glm-4-flash'
            },
            skippedQuestionsCount: skippedQuestions ? skippedQuestions.length : 0,
            // 保存用户的原始答卷内容
            questions: questionsToAnalyze,
            answers: answers,
            userInputs: answers.map(a => a.answerText || ''),
            skippedQuestions: skippedQuestions || [],
            aiAnalysis: {
                confidence: aiResult.confidence,
                cognitiveFunctions: aiResult.cognitiveFunctions,
                alternativeHypotheses: aiResult.alternativeHypotheses,
                detailedEvidence: aiResult.detailedEvidence,
                caveats: aiResult.caveats,
                analysisSummary: aiResult.analysis,
                skippedQuestionsAnalysis: aiResult.skippedQuestionsAnalysis || ''
            }
        };
        
        // 简化存储：只存储必要字段，报告数据在获取时重新组装
        const savedResult = {
            type: mbtiType,
            gender: gender,
            isAIAnalysis: true,
            createdAt: Date.now(),
            usedModel: {
                provider: provider || 'glm',
                model: model || 'glm-4-flash'
            },
            dimensionScores: dimensionScores,
            // 用户答卷内容（用于导出）
            questions: questionsToAnalyze,
            answers: answers.map(a => ({
                questionId: a.questionId,
                answerText: a.answerText || ''
            })),
            skippedQuestions: skippedQuestions || [],
            // AI分析特有字段
            aiAnalysis: {
                confidence: aiResult.confidence,
                cognitiveFunctions: aiResult.cognitiveFunctions,
                alternativeHypotheses: aiResult.alternativeHypotheses,
                detailedEvidence: aiResult.detailedEvidence,
                caveats: aiResult.caveats,
                analysisSummary: aiResult.analysis,
                skippedQuestionsAnalysis: aiResult.skippedQuestionsAnalysis || ''
            }
        };
        
        // 获取登录用户并保存结果
        const username = getUsername(req);
        if (username) {
            auth.saveResult(username, savedResult);
        }
        
        // 阶段7：完成
        sendProgress('complete', '分析完成！', 100);
        
        // 发送最终结果
        res.write(`data: ${JSON.stringify({ stage: 'result', data: fullResult })}\n\n`);
        res.end();
        
    } catch (error) {
        console.error('AI分析失败:', error);
        // 发送错误信息
        res.write(`data: ${JSON.stringify({ stage: 'error', error: error.message })}\n\n`);
        res.end();
    }
});

/**
 * GET /api/ai-result/latest
 * 获取用户最新的AI分析结果
 */
router.get('/ai-result/latest', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({
                success: false,
                error: '未登录'
            });
        }
        
        const results = auth.getResults(username);
        
        // 找到最新的AI分析结果
        const aiResult = results.find(r => r.isAIAnalysis);
        
        if (aiResult) {
            // 重新组装完整结果
            const fullResult = {
                type: aiResult.type,
                label: dataService.getTypeLabel(aiResult.type),
                elements: calculator.getMBTIElements(aiResult.type),
                dimensionScores: aiResult.dimensionScores,
                gender: aiResult.gender,
                isAIAnalysis: true,
                usedModel: aiResult.usedModel,
                aiAnalysis: aiResult.aiAnalysis,
                questions: aiResult.questions,
                answers: aiResult.answers,
                skippedQuestions: aiResult.skippedQuestions,
                characterFull: dataService.getCharacterFull(aiResult.type, aiResult.gender),
                characterExamples: dataService.getCharacterExamples(aiResult.type),
                careerInfo: dataService.getCareerInfo(aiResult.type),
                socialStyle: dataService.getSocialStyle(aiResult.type),
                familyStyle: dataService.getFamilyStyle(aiResult.type),
                personalGrowth: dataService.getPersonalGrowth(aiResult.type),
                functionDescriptions: dataService.getFunctionDescriptions(aiResult.type),
                compatibilityPairs: dataService.getCompatibilityPairs(aiResult.type),
                temperamentInfo: dataService.getTemperamentInfo(aiResult.type),
                cardSummary: dataService.getCardSummary(aiResult.type),
                descTemplate: dataService.getDescTemplate(aiResult.type)
            };
            
            res.json({
                success: true,
                data: fullResult
            });
        } else {
            res.json({
                success: false,
                error: '暂无AI分析记录'
            });
        }
        
    } catch (error) {
        console.error('获取AI结果失败:', error);
        res.status(500).json({
            success: false,
            error: '获取AI结果失败: ' + error.message
        });
    }
});

module.exports = router;
