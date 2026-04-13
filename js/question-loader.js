// 版本号: v1.0.0
/**
 * 原神版MBTI - 题目加载器
 * 
 * 功能: 从JSON文件加载题目并转换为程序可用的格式
 * 参数: 无
 * 返回值: 无
 */

const QuestionLoader = {
    /**
     * 已加载的题目
     */
    questions: [],

    /**
     * 从JSON数据加载题目
     * 
     * @param {Object} jsonData - JSON格式的题目数据
     * @returns {Array} 转换后的题目数组
     */
    loadFromJson: function(jsonData) {
        if (!jsonData || !jsonData.data || !jsonData.data.list || !Array.isArray(jsonData.data.list)) {
            console.error('无效的题目数据格式');
            return [];
        }

        this.questions = jsonData.data.list.map((q, index) => {
            return this.convertQuestion(q, index);
        });

        console.log(`成功加载 ${this.questions.length} 道题目`);
        return this.questions;
    },

    /**
     * 转换单个题目格式
     * 
     * @param {Object} rawQuestion - 原始题目对象
     * @param {number} index - 题目索引
     * @returns {Object} 转换后的题目对象
     */
    convertQuestion: function(rawQuestion, index) {
        const options = rawQuestion.option || [];
        
        return {
            id: rawQuestion.id.toString(),
            text: rawQuestion.name,
            type: 'choice',
            options: options.map(opt => ({
                id: opt.id.toString(),
                code: opt.code,
                text: opt.name,
                character_type: opt.character_type
            })),
            originalIndex: index
        };
    },

    /**
     * 获取所有题目
     * 
     * @returns {Array} 题目数组
     */
    getQuestions: function() {
        return this.questions;
    },

    /**
     * 获取题目数量
     * 
     * @returns {number} 题目数量
     */
    getCount: function() {
        return this.questions.length;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionLoader;
}
