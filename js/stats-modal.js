// 版本号: v1.0.0
/**
 * 统计数据弹窗模块
 * 
 * 功能: 处理配对统计数据的加载和展示
 */

const StatsModal = {
    /**
     * 气质组合名称映射
     */
    temperamentNames: {
        'NF-NF': '岩草型 × 岩草型',
        'SJ-SJ': '火冰型 × 火冰型',
        'NT-NT': '岩雷型 × 岩雷型',
        'SP-SP': '火原型 × 火原型',
        'NF-NT': '岩草型 × 岩雷型',
        'NF-SJ': '岩草型 × 火冰型',
        'NF-SP': '岩草型 × 火原型',
        'NT-SP': '岩雷型 × 火原型',
        'NT-SJ': '岩雷型 × 火冰型',
        'SJ-SP': '火冰型 × 火原型'
    },

    /**
     * 等级名称映射
     */
    levelNames: {
        level_1: '一级',
        level_2: '二级',
        level_3: '三级',
        level_4: '四级',
        level_5: '五级'
    },

    /**
     * 初始化统计数据弹窗
     */
    init: function() {
        const statsBtn = document.getElementById('stats-info-btn');
        const statsModal = document.getElementById('stats-modal');
        const statsClose = document.getElementById('stats-modal-close');

        if (statsBtn && statsModal) {
            statsBtn.addEventListener('click', () => {
                this.show();
            });

            statsModal.addEventListener('click', (e) => {
                if (e.target === statsModal) {
                    this.hide();
                }
            });

            if (statsClose) {
                statsClose.addEventListener('click', () => {
                    this.hide();
                });
            }
        }
    },

    /**
     * 显示统计数据弹窗
     */
    show: async function() {
        const modal = document.getElementById('stats-modal');
        const body = document.getElementById('stats-modal-body');
        
        if (!modal || !body) return;

        modal.classList.add('show');
        body.innerHTML = '<div class="stats-loading">加载中...</div>';

        try {
            const response = await fetch('data/mbti_compatibility_stats.json');
            if (!response.ok) {
                body.innerHTML = '<div class="stats-loading">加载失败</div>';
                return;
            }

            const data = await response.json();
            body.innerHTML = this.renderContent(data);
        } catch (error) {
            console.error('加载统计数据失败:', error);
            body.innerHTML = '<div class="stats-loading">加载失败</div>';
        }
    },

    /**
     * 隐藏统计数据弹窗
     */
    hide: function() {
        const modal = document.getElementById('stats-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * 渲染统计数据内容
     * 
     * @param {Object} data - 统计数据
     * @returns {string} HTML字符串
     */
    renderContent: function(data) {
        let html = '';

        html += this.renderDistributionSection(data.compatibility_distribution);
        html += this.renderTypeSection(data.type_compatibility);
        html += this.renderTemperamentSection(data.temperament_combinations);

        return html;
    },

    /**
     * 渲染适配度等级分布区块
     * 
     * @param {Object} distribution - 分布数据
     * @returns {string} HTML字符串
     */
    renderDistributionSection: function(distribution) {
        let html = '<div class="stats-section">';
        html += '<div class="stats-section-title">适配度等级分布</div>';
        html += '<div class="stats-distribution">';

        for (const [key, value] of Object.entries(distribution)) {
            const level = key.replace('level_', '');
            html += `
                <div class="stats-distribution-item">
                    <span class="stats-distribution-label">${this.levelNames[key]}</span>
                    <div class="stats-distribution-bar-container">
                        <div class="stats-distribution-bar level-${level}" style="width: ${value.percentage}%"></div>
                    </div>
                    <span class="stats-distribution-value">${value.count}条 (${value.percentage}%)</span>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * 渲染各类型平均适配度区块
     * 
     * @param {Object} typeCompatibility - 类型适配度数据
     * @returns {string} HTML字符串
     */
    renderTypeSection: function(typeCompatibility) {
        let html = '<div class="stats-section">';
        html += '<div class="stats-section-title">各类型平均适配度</div>';
        html += '<div class="stats-type-grid">';

        const sortedTypes = Object.entries(typeCompatibility).sort((a, b) => a[1].rank - b[1].rank);
        
        for (const [type, info] of sortedTypes) {
            const typeDisplay = TermRenderer.getElements(type);
            html += `
                <div class="stats-type-item">
                    <div class="stats-type-name">${typeDisplay}</div>
                    <div class="stats-type-level">平均 ${info.avg_level} 级</div>
                    <div class="stats-type-rank">排名 #${info.rank}</div>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * 渲染气质组合适配度区块
     * 
     * @param {Object} temperamentCombinations - 气质组合数据
     * @returns {string} HTML字符串
     */
    renderTemperamentSection: function(temperamentCombinations) {
        let html = '<div class="stats-section">';
        html += '<div class="stats-section-title">气质组合适配度</div>';
        html += '<div class="stats-temp-grid">';

        const sortedTemp = Object.entries(temperamentCombinations).sort((a, b) => a[1].rank - b[1].rank);
        
        for (const [key, info] of sortedTemp) {
            const displayName = this.temperamentNames[key] || key;
            html += `
                <div class="stats-temp-item">
                    <div class="stats-temp-name">${displayName}</div>
                    <div class="stats-temp-data">
                        <span>平均等级</span>
                        <span class="stats-temp-avg">${info.avg_level} 级</span>
                    </div>
                    <div class="stats-temp-data">
                        <span>配对数量</span>
                        <span>${info.count} 对</span>
                    </div>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    }
};
