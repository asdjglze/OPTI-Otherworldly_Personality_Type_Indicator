// 版本号: v1.0.0
/**
 * 原神版MBTI - 题目维度映射
 * 
 * 功能: 根据题目内容自动判断维度，或使用预设映射
 * 规则: 基于题目关键词和选项内容进行维度判断
 */

const DimensionMapper = {
    /**
     * 维度关键词映射
     */
    keywords: {
        EI: {
            E: ['主动', '社交', '聚会', '外向', '开朗', '活跃', '表达', '健谈', '广泛', '认识', '参与', '交流', '热闹', '社交型', '善表达', '主动', '快速融入'],
            I: ['独自', '安静', '内向', '含蓄', '倾听', '深度', '少数', '熟悉', '独立', '观察', '被动', '慢慢', '一个人', '安静倾听', '观察型']
        },
        SN: {
            S: ['实际', '经验', '细节', '具体', '现实', '数据', '按部就班', '执行', '实用', '事实', '现实可行', '数据导向', '分析清晰', '全面记录'],
            N: ['直觉', '灵感', '创意', '抽象', '想象', '概念', '创新', '构想', '未来', '潜在', '理念', '整体框架', '概念导向', '把握大意', '构建未来']
        },
        TF: {
            T: ['逻辑', '理性', '客观', '原则', '冷静', '效率', '分析', '道理', '精准', '权衡利弊', '公平', '数据', '结果', '严谨', '执行者'],
            F: ['情感', '感性', '感受', '人情', '温暖', '和谐', '关怀', '情绪', '体贴', '跟随内心', '同理心', '关系', '过程', '热心', '鼓舞者']
        },
        JP: {
            J: ['计划', '有序', '准时', '规律', '安排', '提前', '完成', '有条理', '控制', '快速执行', '稳定', '快速决策', '讨厌混乱', '达成目标'],
            P: ['灵活', '随性', '自由', '弹性', '变化', '随机', '完善', '随心所欲', '适应', '反复完善', '灵动', '探索多面', '讨厌束缚', '有意义的过程']
        }
    },

    /**
     * 题目ID范围到维度的映射（基于题目分析）
     */
    idRangeMapping: [
        { range: [1, 12], dimension: 'EI' },
        { range: [13, 21], dimension: 'SN' },
        { range: [22, 28], dimension: 'TF' },
        { range: [29, 35], dimension: 'JP' },
        { range: [36, 50], dimension: 'EI' },
        { range: [51, 60], dimension: 'SN' },
        { range: [61, 70], dimension: 'TF' },
        { range: [71, 80], dimension: 'JP' },
        { range: [81, 100], dimension: 'EI' },
        { range: [101, 105], dimension: 'EI' },
        { range: [106, 110], dimension: 'SN' },
        { range: [111, 115], dimension: 'TF' },
        { range: [116, 120], dimension: 'JP' },
        { range: [121, 122], dimension: 'EI' },
        { range: [123, 130], dimension: 'TF' },
        { range: [131, 136], dimension: 'JP' },
        { range: [137, 138], dimension: 'SN' },
        { range: [139, 144], dimension: 'JP' },
        { range: [145, 149], dimension: 'TF' },
        { range: [150, 153], dimension: 'EI' },
        { range: [154, 157], dimension: 'SN' },
        { range: [158, 160], dimension: 'JP' },
        { range: [161, 165], dimension: 'TF' },
        { range: [166, 170], dimension: 'JP' },
        { range: [171, 172], dimension: 'EI' },
        { range: [173, 176], dimension: 'JP' },
        { range: [177, 180], dimension: 'SN' },
        { range: [181, 185], dimension: 'SN' },
        { range: [186, 190], dimension: 'JP' },
        { range: [191, 195], dimension: 'TF' },
        { range: [196, 199], dimension: 'JP' }
    ],

    /**
     * 根据题目ID获取维度
     * 
     * @param {number} stationId - 题目站点ID
     * @returns {string} 维度代码
     */
    getDimensionById: function(stationId) {
        for (const mapping of this.idRangeMapping) {
            if (stationId >= mapping.range[0] && stationId <= mapping.range[1]) {
                return mapping.dimension;
            }
        }
        return 'EI';
    },

    /**
     * 根据选项内容判断倾向
     * 
     * @param {string} option - 选项文本
     * @param {string} dimension - 维度代码
     * @returns {string} 倾向字母
     */
    getTendency: function(option, dimension) {
        const dimKeywords = this.keywords[dimension];
        if (!dimKeywords) return null;

        for (const keyword of dimKeywords.E) {
            if (option.includes(keyword)) return dimension[0];
        }
        for (const keyword of dimKeywords[dimKeywords.E === dimKeywords.E ? 'I' : (dimension === 'EI' ? 'I' : (dimension === 'SN' ? 'N' : (dimension === 'TF' ? 'F' : 'P')))]) {
            if (option.includes(keyword)) return dimension === 'EI' ? 'I' : (dimension === 'SN' ? 'N' : (dimension === 'TF' ? 'F' : 'P'));
        }

        return null;
    },

    /**
     * 分析题目并返回维度和选项映射
     * 
     * @param {Object} question - 题目对象
     * @returns {Object} 包含维度和选项映射的对象
     */
    analyzeQuestion: function(question) {
        const dimension = this.getDimensionById(question.station_id);
        const options = question.options;
        
        const leftOption = options[0] ? options[0].trim() : '';
        const rightOption = options[1] ? options[1].trim() : '';
        
        let leftTendency = this.getTendency(leftOption, dimension);
        let rightTendency = this.getTendency(rightOption, dimension);
        
        if (!leftTendency || !rightTendency) {
            const dimConfig = {
                EI: { left: 'E', right: 'I' },
                SN: { left: 'S', right: 'N' },
                TF: { left: 'T', right: 'F' },
                JP: { left: 'J', right: 'P' }
            };
            leftTendency = dimConfig[dimension].left;
            rightTendency = dimConfig[dimension].right;
        }

        return {
            dimension: dimension,
            options: [
                { text: leftOption, value: leftTendency },
                { text: rightOption, value: rightTendency }
            ]
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DimensionMapper;
}
