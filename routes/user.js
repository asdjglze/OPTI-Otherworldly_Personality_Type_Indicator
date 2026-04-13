// 版本号: v1.0.0
/**
 * 用户路由
 * 
 * 功能: 处理用户注册、登录、登出等请求
 */

const express = require('express');
const router = express.Router();
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
 * POST /api/auth/register
 * 用户注册
 */
router.post('/auth/register', (req, res) => {
    try {
        const { username, password } = req.body;
        
        const result = auth.register(username, password);
        
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
router.post('/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        const result = auth.login(username, password);
        
        if (result.success) {
            // 设置cookie（7天有效期）
            res.cookie('auth_token', result.token, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: false, // 开发环境设为false，生产环境设为true
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
router.post('/auth/logout', (req, res) => {
    try {
        const token = req.cookies && req.cookies.auth_token;
        auth.logout(token);
        
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
router.get('/auth/check', (req, res) => {
    try {
        const token = req.cookies && req.cookies.auth_token;
        
        if (!token) {
            return res.json({ success: false, loggedIn: false });
        }
        
        const user = auth.verifySession(token);
        
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
router.get('/user/results', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const results = auth.getResults(username);
        
        // 简化返回数据
        const simplifiedResults = results.map((result, index) => ({
            index: index,
            type: result.type,
            label: dataService.getTypeLabel(result.type),
            gender: result.gender,
            savedAt: result.savedAt,
            isAIAnalysis: result.isAIAnalysis || false,
            isMallmOnly: result.isMallmOnly || false,
            mallmOnlyLabel: result.mallmOnlyLabel,
            usedModel: result.usedModel,
            questionSet: result.questionSet
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
 * 保存答卷结果（仅用于MALLM讨论前的答卷保存）
 */
router.post('/user/result', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const result = req.body;
        const success = auth.saveResult(username, result);
        
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
router.get('/user/result/:index', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const index = parseInt(req.params.index);
        const result = auth.getResultByIndex(username, index);
        
        if (!result) {
            return res.status(404).json({ success: false, error: '答卷不存在' });
        }
        
        // 重建完整结果
        const mbtiType = result.type;
        const gender = result.gender || 'male';
        
        const fullResult = {
            type: mbtiType,
            label: dataService.getTypeLabel(mbtiType),
            elements: calculator.getMBTIElements(mbtiType),
            dimensionScores: result.dimensionScores,
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
            usedModel: result.usedModel,
            questionSet: result.questionSet,
            questions: result.questions,
            answers: result.answers,
            aiAnalysis: result.aiAnalysis
        };
        
        res.json({ success: true, data: fullResult });
    } catch (error) {
        console.error('获取答卷详情失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/user/progress/normal
 * 获取普通答题进度
 */
router.get('/user/progress/normal', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const progress = auth.getNormalProgress(username);
        
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
 * POST /api/user/progress/normal
 * 保存普通答题进度
 */
router.post('/user/progress/normal', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const progress = req.body;
        const success = auth.saveNormalProgress(username, progress);
        
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
 * DELETE /api/user/progress/normal
 * 清除普通答题进度
 */
router.delete('/user/progress/normal', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        auth.clearNormalProgress(username);
        res.json({ success: true, message: '进度已清除' });
    } catch (error) {
        console.error('清除普通答题进度失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/user/progress/ai
 * 获取AI答题进度
 */
router.get('/user/progress/ai', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const progress = auth.getAIProgress(username);
        
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
router.post('/user/progress/ai', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const progress = req.body;
        const success = auth.saveAIProgress(username, progress);
        
        if (success) {
            res.json({ success: true, message: '进度已保存' });
        } else {
            res.status(500).json({ success: false, error: '保存失败' });
        }
    } catch (error) {
        console.error('保存AI答题进度失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * DELETE /api/user/progress/ai
 * 清除AI答题进度
 */
router.delete('/user/progress/ai', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        auth.clearAIProgress(username);
        res.json({ success: true, message: '进度已清除' });
    } catch (error) {
        console.error('清除AI答题进度失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

/**
 * GET /api/user/export/answers/:index
 * 导出答卷（JSON格式）
 * 包含完整的题目场景和问题，可直接用于导入
 */
router.get('/user/export/answers/:index', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const index = parseInt(req.params.index);
        const result = auth.getResultByIndex(username, index);
        
        if (!result) {
            return res.status(404).json({ success: false, error: '答卷不存在' });
        }
        
        let exportRecord;
        
        if (result.isAIAnalysis) {
            // AI答卷导出格式：与前端导入格式完全一致
            // answers 需要转换为对象格式 { "0": "答案1", "1": "答案2", ... }
            const answersObject = {};
            if (Array.isArray(result.answers)) {
                // 后端存储格式：[{questionId, answerText}, ...]
                result.answers.forEach((item, idx) => {
                    if (item && item.answerText) {
                        answersObject[idx] = item.answerText;
                    }
                });
            } else if (typeof result.answers === 'object' && result.answers !== null) {
                // 可能已经是对象格式
                Object.keys(result.answers).forEach(key => {
                    const value = result.answers[key];
                    if (typeof value === 'string') {
                        answersObject[key] = value;
                    } else if (value && value.answerText) {
                        answersObject[key] = value.answerText;
                    }
                });
            }
            
            exportRecord = {
                type: 'ai',  // 前端导入识别字段
                gender: result.gender,
                savedAt: result.savedAt,
                usedModel: result.usedModel,
                questions: result.questions || [],
                answers: answersObject,
                skippedQuestions: result.skippedQuestions || []
            };
        } else {
            // 普通答卷导出格式
            // 确保 questionSet 有默认值
            const questionSet = result.questionSet || result.version || 'mbti-200';
            exportRecord = {
                type: 'normal',
                gender: result.gender,
                savedAt: result.savedAt,
                questionSet: questionSet,
                answers: result.answers || []
            };
        }
        
        const exportData = {
            exportType: 'answers',
            exportTime: new Date().toISOString(),
            records: [exportRecord]  // 使用 records 数组格式，与前端导入验证一致
        };
        
        res.json(exportData);
    } catch (error) {
        console.error('导出答卷失败:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
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
        
        // 替换 MBTI 为原神元素反应
        result = result.replace(/\bMBTI\b/g, '原神元素反应');
        
        // 替换MBTI类型
        result = result.replace(/\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/g, 
            (match) => this.typeToElements[match] || match);
        
        // 替换认知功能
        result = result.replace(/\b(Te|Ti|Fe|Fi|Ne|Ni|Se|Si)\b/g,
            (match) => this.cognitiveFunctionReactions[match] || match);
        
        // 替换类型组合
        result = result.replace(/\b(NT|NF|SJ|SP)\b/g,
            (match) => this.typeGroupMappings[match] || match);
        
        // 替换单个维度字母（独立出现时）
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
 * GET /api/user/export/report/:index
 * 导出分析报告（MD格式）
 */
router.get('/user/export/report/:index', (req, res) => {
    try {
        const username = getUsername(req);
        
        if (!username) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        
        const index = parseInt(req.params.index);
        const result = auth.getResultByIndex(username, index);
        
        if (!result) {
            return res.status(404).json({ success: false, error: '答卷不存在' });
        }
        
        const mbtiType = result.type;
        const gender = result.gender || 'male';
        const elementsDisplay = TermRendererServer.getElements(mbtiType);
        
        // 获取完整报告数据
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
        
        // 生成MD格式报告
        let md = `# 原神元素反应性格分析报告\n\n`;
        md += `> 导出时间：${new Date().toLocaleString('zh-CN')}\n`;
        md += `> 测试类型：${result.isAIAnalysis ? '大模型深度分析' : '普通测试'}\n`;
        if (result.usedModel) {
            md += `> 使用模型：${result.usedModel.model}\n`;
        }
        md += '\n---\n\n';
        
        // 一、性格类型
        md += `## 一、性格类型\n\n`;
        md += `### ${elementsDisplay} - ${typeLabel}\n\n`;
        md += `**性别**：${gender === 'male' ? '男性' : '女性'}\n\n`;
        
        // 维度得分
        if (result.dimensionScores) {
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
                const score = result.dimensionScores[dim];
                if (score) {
                    const info = dimNames[dim];
                    md += `| ${dim} | ${info.left} ${score.leftScore}% | ${info.right} ${score.rightScore}% | ${score.leftScore >= score.rightScore ? info.left.split('（')[0] : info.right.split('（')[0]} |\n`;
                }
            });
            md += '\n';
        }
        
        // 二、代表角色
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
        
        // 三、性格简述
        if (cardSummary) {
            md += `## 三、性格简述\n\n`;
            md += `${TermRendererServer.render(cardSummary)}\n\n`;
        }
        
        // 四、气质类型（移到认知功能前面）
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
        
        // 五、认知功能
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
        
        // 六、大模型深度分析（移到职业发展前面）
        if (result.isAIAnalysis && result.aiAnalysis) {
            md += `## 六、大模型深度分析\n\n`;
            
            // 置信度
            if (result.aiAnalysis.confidence) {
                md += `**分析置信度**：${result.aiAnalysis.confidence}%\n\n`;
            }
            
            // 分析总结
            if (result.aiAnalysis.analysisSummary) {
                md += `### 分析总结\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.analysisSummary)}\n\n`;
            }
            
            // 逐题分析
            if (result.aiAnalysis.detailedEvidence && result.aiAnalysis.detailedEvidence.length > 0) {
                md += `### 逐题分析\n\n`;
                result.aiAnalysis.detailedEvidence.forEach((evidence, index) => {
                    const qid = evidence.question_id || index + 1;
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
            
            // 其他可能性
            if (result.aiAnalysis.alternativeHypotheses && result.aiAnalysis.alternativeHypotheses.length > 0) {
                md += `### 其他可能性\n\n`;
                md += `> 若结论与自我认知存在差异，可参考以下备选类型\n\n`;
                result.aiAnalysis.alternativeHypotheses.forEach(alt => {
                    const altElements = TermRendererServer.getElements(alt.type || '');
                    md += `- **${altElements}**：${TermRendererServer.render(alt.reason_excluded || '')}\n`;
                });
                md += '\n';
            }
            
            // 跳过题目分析
            if (result.aiAnalysis.skippedQuestionsAnalysis) {
                md += `### 跳过题目分析\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.skippedQuestionsAnalysis)}\n\n`;
            }
            
            // 维度分析
            if (result.aiAnalysis.dimensionAnalysis) {
                md += `### 维度分析\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.dimensionAnalysis)}\n\n`;
            }
            
            // 认知功能分析
            if (result.aiAnalysis.cognitiveFunctionAnalysis) {
                md += `### 认知功能分析\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.cognitiveFunctionAnalysis)}\n\n`;
            }
            
            // 行为模式
            if (result.aiAnalysis.behaviorPattern) {
                md += `### 行为模式\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.behaviorPattern)}\n\n`;
            }
            
            // 优势与劣势
            if (result.aiAnalysis.strengthsWeaknesses) {
                md += `### 优势与劣势\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.strengthsWeaknesses)}\n\n`;
            }
            
            // 成长建议
            if (result.aiAnalysis.growthSuggestion) {
                md += `### 成长建议\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.growthSuggestion)}\n\n`;
            }
            
            // 职业建议
            if (result.aiAnalysis.careerSuggestion) {
                md += `### 职业建议\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.careerSuggestion)}\n\n`;
            }
            
            // 人际关系建议
            if (result.aiAnalysis.relationshipSuggestion) {
                md += `### 人际关系建议\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.relationshipSuggestion)}\n\n`;
            }
            
            // 注意事项
            if (result.aiAnalysis.caveats) {
                md += `### 注意事项\n\n`;
                md += `${TermRendererServer.render(result.aiAnalysis.caveats)}\n\n`;
            }
        }
        
        // 七、职业发展
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
            
            if (careerInfo.leadership_style || careerInfo.team_role) {
                md += `### 工作风格\n\n`;
                if (careerInfo.leadership_style) {
                    md += `**领导风格**：${TermRendererServer.render(careerInfo.leadership_style.type)}\n`;
                    md += `> ${TermRendererServer.render(careerInfo.leadership_style.description)}\n\n`;
                }
                if (careerInfo.team_role) {
                    md += `**团队角色**：${TermRendererServer.render(careerInfo.team_role.type)}\n`;
                    md += `> ${TermRendererServer.render(careerInfo.team_role.description)}\n\n`;
                }
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
            
            if (careerInfo.career_advice && careerInfo.career_advice.length > 0) {
                md += `### 职业发展建议\n\n`;
                careerInfo.career_advice.forEach(item => {
                    md += `- **${TermRendererServer.render(item.advice)}**：${TermRendererServer.render(item.reason)}\n`;
                });
                md += '\n';
            }
        }
        
        // 八、社交风格
        if (socialStyle) {
            md += `## 八、社交风格\n\n`;
            
            if (socialStyle.summary) {
                md += `${TermRendererServer.render(socialStyle.summary)}\n\n`;
            }
            if (socialStyle.communication_style) {
                md += `**沟通风格**：${TermRendererServer.render(socialStyle.communication_style)}\n\n`;
            }
            
            if (socialStyle.strengths || socialStyle.challenges) {
                md += `### 优势与成长空间\n\n`;
                md += `| 社交优势 | 成长空间 |\n`;
                md += `|----------|----------|\n`;
                const maxLen = Math.max(socialStyle.strengths?.length || 0, socialStyle.challenges?.length || 0);
                for (let i = 0; i < maxLen; i++) {
                    const s = socialStyle.strengths?.[i] || '-';
                    const c = socialStyle.challenges?.[i] || '-';
                    md += `| ${TermRendererServer.render(s)} | ${TermRendererServer.render(c)} |\n`;
                }
                md += '\n';
            }
            
            if (socialStyle.interaction_with_types) {
                md += `### 与不同类型相处\n\n`;
                const typeLabels = { 'NT': '岩雷型', 'SP': '火原型', 'NF': '岩草型', 'SJ': '火冰型' };
                for (const [typeKey, advice] of Object.entries(socialStyle.interaction_with_types)) {
                    md += `- **${typeLabels[typeKey] || typeKey}**：${TermRendererServer.render(advice)}\n`;
                }
                md += '\n';
            }
            
            if (socialStyle.social_advice && socialStyle.social_advice.length > 0) {
                md += `### 社交建议\n\n`;
                socialStyle.social_advice.forEach(item => {
                    md += `- ${TermRendererServer.render(item)}\n`;
                });
                md += '\n';
            }
        }
        
        // 九、家庭关系
        if (familyStyle) {
            md += `## 九、家庭关系\n\n`;
            
            if (familyStyle.summary) {
                md += `${TermRendererServer.render(familyStyle.summary)}\n\n`;
            }
            
            if (familyStyle.strengths || familyStyle.challenges) {
                md += `### 优势与挑战\n\n`;
                md += `| 优势 | 挑战 |\n`;
                md += `|------|------|\n`;
                const maxLen = Math.max(familyStyle.strengths?.length || 0, familyStyle.challenges?.length || 0);
                for (let i = 0; i < maxLen; i++) {
                    const s = familyStyle.strengths?.[i] || '-';
                    const c = familyStyle.challenges?.[i] || '-';
                    md += `| ${TermRendererServer.render(s)} | ${TermRendererServer.render(c)} |\n`;
                }
                md += '\n';
            }
            
            if (familyStyle.role_as_child) {
                md += `### 作为子女\n\n`;
                if (familyStyle.role_as_child.characteristics) {
                    md += `**特点**：${familyStyle.role_as_child.characteristics.map(c => TermRendererServer.render(c)).join('、')}\n\n`;
                }
                if (familyStyle.role_as_child.description) {
                    md += `${TermRendererServer.render(familyStyle.role_as_child.description)}\n\n`;
                }
            }
            
            if (familyStyle.role_as_parent) {
                md += `### 作为父母\n\n`;
                if (familyStyle.role_as_parent.characteristics) {
                    md += `**特点**：${familyStyle.role_as_parent.characteristics.map(c => TermRendererServer.render(c)).join('、')}\n\n`;
                }
                if (familyStyle.role_as_parent.parenting_style) {
                    md += `**育儿风格**：${TermRendererServer.render(familyStyle.role_as_parent.parenting_style)}\n\n`;
                }
                if (familyStyle.role_as_parent.description) {
                    md += `${TermRendererServer.render(familyStyle.role_as_parent.description)}\n\n`;
                }
            }
            
            if (familyStyle.relationship_advice && familyStyle.relationship_advice.length > 0) {
                md += `### 家庭关系建议\n\n`;
                familyStyle.relationship_advice.forEach(item => {
                    md += `- ${TermRendererServer.render(item)}\n`;
                });
                md += '\n';
            }
        }
        
        // 十、个人成长
        if (personalGrowth) {
            md += `## 十、个人成长\n\n`;
            
            if (personalGrowth.summary) {
                md += `### 成长路径\n\n`;
                md += `${TermRendererServer.render(personalGrowth.summary)}\n\n`;
            }
            
            // 学习风格
            if (personalGrowth.learning_style) {
                md += `### 学习风格\n\n`;
                if (personalGrowth.learning_style.style) {
                    md += `**学习类型**：${TermRendererServer.render(personalGrowth.learning_style.style)}\n\n`;
                }
                if (personalGrowth.learning_style.summary) {
                    md += `${TermRendererServer.render(personalGrowth.learning_style.summary)}\n\n`;
                }
                if (personalGrowth.learning_style.preferred_methods) {
                    md += `**偏好方法**：${personalGrowth.learning_style.preferred_methods.map(m => TermRendererServer.render(m)).join('、')}\n\n`;
                }
                if (personalGrowth.learning_style.strengths) {
                    md += `**学习优势**：\n`;
                    personalGrowth.learning_style.strengths.forEach(s => md += `- ${TermRendererServer.render(s)}\n`);
                    md += '\n';
                }
                if (personalGrowth.learning_style.challenges) {
                    md += `**学习挑战**：\n`;
                    personalGrowth.learning_style.challenges.forEach(c => md += `- ${TermRendererServer.render(c)}\n`);
                    md += '\n';
                }
                if (personalGrowth.learning_style.study_tips) {
                    md += `**学习建议**：\n`;
                    personalGrowth.learning_style.study_tips.forEach(t => md += `- ${TermRendererServer.render(t)}\n`);
                    md += '\n';
                }
            }
            
            // 时间管理
            if (personalGrowth.time_management) {
                md += `### 时间管理\n\n`;
                if (personalGrowth.time_management.style) {
                    md += `**管理风格**：${TermRendererServer.render(personalGrowth.time_management.style)}\n\n`;
                }
                if (personalGrowth.time_management.description) {
                    md += `${TermRendererServer.render(personalGrowth.time_management.description)}\n\n`;
                }
                if (personalGrowth.time_management.strengths) {
                    md += `**管理优势**：\n`;
                    personalGrowth.time_management.strengths.forEach(s => md += `- ${TermRendererServer.render(s)}\n`);
                    md += '\n';
                }
                if (personalGrowth.time_management.challenges) {
                    md += `**管理挑战**：\n`;
                    personalGrowth.time_management.challenges.forEach(c => md += `- ${TermRendererServer.render(c)}\n`);
                    md += '\n';
                }
                if (personalGrowth.time_management.tips) {
                    md += `**管理建议**：\n`;
                    personalGrowth.time_management.tips.forEach(t => md += `- ${TermRendererServer.render(t)}\n`);
                    md += '\n';
                }
            }
            
            // 创造力
            if (personalGrowth.creativity) {
                md += `### 创造力\n\n`;
                if (personalGrowth.creativity.style) {
                    md += `**创造风格**：${TermRendererServer.render(personalGrowth.creativity.style)}\n\n`;
                }
                if (personalGrowth.creativity.description) {
                    md += `${TermRendererServer.render(personalGrowth.creativity.description)}\n\n`;
                }
                if (personalGrowth.creativity.strengths) {
                    md += `**创造优势**：\n`;
                    personalGrowth.creativity.strengths.forEach(s => md += `- ${TermRendererServer.render(s)}\n`);
                    md += '\n';
                }
                if (personalGrowth.creativity.challenges) {
                    md += `**创造挑战**：\n`;
                    personalGrowth.creativity.challenges.forEach(c => md += `- ${TermRendererServer.render(c)}\n`);
                    md += '\n';
                }
                if (personalGrowth.creativity.tips) {
                    md += `**创造建议**：\n`;
                    personalGrowth.creativity.tips.forEach(t => md += `- ${TermRendererServer.render(t)}\n`);
                    md += '\n';
                }
            }
            
            // 决策风格
            if (personalGrowth.decision_making) {
                md += `### 决策风格\n\n`;
                if (personalGrowth.decision_making.style) {
                    md += `**决策风格**：${TermRendererServer.render(personalGrowth.decision_making.style)}\n\n`;
                }
                if (personalGrowth.decision_making.description) {
                    md += `${TermRendererServer.render(personalGrowth.decision_making.description)}\n\n`;
                }
                if (personalGrowth.decision_making.strengths) {
                    md += `**决策优势**：\n`;
                    personalGrowth.decision_making.strengths.forEach(s => md += `- ${TermRendererServer.render(s)}\n`);
                    md += '\n';
                }
                if (personalGrowth.decision_making.challenges) {
                    md += `**决策挑战**：\n`;
                    personalGrowth.decision_making.challenges.forEach(c => md += `- ${TermRendererServer.render(c)}\n`);
                    md += '\n';
                }
                if (personalGrowth.decision_making.tips) {
                    md += `**决策建议**：\n`;
                    personalGrowth.decision_making.tips.forEach(t => md += `- ${TermRendererServer.render(t)}\n`);
                    md += '\n';
                }
            }
        }
        
        // 十一、最佳配对（按等级分组）
        if (compatibilityPairs && compatibilityPairs.length > 0) {
            md += `## 十一、最佳配对\n\n`;
            
            // 按等级分组
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
            
            // 按等级输出
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
