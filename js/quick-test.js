// 版本号: v1.0.0
/**
 * 原神版MBTI - 快速测试模块
 * 
 * 功能: 生成随机答案并快速跳转到结果页
 */

const QuickTest = {
    /**
     * 生成模拟答案
     * 
     * @param {Array} questions - 题目数组
     * @returns {Array} 模拟答案数组
     */
    generateMockAnswers: function(questions) {
        const answers = [];
        
        // 坐标范围：-3, -2, -1, +1, +2, +3（不存在0）
        const coordinates = [-3, -2, -1, 1, 2, 3];
        
        // 从 character_type 推断维度
        const getDimensionFromCharType = function(charType) {
            if (charType === 'E' || charType === 'I') return 'EI';
            if (charType === 'S' || charType === 'N') return 'SN';
            if (charType === 'T' || charType === 'F') return 'TF';
            if (charType === 'J' || charType === 'P') return 'JP';
            return null;
        };
        
        if (!questions || questions.length === 0) {
            for (let i = 0; i < 90; i++) {
                const x = coordinates[Math.floor(Math.random() * 6)];
                
                answers.push({
                    questionId: (i + 1).toString(),
                    coordinate: x,
                    optionA: {
                        character_type: ['E', 'S', 'T', 'J'][i % 4]
                    },
                    optionB: {
                        character_type: ['I', 'N', 'F', 'P'][i % 4]
                    }
                });
            }
            return answers;
        }
        
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const leftOption = question.options?.[0] || question.leftOption;
            const rightOption = question.options?.[1] || question.rightOption;
            
            const leftCharType = leftOption?.character_type;
            const rightCharType = rightOption?.character_type;
            
            const x = coordinates[Math.floor(Math.random() * 6)];
            
            answers.push({
                questionId: question.id,
                coordinate: x,
                optionA: {
                    character_type: leftCharType
                },
                optionB: {
                    character_type: rightCharType
                }
            });
        }
        
        return answers;
    },
    
    /**
     * 执行快速测试
     * 
     * @param {string} gender - 性别 ('male' 或 'female')
     * @param {Array} questions - 题目数组
     * @param {Object} callbacks - 回调函数对象
     * @returns {Object} 测试结果
     */
    execute: function(gender, questions, callbacks) {
        const mockAnswers = this.generateMockAnswers(questions);
        
        // 计算结果
        const result = Calculator.calculateResult(mockAnswers, gender);
        
        return {
            answers: mockAnswers,
            result: result
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickTest;
}
