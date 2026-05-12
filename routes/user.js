// 版本号: v1.0.0
/**
 * 用户路由
 * 
 * 功能: 处理用户注册、登录、登出等请求
 * 数据: 使用SQLite数据库存储所有用户数据
 */

const express = require('express');
const router = express.Router();
const sqliteDb = require('../services/sqlite-db');
const calculator = require('../services/calculator');
const dataService = require('../services/data');

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
 * POST /api/auth/register
 * 用户注册（需要邀请码）
 */
router.post('/auth/register', async (req, res) => {
    try {
        const { username, password, inviteCode } = req.body;
        
        if (!inviteCode) {
            return res.status(400).json({ success: false, error: '请输入邀请码' });
        }
        
        const result = await sqliteDb.register(username, password, inviteCode);
        
        if (result.success) {
            res.json({ success: true, message: '注册成功' });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const result = await sqliteDb.login(username, password);
        
        if (result.success) {
            // 设置cookie（7天有效期）
            res.cookie('auth_token', result.token, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            });
            
            res.json({
                success: true,
                username: result.username,
                expiresAt: result.expiresAt
            });
        } else {
            res.status(401).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post('/auth/logout', async (req, res) => {
    try {
        const token = req.cookies && req.cookies.auth_token;
        await sqliteDb.logout(token);
        
        res.clearCookie('auth_token');
        res.json({ success: true, message: '已登出' });
    } catch (error) {
        console.error('登出失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/auth/check
 * 检查登录状态
 */
router.get('/auth/check', async (req, res) => {
    try {
        const token = req.cookies && req.cookies.auth_token;
        
        if (!token) {
            return res.json({ success: false, loggedIn: false });
        }
        
        const user = await sqliteDb.verifySession(token);
        
        if (user) {
            res.json({
                success: true,
                loggedIn: true,
                username: user.username
            });
        } else {
            res.clearCookie('auth_token');
            res.json({ success: false, loggedIn: false });
        }
    } catch (error) {
        console.error('检查登录状态失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/user/results
 * 获取用户所有答卷记录
 */
router.get('/user/results', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const results = await sqliteDb.getResults(username);
        
        // 简化返回数据
        const simplifiedResults = results.map((result, index) => ({
            index: index,
            type: result.type,
            label: dataService.getTypeLabel(result.type),
            gender: result.gender,
            savedAt: result.savedAt,
            isAIAnalysis: result.isAIAnalysis || false
        }));
        
        res.json({
            success: true,
            data: simplifiedResults,
            count: simplifiedResults.length
        });
    } catch (error) {
        console.error('获取答卷列表失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/user/result
 * 保存答卷结果
 */
router.post('/user/result', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const result = req.body;
        const success = await sqliteDb.saveResult(username, result);
        
        if (success) {
            res.json({ success: true, message: '答卷已保存' });
        } else {
            res.status(500).json({ success: false, error: '保存失败' });
        }
    } catch (error) {
        console.error('保存答卷失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/user/result/:index
 * 获取指定答卷详情
 */
router.get('/user/result/:index', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const index = parseInt(req.params.index);
        
        // 使用 getResultDetail 获取完整的答卷数据
        const result = await sqliteDb.getResultDetail(username, index);
        
        if (!result) {
            return res.status(404).json({ success: false, error: '答卷不存在' });
        }
        
        // 重建完整结果
        const mbtiType = result.type;
        const gender = result.gender || 'male';
        
        // 处理维度数据：支持两种格式
        let dimensionScores = result.dimensionScores;
        if (!dimensionScores && result.dimensions) {
            // AI分析返回的是 dimensions 格式，转换为 dimensionScores 格式
            // 注意：需要添加 leftElement 和 rightElement 字段
            dimensionScores = {
                EI: { 
                    leftScore: result.dimensions.I || 50, 
                    rightScore: result.dimensions.E || 50,
                    leftElement: 'hydro',   // I = 内倾 = 水
                    rightElement: 'anemo'  // E = 外倾 = 风
                },
                SN: { 
                    leftScore: result.dimensions.S || 50, 
                    rightScore: result.dimensions.N || 50,
                    leftElement: 'pyro',   // S = 感觉 = 火
                    rightElement: 'geo'    // N = 直觉 = 岩
                },
                TF: { 
                    leftScore: result.dimensions.T || 50, 
                    rightScore: result.dimensions.F || 50,
                    leftElement: 'electro', // T = 思考 = 雷
                    rightElement: 'dendro'  // F = 情感 = 草
                },
                JP: { 
                    leftScore: result.dimensions.J || 50, 
                    rightScore: result.dimensions.P || 50,
                    leftElement: 'cryo',    // J = 判断 = 冰
                    rightElement: 'physical' // P = 感知 = 原
                }
            };
        }
        
        // 如果 dimensionScores 存在但缺少元素字段，补充它们
        if (dimensionScores) {
            const elementMap = {
                EI: { left: 'hydro', right: 'anemo' },
                SN: { left: 'pyro', right: 'geo' },
                TF: { left: 'electro', right: 'dendro' },
                JP: { left: 'cryo', right: 'physical' }
            };
            
            for (const dim in dimensionScores) {
                if (!dimensionScores[dim].leftElement) {
                    dimensionScores[dim].leftElement = elementMap[dim].left;
                }
                if (!dimensionScores[dim].rightElement) {
                    dimensionScores[dim].rightElement = elementMap[dim].right;
                }
            }
        }
        
        const fullResult = {
            type: mbtiType,
            label: dataService.getTypeLabel(mbtiType),
            elements: calculator.getMBTIElements(mbtiType),
            dimensionScores: dimensionScores,
            dimensions: result.dimensions, // 保留原始 dimensions
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
            timestamp: result.savedAt,
            isAIAnalysis: result.isAIAnalysis || false,
            // AI分析特有字段
            analysis: result.analysis,
            cognitiveFunctions: result.cognitiveFunctions,
            confidence: result.confidence,
            alternativeHypotheses: result.alternativeHypotheses,
            detailedEvidence: result.detailedEvidence,
            caveats: result.caveats,
            skippedQuestionsAnalysis: result.skippedQuestionsAnalysis
        };
        
        res.json({ success: true, data: fullResult });
    } catch (error) {
        console.error('获取答卷详情失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/user/progress/check
 * 快速检查是否有进度（不返回完整数据，用于快速提示）
 */
router.get('/user/progress/check', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.json({ hasNormalProgress: false, hasAIProgress: false });
        }
        
        // 只检查是否存在进度，不加载完整数据
        const normalProgress = await sqliteDb.getProgressMeta(username, 'normal');
        const aiProgress = await sqliteDb.getProgressMeta(username, 'ai');
        
        res.json({
            hasNormalProgress: !!normalProgress,
            normalProgressMeta: normalProgress ? {
                savedAt: normalProgress.savedAt,
                questionSet: normalProgress.questionSet,
                answeredCount: normalProgress.answeredCount
            } : null,
            hasAIProgress: !!aiProgress,
            aiProgressMeta: aiProgress ? {
                savedAt: aiProgress.savedAt,
                answeredCount: aiProgress.answeredCount,
                totalCount: aiProgress.totalCount
            } : null
        });
    } catch (error) {
        console.error('检查进度失败:', error);
        res.json({ hasNormalProgress: false, hasAIProgress: false });
    }
});

/**
 * GET /api/user/progress
 * 获取普通答题进度
 */
router.get('/user/progress', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const progress = await sqliteDb.getProgress(username, 'normal');
        
        res.json({
            success: true,
            hasProgress: !!progress,
            data: progress
        });
    } catch (error) {
        console.error('获取普通答题进度失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/user/progress
 * 保存普通答题进度
 */
router.post('/user/progress', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const progress = req.body;
        progress.progressType = 'normal';
        const success = await sqliteDb.saveProgress(username, 'normal', progress);
        
        if (success) {
            res.json({ success: true, message: '进度已保存' });
        } else {
            res.status(500).json({ success: false, error: '保存失败' });
        }
    } catch (error) {
        console.error('保存普通答题进度失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/user/progress/ai
 * 获取AI答题进度
 */
router.get('/user/progress/ai', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const progress = await sqliteDb.getProgress(username, 'ai');
        
        res.json({
            success: true,
            hasProgress: !!progress,
            data: progress
        });
    } catch (error) {
        console.error('获取AI答题进度失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * POST /api/user/progress/ai
 * 保存AI答题进度
 */
router.post('/user/progress/ai', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const success = await sqliteDb.saveProgress(username, 'ai', req.body);
        
        if (success) {
            res.json({ success: true, message: 'AI答题进度已保存' });
        } else {
            res.status(500).json({ success: false, error: '保存失败' });
        }
    } catch (error) {
        console.error('保存AI答题进度失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * DELETE /api/user/progress
 * 清除答题进度
 */
router.delete('/user/progress', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        await sqliteDb.clearProgress(username);
        res.json({ success: true, message: '进度已清除' });
    } catch (error) {
        console.error('清除答题进度失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/user/quota
 * 获取AI分析剩余次数
 */
router.get('/user/quota', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.json({ success: true, remainingCount: 0 });
        }
        
        const remainingCount = await sqliteDb.getRemainingQuota(username);
        
        res.json({
            success: true,
            remainingCount: remainingCount
        });
    } catch (error) {
        console.error('获取配额失败:', error);
        res.json({ success: false, remainingCount: 0 });
    }
});

/**
 * 简单的文本渲染器（服务端版本）
 * 将MBTI术语替换为原神元素术语
 */
const TermRendererServer = {
    dimensionElements: {
        'E': '风', 'I': '水', 'S': '火', 'N': '岩',
        'T': '雷', 'F': '草', 'J': '冰', 'P': '原'
    },
    
    typeToElements: {
        'INTJ': '水岩雷冰', 'INTP': '水岩雷原', 'ENTJ': '风岩雷冰', 'ENTP': '风岩雷原',
        'INFJ': '水岩草冰', 'INFP': '水岩草原', 'ENFJ': '风岩草冰', 'ENFP': '风岩草原',
        'ISTJ': '水火雷冰', 'ISFJ': '水火草冰', 'ESTJ': '风火雷冰', 'ESFJ': '风火草冰',
        'ISTP': '水火雷原', 'ISFP': '水火草原', 'ESTP': '风火雷原', 'ESFP': '风火草原'
    },
    
    cognitiveFunctionReactions: {
        'Te': '超导', 'Ti': '感电', 'Fe': '扩散', 'Fi': '绽放',
        'Ne': '激化', 'Ni': '结晶', 'Se': '燃烧', 'Si': '蒸发'
    },
    
    typeGroupMappings: {
        'NT': '岩雷', 'NF': '岩草', 'SJ': '火冰', 'SP': '火原'
    },
    
    render(text) {
        if (typeof text !== 'string') return text;
        let result = text;
        result = result.replace(/\bMBTI\b/g, '原神元素反应');
        result = result.replace(/\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/g, 
            (match) => this.typeToElements[match] || match);
        result = result.replace(/\b(Te|Ti|Fe|Fi|Ne|Ni|Se|Si)\b/g,
            (match) => this.cognitiveFunctionReactions[match] || match);
        result = result.replace(/\b(NT|NF|SJ|SP)\b/g,
            (match) => this.typeGroupMappings[match] || match);
        const dimensionLetters = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
        dimensionLetters.forEach(letter => {
            const pattern = new RegExp(`(?<![a-zA-Z])${letter}(?![a-zA-Z])`, 'g');
            result = result.replace(pattern, this.dimensionElements[letter] || letter);
        });
        return result;
    },
    
    getElements(type) {
        return this.typeToElements[type] || type;
    },
    
    getReaction(func) {
        return this.cognitiveFunctionReactions[func] || func;
    }
};

/**
 * GET /api/user/export/answers/:index
 * 导出答卷（JSON格式）
 */
router.get('/user/export/answers/:index', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const index = parseInt(req.params.index);
        const results = await sqliteDb.getResults(username);
        const result = results[index];
        
        if (!result) {
            return res.status(404).json({ success: false, error: '答卷不存在' });
        }
        
        const fullResult = await sqliteDb.getResultDetail(username, index, result.isAIAnalysis);
        
        let exportRecord;
        
        if (result.isAIAnalysis) {
            const answersObject = {};
            if (fullResult.answers) {
                if (Array.isArray(fullResult.answers)) {
                    fullResult.answers.forEach((item, idx) => {
                        if (item && item.answerText) {
                            answersObject[idx] = item.answerText;
                        }
                    });
                } else if (typeof fullResult.answers === 'object') {
                    Object.keys(fullResult.answers).forEach(key => {
                        const value = fullResult.answers[key];
                        if (typeof value === 'string') {
                            answersObject[key] = value;
                        } else if (value && value.answerText) {
                            answersObject[key] = value.answerText;
                        }
                    });
                }
            }
            
            exportRecord = {
                type: 'ai',
                gender: fullResult.gender,
                savedAt: fullResult.savedAt,
                usedModel: fullResult.usedModel,
                questions: fullResult.questions || [],
                answers: answersObject,
                skippedQuestions: fullResult.skippedQuestions || []
            };
        } else {
            const questionSet = fullResult.questionSet || fullResult.version || 'mbti-200';
            exportRecord = {
                type: 'normal',
                gender: fullResult.gender,
                savedAt: fullResult.savedAt,
                questionSet: questionSet,
                answers: fullResult.answers || []
            };
        }
        
        const exportData = {
            exportType: 'answers',
            exportTime: new Date().toISOString(),
            records: [exportRecord]
        };
        
        res.json(exportData);
    } catch (error) {
        console.error('导出答卷失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/user/export/report/:index
 * 导出分析报告（MD格式）
 */
router.get('/user/export/report/:index', async (req, res) => {
    try {
        const username = await getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const index = parseInt(req.params.index);
        const results = await sqliteDb.getResults(username);
        const result = results[index];
        
        if (!result) {
            return res.status(404).json({ success: false, error: '答卷不存在' });
        }
        
        const fullResult = await sqliteDb.getResultDetail(username, index, result.isAIAnalysis);
        
        const mbtiType = fullResult.type;
        const gender = fullResult.gender || 'male';
        const elementsDisplay = TermRendererServer.getElements(mbtiType);
        
        const typeLabel = dataService.getTypeLabel(mbtiType);
        const characterFull = dataService.getCharacterFull(mbtiType, gender);
        const characterExamples = dataService.getCharacterExamples(mbtiType);
        const careerInfo = dataService.getCareerInfo(mbtiType);
        const socialStyle = dataService.getSocialStyle(mbtiType);
        const familyStyle = dataService.getFamilyStyle(mbtiType);
        const personalGrowth = dataService.getPersonalGrowth(mbtiType);
        const functionDescriptions = dataService.getFunctionDescriptions(mbtiType);
        const compatibilityPairs = dataService.getCompatibilityPairs(mbtiType);
        const temperamentInfo = dataService.getTemperamentInfo(mbtiType);
        const cardSummary = dataService.getCardSummary(mbtiType);
        
        let md = `# 原神元素反应性格分析报告\n\n`;
        md += `> 导出时间：${new Date().toLocaleString('zh-CN')}\n`;
        md += `> 测试类型：${fullResult.isAIAnalysis ? '大模型深度分析' : '普通测试'}\n`;
        if (fullResult.usedModel) {
            md += `> 使用模型：${fullResult.usedModel.model}\n`;
        }
        md += '\n---\n\n';
        
        md += `## 一、性格类型\n\n`;
        md += `### ${elementsDisplay} - ${typeLabel}\n\n`;
        md += `**性别**：${gender === 'male' ? '男性' : '女性'}\n\n`;
        
        if (fullResult.dimensionScores) {
            md += `### 维度得分\n\n`;
            md += `| 维度 | 左侧 | 右侧 | 结果 |\n`;
            md += `|------|------|------|------|\n`;
            const dims = ['EI', 'SN', 'TF', 'JP'];
            const dimNames = {
                EI: { left: '风（外倾）', right: '水（内倾）' },
                SN: { left: '火（感觉）', right: '岩（直觉）' },
                TF: { left: '雷（思考）', right: '草（情感）' },
                JP: { left: '冰（判断）', right: '原（感知）' }
            };
            dims.forEach(dim => {
                const score = fullResult.dimensionScores[dim];
                if (score) {
                    const info = dimNames[dim];
                    md += `| ${dim} | ${info.left} ${score.leftScore}% | ${info.right} ${score.rightScore}% | ${score.leftScore >= score.rightScore ? info.left.split('（')[0] : info.right.split('（')[0]} |\n`;
                }
            });
            md += '\n';
        }
        
        md += `## 二、代表角色\n\n`;
        if (characterFull && typeof characterFull === 'object') {
            md += `**代表角色**：${characterFull.name}\n\n`;
            if (characterFull.vision_cn) md += `**元素**：${characterFull.vision_cn}\n\n`;
            if (characterFull.region) md += `**地区**：${characterFull.region}\n\n`;
            if (characterFull.affiliation) md += `**势力**：${characterFull.affiliation}\n\n`;
            if (characterFull.weapon_type) md += `**武器**：${characterFull.weapon_type}\n\n`;
            if (characterFull.constellation) md += `**命座**：${characterFull.constellation}\n\n`;
            if (characterFull.title) md += `**称号**：${characterFull.title}\n\n`;
            if (characterFull.description) md += `**简介**：${characterFull.description}\n\n`;
        }
        
        if (characterExamples && characterExamples.length > 0) {
            md += `### 同类型角色\n\n`;
            characterExamples.forEach(char => {
                md += `- **${char.name}**（${char.vision_cn || ''}，${char.region || '未知'}）\n`;
            });
            md += '\n';
        }
        
        if (cardSummary) {
            md += `## 三、性格简述\n\n`;
            md += `${TermRendererServer.render(cardSummary)}\n\n`;
        }
        
        if (temperamentInfo) {
            md += `## 四、气质类型\n\n`;
            let temperamentName = temperamentInfo.name || '';
            if (temperamentName.endsWith('本命')) {
                temperamentName = temperamentName.slice(0, -2) + '型';
            }
            md += `**气质类型**：${temperamentName}\n\n`;
            if (temperamentInfo.element) {
                md += `**对应元素**：${temperamentInfo.element}\n\n`;
            }
            if (temperamentInfo.description) {
                md += `${temperamentInfo.description}\n\n`;
            }
        }
        
        if (functionDescriptions && Object.keys(functionDescriptions).length > 0) {
            md += `## 五、认知功能\n\n`;
            const funcLabels = {
                'dominant': '主导功能', 'auxiliary': '辅助功能',
                'tertiary': '第三功能', 'inferior': '劣势功能'
            };
            Object.entries(functionDescriptions).forEach(([key, desc]) => {
                const label = funcLabels[key] || key;
                md += `### ${label}\n\n`;
                md += `${TermRendererServer.render(desc)}\n\n`;
            });
        }
        
        if (fullResult.isAIAnalysis && fullResult.analysis) {
            md += `## 六、大模型深度分析\n\n`;
            
            if (fullResult.confidence) {
                md += `**分析置信度**：${fullResult.confidence}%\n\n`;
            }
            
            if (fullResult.analysis) {
                md += `### 分析总结\n\n`;
                md += `${TermRendererServer.render(fullResult.analysis)}\n\n`;
            }
            
            if (fullResult.detailedEvidence && fullResult.detailedEvidence.length > 0) {
                md += `### 逐题分析\n\n`;
                fullResult.detailedEvidence.forEach((evidence, idx) => {
                    const qid = evidence.question_id || idx + 1;
                    md += `#### 问题 ${qid}\n\n`;
                    if (evidence.user_excerpt) {
                        md += `> 您的回答："${evidence.user_excerpt}"\n\n`;
                    }
                    if (evidence.observed_trait) {
                        md += `**观察到的特质**：${TermRendererServer.render(evidence.observed_trait)}\n\n`;
                    }
                    if (evidence.reasoning) {
                        md += `${TermRendererServer.render(evidence.reasoning)}\n\n`;
                    }
                    md += '---\n\n';
                });
            }
            
            if (fullResult.alternativeHypotheses && fullResult.alternativeHypotheses.length > 0) {
                md += `### 其他可能性\n\n`;
                md += `> 若结论与自我认知存在差异，可参考以下备选类型\n\n`;
                fullResult.alternativeHypotheses.forEach(alt => {
                    const altElements = TermRendererServer.getElements(alt.type || '');
                    md += `- **${altElements}**：${TermRendererServer.render(alt.reason_excluded || '')}\n`;
                });
                md += '\n';
            }
            
            if (fullResult.caveats) {
                md += `### 注意事项\n\n`;
                md += `${TermRendererServer.render(fullResult.caveats)}\n\n`;
            }
        }
        
        if (careerInfo) {
            md += `## 七、职业发展\n\n`;
            
            if (careerInfo.summary) {
                md += `### 职业概览\n\n`;
                md += `${TermRendererServer.render(careerInfo.summary)}\n\n`;
            }
            
            if (careerInfo.strengths || careerInfo.weaknesses) {
                md += `### 优势与劣势\n\n`;
                md += `| 优势 | 劣势 |\n`;
                md += `|------|------|\n`;
                const maxLen = Math.max(careerInfo.strengths?.length || 0, careerInfo.weaknesses?.length || 0);
                for (let i = 0; i < maxLen; i++) {
                    const s = careerInfo.strengths?.[i] || '-';
                    const w = careerInfo.weaknesses?.[i] || '-';
                    md += `| ${TermRendererServer.render(s)} | ${TermRendererServer.render(w)} |\n`;
                }
                md += '\n';
            }
            
            if (careerInfo.suitable_fields && careerInfo.suitable_fields.length > 0) {
                md += `### 适合领域\n\n`;
                careerInfo.suitable_fields.forEach(field => {
                    md += `- **${TermRendererServer.render(field.category)}**`;
                    if (field.positions && field.positions.length > 0) {
                        md += `：${field.positions.map(p => TermRendererServer.render(p)).join('、')}`;
                    }
                    md += '\n';
                });
                md += '\n';
            }
        }
        
        if (socialStyle) {
            md += `## 八、社交风格\n\n`;
            
            if (socialStyle.summary) {
                md += `${TermRendererServer.render(socialStyle.summary)}\n\n`;
            }
            if (socialStyle.communication_style) {
                md += `**沟通风格**：${TermRendererServer.render(socialStyle.communication_style)}\n\n`;
            }
        }
        
        if (familyStyle) {
            md += `## 九、家庭关系\n\n`;
            
            if (familyStyle.summary) {
                md += `${TermRendererServer.render(familyStyle.summary)}\n\n`;
            }
        }
        
        if (personalGrowth) {
            md += `## 十、个人成长\n\n`;
            
            if (personalGrowth.summary) {
                md += `### 成长路径\n\n`;
                md += `${TermRendererServer.render(personalGrowth.summary)}\n\n`;
            }
        }
        
        if (compatibilityPairs && compatibilityPairs.length > 0) {
            md += `## 十一、最佳配对\n\n`;
            
            const levelLabels = {
                1: '一级：灵魂伴侣', 2: '二级：和谐增益', 3: '三级：互补扶持',
                4: '四级：磨合成长', 5: '五级：挑战重重'
            };
            
            const groupedPairs = {};
            for (let level = 1; level <= 5; level++) {
                groupedPairs[level] = [];
            }
            
            compatibilityPairs.forEach(pair => {
                const level = pair.compatibility_level_number;
                if (groupedPairs[level]) {
                    groupedPairs[level].push(pair);
                }
            });
            
            for (let level = 1; level <= 5; level++) {
                const pairs = groupedPairs[level];
                if (pairs.length === 0) continue;
                
                md += `### ${levelLabels[level]}\n\n`;
                
                pairs.forEach(pair => {
                    const myTypeDisplay = TermRendererServer.getElements(mbtiType);
                    const otherTypeDisplay = TermRendererServer.getElements(pair.other_type);
                    
                    md += `#### ${myTypeDisplay} ↔ ${otherTypeDisplay}\n\n`;
                    md += `**配对分析**：${TermRendererServer.render(pair.analysis)}\n\n`;
                    md += `**相处建议**：${TermRendererServer.render(pair.advice_for_current)}\n\n`;
                    md += '---\n\n';
                });
            }
        }
        
        md += `---\n\n`;
        md += `*本报告由原神版MBTI测试系统生成*\n`;
        
        const dateStr = new Date().toISOString().slice(0, 10);
        const asciiFileName = `MBTI_Report_${mbtiType}_${dateStr}.md`;
        
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${asciiFileName}"`);
        res.send(md);
    } catch (error) {
        console.error('导出报告失败:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ success: false, error: '服务器错误: ' + error.message });
    }
});

module.exports = router;
