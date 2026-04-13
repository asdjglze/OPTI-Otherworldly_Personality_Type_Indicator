// 版本号: v1.0.0
/**
 * 角色统计数据弹窗模块
 * 
 * 功能: 处理角色统计数据的加载和展示
 */

const CharacterStatsModal = {
    /**
     * 初始化角色统计数据弹窗
     */
    init: function() {
        const statsBtn = document.getElementById('character-stats-btn');
        const statsModal = document.getElementById('character-stats-modal');
        const statsClose = document.getElementById('character-stats-modal-close');

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
     * 显示角色统计数据弹窗
     */
    show: async function() {
        const modal = document.getElementById('character-stats-modal');
        const body = document.getElementById('character-stats-modal-body');
        
        if (!modal || !body) return;

        modal.classList.add('show');
        body.innerHTML = '<div class="stats-loading">加载中...</div>';

        try {
            const response = await fetch('data/mbti_statistics.json');
            if (!response.ok) {
                body.innerHTML = '<div class="stats-loading">加载失败</div>';
                return;
            }

            const data = await response.json();
            body.innerHTML = this.renderContent(data);
        } catch (error) {
            console.error('加载角色统计数据失败:', error);
            body.innerHTML = '<div class="stats-loading">加载失败</div>';
        }
    },

    /**
     * 隐藏角色统计数据弹窗
     */
    hide: function() {
        const modal = document.getElementById('character-stats-modal');
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

        html += this.renderOverviewSection(data);
        html += this.renderMBTIDistributionSection(data['MBTI类型分布']);
        html += this.renderRegionSection(data['地区统计']);
        html += this.renderElementSection(data['元素统计']);
        html += this.renderDimensionSection(data['维度分布']);
        html += this.renderTemperamentSection(data['气质类型分布']);

        return html;
    },

    /**
     * 渲染概览区块
     * 
     * @param {Object} data - 统计数据
     * @returns {string} HTML字符串
     */
    renderOverviewSection: function(data) {
        return `
            <div class="stats-section">
                <div class="stats-section-title">数据概览</div>
                <div class="stats-overview-grid">
                    <div class="stats-overview-item">
                        <div class="stats-overview-value">${data['总计'] || 0}</div>
                        <div class="stats-overview-label">角色总数</div>
                    </div>
                    <div class="stats-overview-item">
                        <div class="stats-overview-value">${data['生成时间'] || '-'}</div>
                        <div class="stats-overview-label">数据更新时间</div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 渲染MBTI类型分布区块
     * 
     * @param {Object} distribution - 分布数据
     * @returns {string} HTML字符串
     */
    renderMBTIDistributionSection: function(distribution) {
        if (!distribution) return '';
        
        let html = '<div class="stats-section">';
        html += '<div class="stats-section-title">🧠 MBTI类型分布</div>';
        html += '<div class="stats-mbti-grid">';

        const sortedTypes = Object.entries(distribution).sort((a, b) => b[1]['数量'] - a[1]['数量']);
        
        for (const [type, info] of sortedTypes) {
            const typeDisplay = TermRenderer.getElements(type);
            html += `
                <div class="stats-mbti-item">
                    <div class="stats-mbti-name">${typeDisplay}</div>
                    <div class="stats-mbti-count">${info['数量']} 人</div>
                    <div class="stats-mbti-percent">${info['占比']}</div>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * 渲染地区统计区块
     * 
     * @param {Object} regionStats - 地区统计数据
     * @returns {string} HTML字符串
     */
    renderRegionSection: function(regionStats) {
        if (!regionStats) return '';
        
        let html = '<div class="stats-section">';
        html += '<div class="stats-section-title">地区统计</div>';
        html += '<div class="stats-region-grid">';

        for (const [region, info] of Object.entries(regionStats)) {
            html += `
                <div class="stats-region-item">
                    <div class="stats-region-header">
                        <span class="stats-region-name">${region}</span>
                        <span class="stats-region-total">${info['总人口']}人 (${info['占比']})</span>
                    </div>
                    <div class="stats-region-dominant">主导性格: ${info['主导性格']}</div>
                    <div class="stats-region-ranking">
                        ${info['性格排名'].slice(0, 3).map(r => 
                            `<span class="stats-ranking-tag">${r['MBTI']} ${r['占比']}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * 渲染元素统计区块
     * 
     * @param {Object} elementStats - 元素统计数据
     * @returns {string} HTML字符串
     */
    renderElementSection: function(elementStats) {
        if (!elementStats) return '';
        
        let html = '<div class="stats-section">';
        html += '<div class="stats-section-title">⚡ 元素统计</div>';
        html += '<div class="stats-element-grid">';

        const elementColors = {
            '冰': 'var(--cryo)',
            '水': 'var(--hydro)',
            '火': 'var(--pyro)',
            '雷': 'var(--electro)',
            '草': 'var(--dendro)',
            '岩': 'var(--geo)',
            '风': 'var(--anemo)'
        };

        for (const [element, info] of Object.entries(elementStats)) {
            const color = elementColors[element] || '#ccc';
            html += `
                <div class="stats-element-item" style="--element-color: ${color}">
                    <div class="stats-element-header">
                        <span class="stats-element-icon" style="background: ${color}">${element}</span>
                        <span class="stats-element-total">${info['总人口']}人 (${info['占比']})</span>
                    </div>
                    <div class="stats-element-dominant">主导性格: ${info['主导性格']}</div>
                    <div class="stats-element-ranking">
                        ${info['性格排名'].slice(0, 3).map(r => 
                            `<span class="stats-ranking-tag">${r['MBTI']} ${r['占比']}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * 渲染维度分布区块
     * 
     * @param {Object} dimensionData - 维度数据
     * @returns {string} HTML字符串
     */
    renderDimensionSection: function(dimensionData) {
        if (!dimensionData) return '';
        
        let html = '<div class="stats-section">';
        html += '<div class="stats-section-title">📐 维度分布</div>';
        html += '<div class="stats-dimension-grid">';

        const dimensionLabels = {
            'E/I': { left: '外向(E)', right: '内向(I)' },
            'N/S': { left: '直觉(N)', right: '实感(S)' },
            'T/F': { left: '思考(T)', right: '情感(F)' },
            'J/P': { left: '判断(J)', right: '知觉(P)' }
        };

        const dimensionColors = {
            'E/I': { left: 'var(--anemo)', right: 'var(--hydro)' },
            'N/S': { left: 'var(--geo)', right: 'var(--pyro)' },
            'T/F': { left: 'var(--electro)', right: 'var(--dendro)' },
            'J/P': { left: 'var(--cryo)', right: 'var(--physical)' }
        };

        for (const [dimension, info] of Object.entries(dimensionData)) {
            const labels = dimensionLabels[dimension] || { left: '左', right: '右' };
            const colors = dimensionColors[dimension] || { left: '#60a5fa', right: '#f87171' };
            const leftKey = dimension.split('/')[0];
            const rightKey = dimension.split('/')[1];
            const leftValue = info[leftKey];
            const rightValue = info[rightKey];
            const leftPercent = parseFloat(info[leftKey + '占比']);
            const rightPercent = parseFloat(info[rightKey + '占比']);

            html += `
                <div class="stats-dimension-item">
                    <div class="stats-dimension-labels">
                        <span>${labels.left}: ${leftValue} (${info[leftKey + '占比']})</span>
                        <span>${labels.right}: ${rightValue} (${info[rightKey + '占比']})</span>
                    </div>
                    <div class="stats-dimension-bar">
                        <div class="stats-dimension-left" style="width: ${leftPercent}%; background: ${colors.left}">${leftPercent}%</div>
                        <div class="stats-dimension-right" style="width: ${rightPercent}%; background: ${colors.right}">${rightPercent}%</div>
                    </div>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * 渲染气质类型分布区块
     * 
     * @param {Object} temperamentData - 气质类型数据
     * @returns {string} HTML字符串
     */
    renderTemperamentSection: function(temperamentData) {
        if (!temperamentData) return '';
        
        let html = '<div class="stats-section">';
        html += '<div class="stats-section-title">🌟 气质类型分布</div>';
        html += '<div class="stats-temperament-grid">';

        const temperamentColors = {
            'NT': '#C084FC',
            'NF': '#6EE7B3',
            'ST': '#60A5FA',
            'SF': '#FBBF24'
        };

        for (const [key, info] of Object.entries(temperamentData)) {
            const color = temperamentColors[key] || '#666';
            html += `
                <div class="stats-temperament-item" style="--temp-color: ${color}">
                    <div class="stats-temperament-code">${key}</div>
                    <div class="stats-temperament-name">${info['名称']}</div>
                    <div class="stats-temperament-count">${info['数量']}人</div>
                    <div class="stats-temperament-percent">${info['占比']}</div>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    }
};
