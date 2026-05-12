// 版本号: v1.0.0
/**
 * 原神版MBTI - 评分计算模块
 * 
 * 功能: 基于强度选择法的MBTI评分计算
 * 算法: 根据用户选择的强度值计算各维度得分
 */

const Calculator = {
    /**
     * 角色数据引用
     * 从数据文件加载的角色数据
     */
    characterData: null,

    /**
     * 设置角色数据
     * @param {Object} data - 角色数据对象
     */
    setCharacterData: function(data) {
        this.characterData = data;
    },

    /**
     * 维度映射：character_type -> 维度代码
     */
    dimensionMap: {
        'E': 'EI',
        'I': 'EI',
        'S': 'SN',
        'N': 'SN',
        'T': 'TF',
        'F': 'TF',
        'J': 'JP',
        'P': 'JP'
    },

    /**
     * 维度对应的方向：正向还是负向
     * 正向表示该类型是维度的第一个字母（如E是EI的正向）
     * 负向表示该类型是维度的第二个字母（如I是EI的负向）
     */
    typeDirection: {
        'E': 1,
        'I': -1,
        'S': 1,
        'N': -1,
        'T': 1,
        'F': -1,
        'J': 1,
        'P': -1
    },

    /**
     * 获取角色匹配（根据性别）
     * 注意：此函数已废弃，角色数据应从 UI.getCharacterByMbti() 获取
     * 
     * @param {string} type - MBTI类型
     * @param {string} gender - 性别 ('male' 或 'female')
     * @returns {null} 返回 null，角色数据应从数据文件中获取
     */
    getCharacterMatch: function(type, gender) {
        return null;
    },

    /**
     * 初始化维度得分
     * 从数据文件中读取元素映射
     * 
     * @returns {Object} 初始化的维度得分对象
     */
    initDimensionScores: function() {
        // 尝试从 UI 获取维度元素映射数据
        const dimensionMapping = (typeof UI !== 'undefined' && UI.dimensionElementMapping) ? 
            UI.dimensionElementMapping.dimensions : null;
        
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
        
        // 回退到默认值（不使用 physical）
        return {
            EI: { leftScore: 0, rightScore: 0, total: 0, letter: 'E', element: 'anemo', leftElement: 'anemo', rightElement: 'hydro' },
            SN: { leftScore: 0, rightScore: 0, total: 0, letter: 'S', element: 'pyro', leftElement: 'pyro', rightElement: 'geo' },
            TF: { leftScore: 0, rightScore: 0, total: 0, letter: 'T', element: 'electro', leftElement: 'electro', rightElement: 'dendro' },
            JP: { leftScore: 0, rightScore: 0, total: 0, letter: 'J', element: 'cryo', leftElement: 'cryo', rightElement: 'physical' }
        };
    },

    /**
     * 计算MBTI结果 - 强度选择法
     * 
     * @param {Array} answers - 用户答案数组
     * @param {string} gender - 性别
     * @returns {Object} 计算结果
     */
    calculateResult: function(answers, gender) {
        // 输出整个答卷到控制台
        console.log('========== 答卷数据 ==========');
        console.log('题库版本:', typeof GenshinMBTI !== 'undefined' ? GenshinMBTI.state?.questionVersion : 'unknown');
        console.log('性别:', gender);
        console.log('答案数量:', answers.length);
        console.log('答卷详情:', JSON.stringify(answers, null, 2));
        console.log('==============================');
        
        // 直接累加八个维度的分数
        const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        
        answers.forEach(answer => {
            if (!answer) return;
            
            const coordinate = answer.coordinate;
            const optionA = answer.optionA;
            const optionB = answer.optionB;
            
            if (coordinate === undefined || !optionA || !optionB) return;
            
            const typeA = optionA.character_type;
            const typeB = optionB.character_type;
            
            // 计算得分公式：y1 = 2.5 - x + 0.5 * sgn(x)
            const sgn = coordinate > 0 ? 1 : -1;
            const y1 = 2.5 - coordinate + 0.5 * sgn;  // A选项得分
            const y2 = 5 - y1;  // B选项得分
            
            // 直接累加到对应维度
            scores[typeA] += y1;
            scores[typeB] += y2;
        });
        
        // 计算各维度百分比
        const dimensionScores = this.initDimensionScores();
        
        // EI 维度
        const eiTotal = scores.E + scores.I;
        let eiPercentage = 50;
        if (eiTotal > 0) {
            eiPercentage = (scores.E / eiTotal) * 100;
        }
        dimensionScores.EI.leftScore = Math.round(eiPercentage);
        dimensionScores.EI.rightScore = Math.round(100 - eiPercentage);
        dimensionScores.EI.percentage = eiPercentage;
        dimensionScores.EI.letter = eiPercentage >= 50 ? 'E' : 'I';
        
        // SN 维度
        const snTotal = scores.S + scores.N;
        let snPercentage = 50;
        if (snTotal > 0) {
            snPercentage = (scores.S / snTotal) * 100;
        }
        dimensionScores.SN.leftScore = Math.round(snPercentage);
        dimensionScores.SN.rightScore = Math.round(100 - snPercentage);
        dimensionScores.SN.percentage = snPercentage;
        dimensionScores.SN.letter = snPercentage >= 50 ? 'S' : 'N';
        
        // TF 维度
        const tfTotal = scores.T + scores.F;
        let tfPercentage = 50;
        if (tfTotal > 0) {
            tfPercentage = (scores.T / tfTotal) * 100;
        }
        dimensionScores.TF.leftScore = Math.round(tfPercentage);
        dimensionScores.TF.rightScore = Math.round(100 - tfPercentage);
        dimensionScores.TF.percentage = tfPercentage;
        dimensionScores.TF.letter = tfPercentage >= 50 ? 'T' : 'F';
        
        // JP 维度
        const jpTotal = scores.J + scores.P;
        let jpPercentage = 50;
        if (jpTotal > 0) {
            jpPercentage = (scores.J / jpTotal) * 100;
        }
        dimensionScores.JP.leftScore = Math.round(jpPercentage);
        dimensionScores.JP.rightScore = Math.round(100 - jpPercentage);
        dimensionScores.JP.percentage = jpPercentage;
        dimensionScores.JP.letter = jpPercentage >= 50 ? 'J' : 'P';
        
        // 组合 MBTI 类型
        const mbtiType = dimensionScores.EI.letter + dimensionScores.SN.letter + dimensionScores.TF.letter + dimensionScores.JP.letter;
        
        const elements = this.getMBTIElements(mbtiType);
        const functionStack = this.calculateFunctionStack(mbtiType);
        
        return {
            type: mbtiType,
            label: mbtiType,
            description: '',
            elements: elements,
            dimensionScores: dimensionScores,
            functionStack: functionStack,
            character: null,
            answerCount: answers.length,
            gender: gender,
            timestamp: new Date().toISOString(),
            validity: {
                isValid: true
            }
        };
    },

    /**
     * 计算认知功能堆叠
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object} 认知功能堆叠对象
     */
    calculateFunctionStack: function(mbtiType) {
        // 16种MBTI类型的认知功能层级映射
        const functionStackMap = {
            // 分析家气质
            'INTJ': { dominant: 'Ni', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Se' },
            'INTP': { dominant: 'Ti', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Fe' },
            'ENTJ': { dominant: 'Te', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Fi' },
            'ENTP': { dominant: 'Ne', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Si' },
            // 外交家气质
            'INFJ': { dominant: 'Ni', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Se' },
            'INFP': { dominant: 'Fi', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Te' },
            'ENFJ': { dominant: 'Fe', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Ti' },
            'ENFP': { dominant: 'Ne', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Si' },
            // 守护者气质
            'ISTJ': { dominant: 'Si', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Ne' },
            'ISFJ': { dominant: 'Si', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Ne' },
            'ESTJ': { dominant: 'Te', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Fi' },
            'ESFJ': { dominant: 'Fe', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Ti' },
            // 探险家气质
            'ISTP': { dominant: 'Ti', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Fe' },
            'ISFP': { dominant: 'Fi', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Te' },
            'ESTP': { dominant: 'Se', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Ni' },
            'ESFP': { dominant: 'Se', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Ni' }
        };
        
        return functionStackMap[mbtiType] || { dominant: '', auxiliary: '', tertiary: '', inferior: '' };
    },

    /**
     * 获取MBTI类型对应的元素
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Array} 元素数组
     */
    getMBTIElements: function(mbtiType) {
        // 尝试从 UI 获取维度元素映射数据
        const letterToElement = (typeof UI !== 'undefined' && UI.dimensionElementMapping) ? 
            UI.dimensionElementMapping.letterToElement : null;
        
        if (letterToElement) {
            return mbtiType.split('').map(letter => letterToElement[letter] || 'anemo');
        }
        
        // 回退到默认值（不使用 physical）
        const elementMap = {
            'E': 'anemo',
            'I': 'hydro',
            'S': 'pyro',
            'N': 'geo',
            'T': 'electro',
            'F': 'dendro',
            'J': 'cryo',
            'P': 'physical'
        };
        
        return mbtiType.split('').map(letter => elementMap[letter] || 'anemo');
    },

    /**
     * 获取维度解读
     * 
     * @param {string} dim - 维度代码
     * @param {Object} score - 得分对象
     * @returns {string} 维度解读文本
     */
    getDimensionInterpretation: function(dim, score) {
        const interpretations = {
            EI: {
                E: '你的能量来源于外部世界，倾向于从社交互动中获得动力。风元素特质明显，喜欢流动和交流。',
                I: '你的能量来源于内心世界，倾向于从独处和反思中获得力量。水元素特质明显，深邃而内敛。'
            },
            SN: {
                S: '你更关注具体的现实和细节，善于处理当下的事务。火元素特质明显，直接而热烈。',
                N: '你更关注抽象的可能和模式，善于洞察事物的本质。岩元素特质明显，稳重而有远见。'
            },
            TF: {
                T: '你倾向于用逻辑和原则做决定，重视客观公正。雷元素特质明显，果断而有原则。',
                F: '你倾向于用价值和情感做决定，重视人际和谐。草元素特质明显，关怀而有温度。'
            },
            JP: {
                J: '你倾向于有计划地生活，喜欢确定性和完成感。冰元素特质明显，有序而坚定。',
                P: '你倾向于灵活地生活，喜欢可能性和自由。原元素特质明显，自由而适应。'
            }
        };
        
        return interpretations[dim][score.letter];
    },

    /**
     * 获取认知功能解读
     * 
     * @param {string} func - 功能代码
     * @param {string} position - 功能位置
     * @returns {string} 功能解读文本
     */
    getFunctionInterpretation: function(func, position) {
        const funcNames = {
            Ne: '外倾直觉', Ni: '内倾直觉',
            Se: '外倾感觉', Si: '内倾感觉',
            Te: '外倾思考', Ti: '内倾思考',
            Fe: '外倾情感', Fi: '内倾情感'
        };
        
        const positionNames = {
            dominant: '主导功能',
            auxiliary: '辅助功能',
            tertiary: '第三功能',
            inferior: '劣势功能'
        };
        
        return `${positionNames[position]}：${funcNames[func]}`;
    },

    /**
     * 生成建议
     * 
     * @param {Object} result - 计算结果对象
     * @returns {Array} 建议数组
     */
    generateSuggestions: function(result) {
        const suggestions = [];
        
        suggestions.push(`作为${result.label}，你的核心优势在于${result.functionStack.dominant}功能的运用。`);
        
        suggestions.push(`建议多发展${result.functionStack.auxiliary}功能，这将帮助你更好地平衡生活。`);
        
        suggestions.push(`注意${result.functionStack.inferior}功能可能带来的压力反应。学会在压力下保持平衡。`);
        
        return suggestions;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculator;
}
