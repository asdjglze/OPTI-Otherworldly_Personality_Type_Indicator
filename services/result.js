// 版本号: v1.0.0
/**
 * 结果服务
 * 
 * 功能: 组装完整的MBTI测试结果数据
 */

const calculator = require('./calculator');
const dataService = require('./data');

class ResultService {
    /**
     * 处理答题提交，返回完整结果
     * 
     * @param {Array} answers - 用户答案数组
     * @param {string} gender - 性别
     * @param {string} questionVersion - 题库版本
     * @returns {Object} 完整结果数据
     */
    submit(answers, gender, questionVersion) {
        const baseResult = calculator.calculate(answers, gender);
        return this.buildFullResult(baseResult, gender);
    }
    
    /**
     * 直接查看结果（不答题）
     * 
     * @param {string} mbtiType - MBTI类型
     * @param {string} gender - 性别
     * @returns {Object} 完整结果数据
     */
    directView(mbtiType, gender) {
        const baseResult = {
            type: mbtiType,
            label: mbtiType,
            elements: calculator.getMBTIElements(mbtiType),
            dimensionScores: calculator.generateDimensionScores(mbtiType),
            functionStack: calculator.functionStackMap[mbtiType] || {
                dominant: '', auxiliary: '', tertiary: '', inferior: ''
            },
            gender: gender,
            timestamp: new Date().toISOString(),
            isDirectView: true
        };
        
        return this.buildFullResult(baseResult, gender);
    }
    
    /**
     * 构建完整结果数据
     * 
     * @param {Object} baseResult - 基础计算结果
     * @param {string} gender - 性别
     * @returns {Object} 完整结果数据
     */
    buildFullResult(baseResult, gender) {
        const mbtiType = baseResult.type;
        
        return {
            type: baseResult.type,
            label: baseResult.label,
            elements: baseResult.elements,
            dimensionScores: baseResult.dimensionScores,
            functionStack: baseResult.functionStack,
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
            gender: baseResult.gender,
            timestamp: baseResult.timestamp,
            isDirectView: baseResult.isDirectView || false
        };
    }
}

module.exports = new ResultService();
