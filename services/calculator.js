// 版本号: v1.0.0
/**
 * MBTI计算服务
 * 
 * 功能: 基于强度选择法的MBTI评分计算
 */

const fs = require('fs');
const path = require('path');

class CalculatorService {
    constructor() {
        this.dimensionMap = {
            'E': 'EI', 'I': 'EI',
            'S': 'SN', 'N': 'SN',
            'T': 'TF', 'F': 'TF',
            'J': 'JP', 'P': 'JP'
        };
        
        this.typeDirection = {
            'E': 1, 'I': -1,
            'S': 1, 'N': -1,
            'T': 1, 'F': -1,
            'J': 1, 'P': -1
        };
        
        this.functionStackMap = {
            'INTJ': { dominant: 'Ni', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Se' },
            'INTP': { dominant: 'Ti', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Fe' },
            'ENTJ': { dominant: 'Te', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Fi' },
            'ENTP': { dominant: 'Ne', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Si' },
            'INFJ': { dominant: 'Ni', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Se' },
            'INFP': { dominant: 'Fi', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Te' },
            'ENFJ': { dominant: 'Fe', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Ti' },
            'ENFP': { dominant: 'Ne', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Si' },
            'ISTJ': { dominant: 'Si', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Ne' },
            'ISFJ': { dominant: 'Si', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Ne' },
            'ESTJ': { dominant: 'Te', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Fi' },
            'ESFJ': { dominant: 'Fe', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Ti' },
            'ISTP': { dominant: 'Ti', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Fe' },
            'ISFP': { dominant: 'Fi', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Te' },
            'ESTP': { dominant: 'Se', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Ni' },
            'ESFP': { dominant: 'Se', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Ni' }
        };
        
        this.loadData();
    }
    
    /**
     * 加载必要的数据文件
     */
    loadData() {
        try {
            const dataDir = path.join(__dirname, '../data');
            
            this.dimensionElementMapping = JSON.parse(
                fs.readFileSync(path.join(dataDir, 'dimension_element_mapping.json'), 'utf-8')
            );
            
            console.log('计算服务数据加载完成');
        } catch (error) {
            console.error('加载计算服务数据失败:', error);
        }
    }
    
    /**
     * 计算MBTI结果
     * 
     * @param {Array} answers - 用户答案数组
     * @param {string} gender - 性别
     * @returns {Object} 计算结果
     */
    calculate(answers, gender) {
        const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        
        answers.forEach(answer => {
            if (!answer) return;
            
            const coordinate = answer.coordinate;
            const optionA = answer.optionA;
            const optionB = answer.optionB;
            
            if (coordinate === undefined || !optionA || !optionB) return;
            
            const typeA = optionA.character_type;
            const typeB = optionB.character_type;
            
            const sgn = coordinate > 0 ? 1 : -1;
            const y1 = 2.5 - coordinate + 0.5 * sgn;
            const y2 = 5 - y1;
            
            scores[typeA] += y1;
            scores[typeB] += y2;
        });
        
        const dimensionScores = this.initDimensionScores();
        
        const eiTotal = scores.E + scores.I;
        let eiPercentage = 50;
        if (eiTotal > 0) {
            eiPercentage = (scores.E / eiTotal) * 100;
        }
        dimensionScores.EI.leftScore = Math.round(eiPercentage);
        dimensionScores.EI.rightScore = Math.round(100 - eiPercentage);
        dimensionScores.EI.percentage = eiPercentage;
        dimensionScores.EI.letter = eiPercentage >= 50 ? 'E' : 'I';
        
        const snTotal = scores.S + scores.N;
        let snPercentage = 50;
        if (snTotal > 0) {
            snPercentage = (scores.S / snTotal) * 100;
        }
        dimensionScores.SN.leftScore = Math.round(snPercentage);
        dimensionScores.SN.rightScore = Math.round(100 - snPercentage);
        dimensionScores.SN.percentage = snPercentage;
        dimensionScores.SN.letter = snPercentage >= 50 ? 'S' : 'N';
        
        const tfTotal = scores.T + scores.F;
        let tfPercentage = 50;
        if (tfTotal > 0) {
            tfPercentage = (scores.T / tfTotal) * 100;
        }
        dimensionScores.TF.leftScore = Math.round(tfPercentage);
        dimensionScores.TF.rightScore = Math.round(100 - tfPercentage);
        dimensionScores.TF.percentage = tfPercentage;
        dimensionScores.TF.letter = tfPercentage >= 50 ? 'T' : 'F';
        
        const jpTotal = scores.J + scores.P;
        let jpPercentage = 50;
        if (jpTotal > 0) {
            jpPercentage = (scores.J / jpTotal) * 100;
        }
        dimensionScores.JP.leftScore = Math.round(jpPercentage);
        dimensionScores.JP.rightScore = Math.round(100 - jpPercentage);
        dimensionScores.JP.percentage = jpPercentage;
        dimensionScores.JP.letter = jpPercentage >= 50 ? 'J' : 'P';
        
        const mbtiType = dimensionScores.EI.letter + 
                         dimensionScores.SN.letter + 
                         dimensionScores.TF.letter + 
                         dimensionScores.JP.letter;
        
        const elements = this.getMBTIElements(mbtiType);
        const functionStack = this.functionStackMap[mbtiType] || {
            dominant: '', auxiliary: '', tertiary: '', inferior: ''
        };
        
        return {
            type: mbtiType,
            label: mbtiType,
            elements: elements,
            dimensionScores: dimensionScores,
            functionStack: functionStack,
            gender: gender,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * 初始化维度得分
     * 
     * @returns {Object} 初始化的维度得分对象
     */
    initDimensionScores() {
        const dimensionMapping = this.dimensionElementMapping?.dimensions;
        
        if (dimensionMapping) {
            return {
                EI: { 
                    leftScore: 0, rightScore: 0, total: 0, 
                    letter: dimensionMapping.EI.letter, 
                    element: dimensionMapping.EI.element, 
                    leftElement: dimensionMapping.EI.leftElement, 
                    rightElement: dimensionMapping.EI.rightElement 
                },
                SN: { 
                    leftScore: 0, rightScore: 0, total: 0, 
                    letter: dimensionMapping.SN.letter, 
                    element: dimensionMapping.SN.element, 
                    leftElement: dimensionMapping.SN.leftElement, 
                    rightElement: dimensionMapping.SN.rightElement 
                },
                TF: { 
                    leftScore: 0, rightScore: 0, total: 0, 
                    letter: dimensionMapping.TF.letter, 
                    element: dimensionMapping.TF.element, 
                    leftElement: dimensionMapping.TF.leftElement, 
                    rightElement: dimensionMapping.TF.rightElement 
                },
                JP: { 
                    leftScore: 0, rightScore: 0, total: 0, 
                    letter: dimensionMapping.JP.letter, 
                    element: dimensionMapping.JP.element, 
                    leftElement: dimensionMapping.JP.leftElement, 
                    rightElement: dimensionMapping.JP.rightElement 
                }
            };
        }
        
        return {
            EI: { leftScore: 0, rightScore: 0, total: 0, letter: 'E', element: 'anemo', leftElement: 'anemo', rightElement: 'hydro' },
            SN: { leftScore: 0, rightScore: 0, total: 0, letter: 'S', element: 'pyro', leftElement: 'pyro', rightElement: 'geo' },
            TF: { leftScore: 0, rightScore: 0, total: 0, letter: 'T', element: 'electro', leftElement: 'electro', rightElement: 'dendro' },
            JP: { leftScore: 0, rightScore: 0, total: 0, letter: 'J', element: 'cryo', leftElement: 'cryo', rightElement: 'physical' }
        };
    }
    
    /**
     * 根据MBTI类型生成模拟的维度得分
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object} 维度得分对象
     */
    generateDimensionScores(mbtiType) {
        const dimensionMapping = this.dimensionElementMapping?.dimensions;
        const scores = this.initDimensionScores();
        
        const typeLetters = mbtiType.split('');
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        const leftLetters = ['E', 'S', 'T', 'J'];
        
        dimensions.forEach((dim, index) => {
            const isLeft = typeLetters[index] === leftLetters[index];
            const basePercentage = 55 + Math.random() * 30;
            const leftPercentage = isLeft ? basePercentage : (100 - basePercentage);
            
            scores[dim].leftScore = Math.round(leftPercentage);
            scores[dim].rightScore = Math.round(100 - leftPercentage);
            scores[dim].total = 100;
            scores[dim].percentage = leftPercentage;
            scores[dim].letter = typeLetters[index];
            
            if (dimensionMapping && dimensionMapping[dim]) {
                scores[dim].element = dimensionMapping[dim].element;
                scores[dim].leftElement = dimensionMapping[dim].leftElement;
                scores[dim].rightElement = dimensionMapping[dim].rightElement;
            }
        });
        
        return scores;
    }
    
    /**
     * 获取MBTI类型对应的元素
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Array} 元素数组
     */
    getMBTIElements(mbtiType) {
        const letterToElement = this.dimensionElementMapping?.letterToElement;
        
        if (letterToElement) {
            return mbtiType.split('').map(letter => letterToElement[letter] || 'anemo');
        }
        
        const elementMap = {
            'E': 'anemo', 'I': 'hydro',
            'S': 'pyro', 'N': 'geo',
            'T': 'electro', 'F': 'dendro',
            'J': 'cryo', 'P': 'physical'
        };
        
        return mbtiType.split('').map(letter => elementMap[letter] || 'anemo');
    }
    
    /**
     * 将置信度数字(1-5)转换为百分比
     * 
     * @param {number} confidence - 置信度等级(1-5)
     * @returns {number} 百分比数值
     */
    confidenceToPercent(confidence) {
        const conf = typeof confidence === 'number' ? confidence : 3;
        const mapping = { 1: 52, 2: 55, 3: 60, 4: 70, 5: 80 };
        return mapping[conf] || 60;
    }
    
    /**
     * 构建AI分析模式的完整返回数据
     * 
     * @param {Object} aiResult - AI原始分析结果
     * @param {string} gender - 性别
     * @param {Object} dataService - 数据服务实例
     * @returns {Object} 完整的结果对象
     */
    buildAIResult(aiResult, gender, dataService) {
        const mbtiType = aiResult.mbti_type;
        
        const dimensions = { E: 50, I: 50, S: 50, N: 50, T: 50, F: 50, J: 50, P: 50 };
        
        if (aiResult.dimensions) {
            if (aiResult.dimensions['E/I']) {
                const ei = aiResult.dimensions['E/I'];
                const confPercent = this.confidenceToPercent(ei.confidence);
                if (ei.preference === 'E') {
                    dimensions.E = confPercent;
                    dimensions.I = 100 - confPercent;
                } else {
                    dimensions.I = confPercent;
                    dimensions.E = 100 - confPercent;
                }
            }
            if (aiResult.dimensions['S/N']) {
                const sn = aiResult.dimensions['S/N'];
                const confPercent = this.confidenceToPercent(sn.confidence);
                if (sn.preference === 'S') {
                    dimensions.S = confPercent;
                    dimensions.N = 100 - confPercent;
                } else {
                    dimensions.N = confPercent;
                    dimensions.S = 100 - confPercent;
                }
            }
            if (aiResult.dimensions['T/F']) {
                const tf = aiResult.dimensions['T/F'];
                const confPercent = this.confidenceToPercent(tf.confidence);
                if (tf.preference === 'T') {
                    dimensions.T = confPercent;
                    dimensions.F = 100 - confPercent;
                } else {
                    dimensions.F = confPercent;
                    dimensions.T = 100 - confPercent;
                }
            }
            if (aiResult.dimensions['J/P']) {
                const jp = aiResult.dimensions['J/P'];
                const confPercent = this.confidenceToPercent(jp.confidence);
                if (jp.preference === 'J') {
                    dimensions.J = confPercent;
                    dimensions.P = 100 - confPercent;
                } else {
                    dimensions.P = confPercent;
                    dimensions.J = 100 - confPercent;
                }
            }
        }
        
        const dimensionScores = {
            EI: {
                leftScore: dimensions.I,
                rightScore: dimensions.E,
                leftElement: 'hydro',
                rightElement: 'anemo',
                leftLabel: '内倾(I)',
                rightLabel: '外倾(E)'
            },
            SN: {
                leftScore: dimensions.S,
                rightScore: dimensions.N,
                leftElement: 'pyro',
                rightElement: 'geo',
                leftLabel: '感觉(S)',
                rightLabel: '直觉(N)'
            },
            TF: {
                leftScore: dimensions.T,
                rightScore: dimensions.F,
                leftElement: 'electro',
                rightElement: 'dendro',
                leftLabel: '思考(T)',
                rightLabel: '情感(F)'
            },
            JP: {
                leftScore: dimensions.J,
                rightScore: dimensions.P,
                leftElement: 'cryo',
                rightElement: 'physical',
                leftLabel: '判断(J)',
                rightLabel: '感知(P)'
            }
        };
        
        const fullResult = {
            type: mbtiType,
            label: dataService.getTypeLabel(mbtiType),
            elements: this.getMBTIElements(mbtiType),
            dimensionScores: dimensionScores,
            functionStack: aiResult.cognitive_functions || this.functionStackMap[mbtiType] || {
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
                provider: 'glm',
                model: 'glm-5'
            },
            skippedQuestionsCount: 0,
            aiAnalysis: {
                confidence: aiResult.confidence_overall,
                cognitiveFunctions: aiResult.cognitive_functions,
                alternativeHypotheses: aiResult.alternative_hypotheses_excluded,
                detailedEvidence: aiResult.detailed_evidence,
                caveats: aiResult.caveats,
                analysisSummary: aiResult.analysis_summary
            }
        };
        
        return fullResult;
    }
}

module.exports = new CalculatorService();
