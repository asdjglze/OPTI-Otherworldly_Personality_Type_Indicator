// 版本号: v1.0.0
/**
 * 原神版MBTI - 结果页面渲染器
 * 
 * 功能: 独立的结果页面渲染模块，负责所有结果页面的渲染逻辑
 * 依赖: TermRenderer（文本渲染）
 */

const ResultRenderer = {
    
    mbtiMapping: null,
    charactersData: null,
    elementTemperamentMapping: null,
    currentResult: null,
    currentGender: 'female',
    
    /**
     * 初始化渲染器
     */
    init: function(mbtiMapping, charactersData, elementTemperamentMapping) {
        this.mbtiMapping = mbtiMapping;
        this.charactersData = charactersData;
        this.elementTemperamentMapping = elementTemperamentMapping;
    },

    /**
     * 设置当前结果
     */
    setResult: function(result, gender) {
        this.currentResult = result;
        this.currentGender = gender || 'female';
    },

    /**
     * 渲染维度分析
     */
    renderDimensionAnalysis: function(scores) {
        const container = document.getElementById('dimension-analysis');
        if (!container) return;
        
        const dimNames = {
            EI: { name: '能量来源', left: '风（外倾）', right: '水（内倾）', leftElement: 'anemo', rightElement: 'hydro' },
            SN: { name: '信息收集', left: '火（感觉）', right: '岩（直觉）', leftElement: 'pyro', rightElement: 'geo' },
            TF: { name: '决策方式', left: '雷（思考）', right: '草（情感）', leftElement: 'electro', rightElement: 'dendro' },
            JP: { name: '生活方式', left: '冰（判断）', right: '原（感知）', leftElement: 'cryo', rightElement: 'physical' }
        };
        
        let html = '';
        for (const dim in scores) {
            const score = scores[dim];
            const info = dimNames[dim];
            
            const totalScore = score.leftScore + score.rightScore;
            const leftPercent = totalScore > 0 ? (score.leftScore / totalScore * 100) : 50;
            const rightPercent = totalScore > 0 ? (score.rightScore / totalScore * 100) : 50;
            const dominantElement = score.leftScore >= score.rightScore ? score.leftElement : score.rightElement;
            const dominantPercent = score.leftScore >= score.rightScore ? leftPercent : rightPercent;
            
            html += `
                <div class="dimension-card">
                    <div class="dimension-header">
                        <span class="dimension-name">${info.name}</span>
                        <span class="dimension-value">${this.getElementName(dominantElement)}元素 - ${dominantPercent.toFixed(1)}%</span>
                    </div>
                    <div class="dimension-bar">
                        <div class="dimension-bar-fill left" 
                             style="width: ${leftPercent}%; --element-color-1: var(--${score.leftElement})"></div>
                        <div class="dimension-bar-fill right" 
                             style="width: ${rightPercent}%; --element-color-2: var(--${score.rightElement})"></div>
                    </div>
                    <div class="dimension-labels">
                        <span class="dimension-label">
                            <img class="dimension-element-icon" src="assets/images/elements/${info.leftElement}.png" alt="${this.getElementName(info.leftElement)}">
                            ${info.left}
                        </span>
                        <span class="dimension-label">
                            <img class="dimension-element-icon" src="assets/images/elements/${info.rightElement}.png" alt="${this.getElementName(info.rightElement)}">
                            ${info.right}
                        </span>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    },

    /**
     * 渲染元素能力堆叠
     */
    renderFunctionStack: function(stack) {
        const container = document.getElementById('function-stack');
        if (!container) return;
        
        console.log('========== [renderFunctionStack] 开始渲染 ==========');
        console.log('[renderFunctionStack] stack:', stack);
        console.log('[renderFunctionStack] currentResult:', this.currentResult);
        console.log('[renderFunctionStack] functionDescriptions:', this.currentResult?.functionDescriptions);
        
        const positions = [
            { key: 'dominant', label: '主导功能' },
            { key: 'auxiliary', label: '辅助功能' },
            { key: 'tertiary', label: '第三功能' },
            { key: 'inferior', label: '劣势功能' }
        ];
        
        // 认知功能到元素反应的映射
        const functionToReaction = {
            'Te': 'Te', 'Ti': 'Ti',
            'Fe': 'Fe', 'Fi': 'Fi',
            'Ne': 'Ne', 'Ni': 'Ni',
            'Se': 'Se', 'Si': 'Si'
        };
        
        // 优先从后端返回的数据中获取，其次从 mbtiMapping 获取
        let functionDescriptions = this.currentResult?.functionDescriptions || null;
        
        if (!functionDescriptions && this.mbtiMapping) {
            const mbtiType = this.currentResult?.type;
            if (mbtiType && this.mbtiMapping[mbtiType]) {
                functionDescriptions = this.mbtiMapping[mbtiType].function_descriptions;
                console.log('[renderFunctionStack] 从 mbtiMapping 获取 functionDescriptions');
            }
        }
        
        console.log('[renderFunctionStack] 最终使用的 functionDescriptions:', functionDescriptions);
        
        // 保存数据供弹窗使用
        this._functionStackData = {
            stack: stack,
            positions: positions,
            functionDescriptions: functionDescriptions,
            functionToReaction: functionToReaction
        };
        
        let html = '<div class="function-stack-list">';
        positions.forEach(pos => {
            const func = stack[pos.key];
            const elementInfo = TermRenderer.getCognitiveFunctionInfo(func);
            const reactionName = TermRenderer.getReaction(func);
            
            // 获取反应类型和分级
            const reactionType = functionToReaction[func] || 'Te';
            const level = pos.key;
            
            let description = '';
            if (functionDescriptions && functionDescriptions[pos.key]) {
                console.log(`[renderFunctionStack] 渲染 ${pos.key}: ${functionDescriptions[pos.key].substring(0, 50)}...`);
                const renderedText = TermRenderer.render(functionDescriptions[pos.key]);
                description = TermRenderer.renderMarkdown(renderedText);
            } else {
                description = '暂无详细描述';
                console.log(`[renderFunctionStack] ${pos.key} 没有描述数据`);
            }
            
            html += `
                <div class="function-item function-item-${reactionType}-${level}" style="--element-color: var(--reaction-${reactionType}-${level}); --element-glow: var(--reaction-${reactionType}-${level}-glow);" data-function-key="${pos.key}" onclick="ResultRenderer.showFunctionDetailModal('${pos.key}')">
                    <div class="function-position">${pos.label}</div>
                    <div class="function-content">
                        <div class="function-name" style="color: var(--reaction-${reactionType}-${level});">${reactionName}</div>
                        <div class="function-desc">${description}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    },
    
    /**
     * 显示元素反应功能详情弹窗
     * 
     * @param {string} functionKey - 功能键名（dominant/auxiliary/tertiary/inferior）
     */
    showFunctionDetailModal: function(functionKey) {
        if (!this._functionStackData) return;
        
        const { stack, positions, functionDescriptions, functionToReaction } = this._functionStackData;
        const pos = positions.find(p => p.key === functionKey);
        if (!pos) return;
        
        const func = stack[functionKey];
        const reactionName = TermRenderer.getReaction(func);
        const reactionType = functionToReaction[func] || 'Te';
        
        let description = '暂无详细描述';
        if (functionDescriptions && functionDescriptions[functionKey]) {
            const renderedText = TermRenderer.render(functionDescriptions[functionKey]);
            description = TermRenderer.renderMarkdown(renderedText);
        }
        
        // 获取或创建弹窗
        let modal = document.getElementById('function-detail-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'function-detail-modal';
            modal.className = 'function-detail-modal';
            modal.innerHTML = `
                <div class="function-detail-overlay" onclick="ResultRenderer.hideFunctionDetailModal()"></div>
                <div class="function-detail-content">
                    <button class="function-detail-close" onclick="ResultRenderer.hideFunctionDetailModal()">×</button>
                    <div class="function-detail-header">
                        <div class="function-detail-position"></div>
                        <div class="function-detail-name"></div>
                    </div>
                    <div class="function-detail-body"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // 更新弹窗内容
        const positionEl = modal.querySelector('.function-detail-position');
        const nameEl = modal.querySelector('.function-detail-name');
        const bodyEl = modal.querySelector('.function-detail-body');
        const contentEl = modal.querySelector('.function-detail-content');
        
        positionEl.textContent = pos.label;
        nameEl.textContent = reactionName;
        nameEl.style.color = `var(--reaction-${reactionType}-${functionKey})`;
        bodyEl.innerHTML = description;
        contentEl.style.setProperty('--element-color', `var(--reaction-${reactionType}-${functionKey})`);
        contentEl.style.setProperty('--element-glow', `var(--reaction-${reactionType}-${functionKey}-glow)`);
        
        // 显示弹窗
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    },
    
    /**
     * 隐藏元素反应功能详情弹窗
     */
    hideFunctionDetailModal: function() {
        const modal = document.getElementById('function-detail-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    },

    /**
     * 渲染典型角色板块
     */
    renderCharacterExamplesSection: function(mbtiType) {
        const container = document.getElementById('character-examples-section');
        if (!container || !mbtiType || !this.mbtiMapping || !this.charactersData) return;
        
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return;
        
        // 从 group 字段获取该类型的角色ID列表
        const characterIds = mapping.group || [];
        
        if (characterIds.length === 0) return;
        
        // 收集角色数据并按星级排序（五星在前，四星在后）
        const characters = [];
        characterIds.forEach(characterId => {
            const character = this.charactersData[characterId];
            if (character) {
                characters.push({
                    id: characterId,
                    data: character,
                    rarity: character.rarity || '4'
                });
            }
        });
        
        // 按星级排序：五星在前，四星在后
        characters.sort((a, b) => {
            const rarityA = a.rarity.includes('5') ? 5 : 4;
            const rarityB = b.rarity.includes('5') ? 5 : 4;
            return rarityB - rarityA;
        });
        
        const elementColors = TermRenderer.getNameToCodeMap();
        
        let html = '<div class="character-examples-card">';
        
        characters.forEach(char => {
            const character = char.data;
            
            let element = character.vision_cn || '';
            element = element.replace('元素', '');
            const elementClass = elementColors[element] || '';
            
            let rarity = character.rarity || '未知';
            if (rarity.includes('5')) {
                rarity = '⭐⭐⭐⭐⭐';
            } else if (rarity.includes('4')) {
                rarity = '⭐⭐⭐⭐';
            }
            
            html += `
                <div class="character-example-row">
                    <div class="character-example-avatar">
                        <img src="${character.assets?.avatar || ''}" alt="${character.name}" onerror="this.src='assets/images/logo.png'">
                    </div>
                    <div class="character-example-content">
                        <div class="character-example-header">
                            <span class="character-example-name">${character.name}</span>
                            <span class="character-example-element element-${elementClass}">${element}</span>
                        </div>
                        <div class="character-example-stars">${rarity}</div>
                        <div class="character-example-intro">${character.description || ''}</div>
                        <div class="character-example-basic">
                            <span class="basic-item"><b>地区</b> ${character.region || '未知'}</span>
                            <span class="basic-item"><b>势力</b> ${character.affiliation || '未知'}</span>
                            <span class="basic-item"><b>武器</b> ${character.weapon_type || '未知'}</span>
                            <span class="basic-item"><b>生日</b> ${character.birthday || '未知'}</span>
                            <span class="basic-item"><b>命座</b> ${character.constellation || '未知'}</span>
                            <span class="basic-item"><b>称号</b> ${character.title || '未知'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        container.innerHTML = html;
    },

    /**
     * 渲染职业发展板块
     */
    renderCareerSection: function(mbtiType) {
        const container = document.getElementById('career-section');
        if (!container || !mbtiType || !this.mbtiMapping) return;
        
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return;
        
        const careers = mapping.suitable_careers;
        if (!careers) return;
        
        let html = '';
        
        // 总结概览
        if (careers['summary']) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">职业概览</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__rich-text">' + TermRenderer.render(careers['summary']) + '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        // 优势与劣势 + 工作风格 并排显示
        if ((careers['strengths'] || careers['weaknesses']) || (careers['leadership_style'] || careers['team_role'])) {
            html += '<div class="obc-tmpl-row">';
            
            // 优势与劣势
            if (careers['strengths'] || careers['weaknesses']) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">优势与劣势</h2>';
                html += '<table><thead><tr><th class="wiki-h3">优势</th><th class="wiki-h3">劣势</th></tr></thead><tbody>';
                const maxLen = Math.max(
                    careers['strengths']?.length || 0,
                    careers['weaknesses']?.length || 0
                );
                for (let i = 0; i < maxLen; i++) {
                    const strength = careers['strengths']?.[i] || '';
                    const weakness = careers['weaknesses']?.[i] || '';
                    html += '<tr>';
                    html += '<td>' + (strength ? TermRenderer.render(strength) : '-') + '</td>';
                    html += '<td>' + (weakness ? TermRenderer.render(weakness) : '-') + '</td>';
                    html += '</tr>';
                }
                html += '</tbody></table></div>';
            }
            
            // 工作风格（左右分列）
            if (careers['leadership_style'] || careers['team_role']) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">工作风格</h2>';
                html += '<table><thead><tr>';
                html += '<th class="wiki-h3">领导风格</th>';
                html += '<th class="wiki-h3">团队角色</th>';
                html += '</tr></thead><tbody><tr>';
                if (careers['leadership_style']) {
                    html += '<td>';
                    html += '<p><strong>' + TermRenderer.render(careers['leadership_style']['type']) + '</strong></p>';
                    html += '<p>' + TermRenderer.render(careers['leadership_style']['description']) + '</p>';
                    html += '</td>';
                } else {
                    html += '<td>-</td>';
                }
                if (careers['team_role']) {
                    html += '<td>';
                    html += '<p><strong>' + TermRenderer.render(careers['team_role']['type']) + '</strong></p>';
                    html += '<p>' + TermRenderer.render(careers['team_role']['description']) + '</p>';
                    html += '</td>';
                } else {
                    html += '<td>-</td>';
                }
                html += '</tr></tbody></table></div>';
            }
            
            html += '</div>';
        }
        
        // 适合领域
        if (careers['suitable_fields'] && careers['suitable_fields'].length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">适合领域</h2>';
            html += '<table class="suitable-fields-table"><tbody>';
            careers['suitable_fields'].forEach(field => {
                html += '<tr>';
                html += '<td class="wiki-h3">' + TermRenderer.render(field['category']) + '</td>';
                if (field['positions'] && field['positions'].length > 0) {
                    html += '<td class="obc-tmpl__tags">';
                    field['positions'].forEach(position => {
                        html += '<span class="wiki-tag">' + TermRenderer.render(position) + '</span>';
                    });
                    html += '</td>';
                } else {
                    html += '<td>-</td>';
                }
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }
        
        // 职业发展建议
        if (careers['career_advice'] && careers['career_advice'].length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">职业发展建议</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__list">';
            careers['career_advice'].forEach((advice) => {
                html += '<p><strong>' + TermRenderer.render(advice['advice']) + '</strong>：' + TermRenderer.render(advice['reason']) + '</p>';
            });
            html += '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        // 免责声明
        html += '<div class="career-disclaimer">本模块基于2022年版《中华人民共和国职业分类大典》编制，采用中类分类、小类命名的泛化方式，旨在提供方向性参考。职业生态瞬息万变，新兴职业不断涌现，具体岗位分工、职级发展等详细信息，还需结合当下实际情况自行调研。职业选择是复杂的动态过程，本测试仅作参考，实践请以现实为准。</div>';
        
        container.innerHTML = html;
    },

    /**
     * 渲染双层级筛选器
     */
    renderCompatibilitySelector: function(container, currentType, groupedPairs) {
        const levelLabels = {
            1: '灵魂伴侣',
            2: '和谐增益',
            3: '互补扶持',
            4: '磨合成长',
            5: '挑战重重'
        };
        
        let html = '<div class="relationship-selector-wrap">';
        
        html += '<div class="relationship-level-tabs">';
        for (let level = 1; level <= 5; level++) {
            const data = groupedPairs[level] || { pairs: [] };
            const hasData = data.pairs.length > 0;
            html += `<div class="relationship-level-card level-${level}${hasData ? '' : ' empty'}" data-level="${level}" data-has-data="${hasData}">`;
            html += `<span class="level-num">${level}</span>`;
            html += `<span class="level-content">`;
            html += `<span class="level-name">${levelLabels[level]}</span>`;
            html += `<span class="level-count">${data.pairs.length}</span>`;
            html += '</span>';
            html += '</div>';
        }
        html += '</div>';
        
        html += '<div class="relationship-type-section">';
        html += '<div class="relationship-type-tabs"></div>';
        html += '<div class="relationship-detail-panel"></div>';
        html += '</div>';
        
        html += '</div>';
        
        container.innerHTML = html;
        
        container._groupedPairs = groupedPairs;
        container._currentType = currentType;
        
        this.bindRelationshipEvents(container);
        
        const firstCardWithData = container.querySelector('.relationship-level-card[data-has-data="true"]');
        if (firstCardWithData) {
            firstCardWithData.click();
        } else {
            container.querySelector('.relationship-level-card').click();
        }
    },

    /**
     * 绑定婚恋指南事件
     */
    bindRelationshipEvents: function(container) {
        const self = this;
        const levelTabs = container.querySelector('.relationship-level-tabs');
        
        levelTabs.querySelectorAll('.relationship-level-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                levelTabs.classList.add('hovering');
            });
            
            card.addEventListener('mouseleave', function() {
                levelTabs.classList.remove('hovering');
            });
            
            card.addEventListener('click', function() {
                if (this.dataset.hasData === 'false') return;
                
                levelTabs.querySelectorAll('.relationship-level-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                const level = this.dataset.level;
                const groupedPairs = container._groupedPairs;
                const currentType = container._currentType;
                
                const levelData = groupedPairs[level] || { pairs: [] };
                self.renderTypeTabs(container, level, levelData.pairs, currentType);
            });
        });
    },

    /**
     * 渲染类型筛选标签
     */
    renderTypeTabs: function(container, level, pairs, currentType) {
        const self = this;
        const typeTabsContainer = container.querySelector('.relationship-type-tabs');
        const detailPanel = container.querySelector('.relationship-detail-panel');
        
        if (!pairs || pairs.length === 0) {
            typeTabsContainer.innerHTML = '<div class="relationship-empty-hint">该等级暂无匹配数据</div>';
            detailPanel.innerHTML = '';
            return;
        }
        
        let html = '<div class="relationship-type-buttons">';
        pairs.forEach((pair, index) => {
            const otherType = TermRenderer.getElements(pair.other_type);
            html += `<button class="relationship-type-tab" data-index="${index}">${otherType}</button>`;
        });
        html += '</div>';
        
        typeTabsContainer.innerHTML = html;
        detailPanel.innerHTML = '';
        
        typeTabsContainer.querySelectorAll('.relationship-type-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                typeTabsContainer.querySelectorAll('.relationship-type-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const index = parseInt(this.dataset.index);
                const pair = pairs[index];
                
                self.renderPairDetail(detailPanel, currentType, level, pair);
            });
        });
        
        const firstTab = typeTabsContainer.querySelector('.relationship-type-tab');
        if (firstTab) {
            firstTab.click();
        }
    },

    /**
     * 渲染单个配对详情
     */
    renderPairDetail: function(panel, currentType, level, pair) {
        const myType = TermRenderer.getElements(currentType);
        const otherType = TermRenderer.getElements(pair.other_type);
        const analysis = TermRenderer.render(pair.analysis);
        const advice = TermRenderer.render(pair.advice_for_current);
        
        const levelLabels = {
            1: '灵魂伴侣',
            2: '和谐增益',
            3: '互补扶持',
            4: '磨合成长',
            5: '挑战重重'
        };
        
        let html = '<div class="obc-tmpl-part">';
        html += '<table><tbody>';
        
        html += '<tr>';
        html += '<td class="wiki-h3">配对类型</td>';
        html += `<td><strong>${myType}</strong> ↔ <strong>${otherType}</strong></td>`;
        html += '</tr>';
        
        html += '<tr>';
        html += '<td class="wiki-h3">配对等级</td>';
        html += `<td>${levelLabels[level]}</td>`;
        html += '</tr>';
        
        html += '<tr>';
        html += '<td class="wiki-h3">配对分析</td>';
        html += `<td class="obc-tmpl__rich-text">${analysis}</td>`;
        html += '</tr>';
        
        html += '<tr>';
        html += '<td class="wiki-h3">相处建议</td>';
        html += `<td class="obc-tmpl__rich-text">${advice}</td>`;
        html += '</tr>';
        
        html += '</tbody></table></div>';
        
        panel.innerHTML = html;
        
        // 检查并应用标注状态
        if (typeof window.annotationVisible !== 'undefined' && !window.annotationVisible) {
            if (typeof UI !== 'undefined' && UI.toggleAnnotations) {
                UI.toggleAnnotations(true);
            }
        }
    },

    /**
     * 提取与指定MBTI类型相关的所有配对
     */
    extractRelatedPairs: function(pairs, mbtiType) {
        const result = [];
        const seenPairs = new Set();
        
        for (const pair of pairs) {
            if (pair.type_a === mbtiType || pair.type_b === mbtiType) {
                if (!pair.compatibility_level_number || pair.compatibility_level_number === 0) {
                    continue;
                }
                
                const pairKey = [pair.type_a, pair.type_b].sort().join('-');
                if (seenPairs.has(pairKey)) continue;
                seenPairs.add(pairKey);
                
                const isTypeA = pair.type_a === mbtiType;
                result.push({
                    my_type: mbtiType,
                    other_type: isTypeA ? pair.type_b : pair.type_a,
                    is_self_pair: pair.is_self_pair,
                    compatibility_level: pair.compatibility_level,
                    compatibility_level_number: pair.compatibility_level_number,
                    analysis: pair.analysis,
                    advice_for_current: isTypeA ? pair.advice_for_a_to_b : pair.advice_for_b_to_a
                });
            }
        }
        
        return result;
    },

    /**
     * 按等级分组配对
     */
    groupByLevel: function(pairs) {
        const grouped = {};
        
        const levelOrder = [1, 2, 3, 4, 5];
        const levelNames = {
            1: '一级：灵魂伴侣',
            2: '二级：和谐增益',
            3: '三级：互补扶持',
            4: '四级：磨合成长',
            5: '五级：挑战重重'
        };
        
        for (const level of levelOrder) {
            grouped[level] = {
                name: levelNames[level],
                pairs: []
            };
        }
        
        for (const pair of pairs) {
            const level = pair.compatibility_level_number;
            if (grouped[level]) {
                grouped[level].pairs.push(pair);
            }
        }
        
        return grouped;
    },

    /**
     * 渲染配对分组区域
     */
    renderCompatibilitySections: function(container, currentType, groupedPairs) {
        let html = '';
        
        let hasData = false;
        const levelLabels = {
            1: '灵魂伴侣',
            2: '和谐增益',
            3: '互补扶持',
            4: '磨合成长',
            5: '挑战重重'
        };
        
        for (const [level, data] of Object.entries(groupedPairs)) {
            if (data.pairs.length === 0) continue;
            hasData = true;
        }
        
        if (hasData) {
            html += '<div class="compatibility-quick-view">';
            
            for (const [level, data] of Object.entries(groupedPairs)) {
                if (data.pairs.length === 0) continue;
                
                html += '<div class="compatibility-quick-row">';
                html += `<span class="compatibility-quick-label">${levelLabels[level]}：</span>`;
                html += '<div class="compatibility-quick-types">';
                
                data.pairs.forEach(pair => {
                    html += `<span class="compatibility-quick-tag level-${level}" data-target="pair-${level}-${pair.other_type}">${TermRenderer.getElements(pair.other_type)}</span>`;
                });
                
                html += '</div></div>';
            }
            
            html += '</div>';
            html += '<div class="compatibility-divider"></div>';
        }
        
        html += '<div class="compatibility-detail-view">';
        
        for (const [level, data] of Object.entries(groupedPairs)) {
            if (data.pairs.length === 0) continue;
            
            html += `
                <div class="compatibility-section">
                    <div class="compatibility-level-title">
                        <span class="compatibility-level-icon level-${level}">${level}</span>
                        ${data.name}
                        <span style="color: #999; font-size: 12px; font-weight: 400;">(${data.pairs.length}个配对)</span>
                    </div>
                    <div class="compatibility-cards">
                        ${this.renderCompatibilityCards(currentType, level, data.pairs)}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        
        if (!hasData) {
            html = '<div class="no-compatibility-data">暂无该性格类型的配对数据</div>';
        }
        
        container.innerHTML = html;
        
        container.querySelectorAll('.compatibility-quick-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const targetId = this.dataset.target;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetElement.classList.add('highlight');
                    setTimeout(() => targetElement.classList.remove('highlight'), 2000);
                }
            });
        });
    },

    /**
     * 渲染配对卡片
     */
    renderCompatibilityCards: function(currentType, level, pairs) {
        return pairs.map(pair => {
            const myType = TermRenderer.getElements(currentType);
            const otherType = TermRenderer.getElements(pair.other_type);
            const analysis = TermRenderer.render(pair.analysis);
            const advice = TermRenderer.render(pair.advice_for_current);
            
            return `
            <div class="compatibility-card" id="pair-${level}-${pair.other_type}">
                <div class="compatibility-card-header">
                    <div class="compatibility-types">
                        <span class="compatibility-type current">${myType}</span>
                        <span class="compatibility-arrow"><-></span>
                        <span class="compatibility-type level-${level}">${otherType}</span>
                    </div>
                </div>
                <div class="compatibility-analysis">${analysis}</div>
                <div class="compatibility-advice">
                    <div class="compatibility-advice-title">相处建议</div>
                    <div class="compatibility-advice-content">${advice}</div>
                </div>
            </div>
        `;
        }).join('');
    },

    /**
     * 渲染亲友相处板块
     */
    renderFriendshipSection: function(mbtiType) {
        const container = document.getElementById('friendship-section');
        if (!container || !mbtiType || !this.mbtiMapping) return;
        
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping || !mapping.relationship_advice) return;
        
        const advice = mapping.relationship_advice;
        
        let html = '<div class="friendship-card">';
        html += '<div class="friendship-content">';
        
        if (advice.suitable && advice.suitable.length > 0) {
            html += '<div class="friendship-section-title">志同道合</div>';
            html += '<div class="friendship-types">';
            advice.suitable.forEach(item => {
                html += `<span class="friendship-type-tag">${TermRenderer.getElements(item.type)}</span>`;
            });
            html += '</div>';
        }
        
        if (advice.challenging && advice.challenging.length > 0) {
            html += '<div class="friendship-section-title">互相理解</div>';
            html += '<div class="friendship-types">';
            advice.challenging.forEach(item => {
                html += `<span class="friendship-type-tag challenging">${TermRenderer.getElements(item.type)}</span>`;
            });
            html += '</div>';
        }
        
        html += '</div></div>';
        
        container.innerHTML = html;
    },

    /**
     * 渲染社交风格板块
     */
    renderSocialStyleSection: function(mbtiType) {
        const container = document.getElementById('social-style-section');
        if (!container || !mbtiType || !this.mbtiMapping) return;
        
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping || !mapping.social_style) return;
        
        const social = mapping.social_style;
        let html = '';
        
        // 社交风格概述卡片
        if (social.summary || social.communication_style) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">社交风格</h2>';
            html += '<table><tbody>';
            if (social.summary) {
                let summaryText = TermRenderer.render(social.summary);
                if (social.communication_style) {
                    summaryText += ' 您的沟通风格：' + TermRenderer.render(social.communication_style) + '。';
                }
                html += '<tr><td colspan="2" class="obc-tmpl__rich-text">' + summaryText + '</td></tr>';
            }
            html += '</tbody></table></div>';
        }
        
        // 社交优势与成长空间卡片
        if (social.strengths && social.strengths.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">优势与成长</h2>';
            html += '<table><thead><tr><th class="wiki-h3">社交优势</th><th class="wiki-h3">成长空间</th></tr></thead><tbody>';
            const maxLen = Math.max(
                social.strengths?.length || 0,
                social.challenges?.length || 0
            );
            for (let i = 0; i < maxLen; i++) {
                const strength = social.strengths?.[i] || '';
                const challenge = social.challenges?.[i] || '';
                html += '<tr>';
                html += '<td>' + (strength ? TermRenderer.render(strength) : '-') + '</td>';
                html += '<td>' + (challenge ? TermRenderer.render(challenge) : '-') + '</td>';
                html += '</tr>';
            }
            html += '</tbody></table></div>';
        }
        
        // 与不同类型相处 + 社交建议 并排显示
        if ((social.interaction_with_types) || (social.social_advice && social.social_advice.length > 0)) {
            html += '<div class="obc-tmpl-row">';
            
            // 与不同类型相处
            if (social.interaction_with_types) {
                const typeLabels = {
                    'NT': '岩雷型',
                    'SP': '火原型',
                    'NF': '岩草型',
                    'SJ': '火冰型'
                };
                
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">与不同类型相处</h2>';
                html += '<table><tbody>';
                
                for (const [typeKey, advice] of Object.entries(social.interaction_with_types)) {
                    const typeName = typeLabels[typeKey] || typeKey;
                    html += '<tr>';
                    html += '<td class="wiki-h3">' + typeName + '</td>';
                    html += '<td>' + TermRenderer.render(advice) + '</td>';
                    html += '</tr>';
                }
                html += '</tbody></table></div>';
            }
            
            // 社交建议
            if (social.social_advice && social.social_advice.length > 0) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">社交建议</h2>';
                html += '<table><tbody>';
                html += '<tr><td colspan="2" class="obc-tmpl__list">';
                social.social_advice.forEach((item) => {
                    html += '<p>' + TermRenderer.render(item) + '</p>';
                });
                html += '</td></tr>';
                html += '</tbody></table></div>';
            }
            
            html += '</div>';
        }
        
        container.innerHTML = html;
    },

    /**
     * 渲染家庭风格板块
     */
    renderFamilySection: function(mbtiType) {
        const container = document.getElementById('family-section');
        if (!container || !mbtiType || !this.mbtiMapping) return;
        
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping || !mapping.family_style) return;
        
        const family = mapping.family_style;
        let html = '';
        
        // 家庭风格概述
        if (family.summary) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">家庭风格</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__rich-text">' + TermRenderer.render(family.summary) + '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        // 优势与挑战
        if (family.strengths && family.strengths.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">优势与挑战</h2>';
            html += '<table><thead><tr><th class="wiki-h3">优势</th><th class="wiki-h3">挑战</th></tr></thead><tbody>';
            const maxLen = Math.max(
                family.strengths?.length || 0,
                family.challenges?.length || 0
            );
            for (let i = 0; i < maxLen; i++) {
                const strength = family.strengths?.[i] || '';
                const challenge = family.challenges?.[i] || '';
                html += '<tr>';
                html += '<td>' + (strength ? TermRenderer.render(strength) : '-') + '</td>';
                html += '<td>' + (challenge ? TermRenderer.render(challenge) : '-') + '</td>';
                html += '</tr>';
            }
            html += '</tbody></table></div>';
        }
        
        // 家庭角色（子女、父母）
        if (family.role_as_child || family.role_as_parent) {
            html += '<div class="obc-tmpl-row">';
            
            // 作为子女
            if (family.role_as_child) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">作为子女</h2>';
                html += '<table><tbody>';
                if (family.role_as_child.characteristics && family.role_as_child.characteristics.length > 0) {
                    html += '<tr>';
                    html += '<td class="wiki-h3">您的特点</td>';
                    html += '<td class="obc-tmpl__tags">';
                    family.role_as_child.characteristics.forEach((char) => {
                        html += '<span class="wiki-tag">' + TermRenderer.render(char) + '</span>';
                    });
                    html += '</td>';
                    html += '</tr>';
                }
                if (family.role_as_child.description) {
                    html += '<tr><td class="wiki-h3">角色表现</td><td class="obc-tmpl__rich-text">' + TermRenderer.render(family.role_as_child.description) + '</td></tr>';
                }
                html += '</tbody></table></div>';
            }
            
            // 作为父母
            if (family.role_as_parent) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">作为父母</h2>';
                html += '<table><tbody>';
                if (family.role_as_parent.characteristics && family.role_as_parent.characteristics.length > 0) {
                    html += '<tr>';
                    html += '<td class="wiki-h3">您的特点</td>';
                    html += '<td class="obc-tmpl__tags">';
                    family.role_as_parent.characteristics.forEach((char) => {
                        html += '<span class="wiki-tag">' + TermRenderer.render(char) + '</span>';
                    });
                    html += '</td>';
                    html += '</tr>';
                }
                if (family.role_as_parent.description) {
                    let descText = TermRenderer.render(family.role_as_parent.description);
                    if (family.role_as_parent.parenting_style) {
                        descText = '在育儿方面，您倾向于' + TermRenderer.render(family.role_as_parent.parenting_style) + '的方式。' + descText;
                    }
                    html += '<tr><td class="wiki-h3">角色表现</td><td class="obc-tmpl__rich-text">' + descText + '</td></tr>';
                }
                html += '</tbody></table></div>';
            }
            
            html += '</div>';
        }
        
        // 家庭关系建议
        if (family.relationship_advice && family.relationship_advice.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">家庭关系建议</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__list">';
            family.relationship_advice.forEach((advice) => {
                html += '<p>' + TermRenderer.render(advice) + '</p>';
            });
            html += '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        container.innerHTML = html;
    },

    /**
     * 渲染个人成长板块
     */
    renderPersonalGrowthSection: function(mbtiType) {
        const container = document.getElementById('personal-growth-section');
        if (!container || !mbtiType || !this.mbtiMapping) return;
        
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping || !mapping.personal_growth) return;
        
        const growth = mapping.personal_growth;
        let html = '';
        
        // 个人成长概述
        if (growth.summary) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">成长路径</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__rich-text">' + TermRenderer.render(growth.summary) + '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        // 学习风格
        if (growth.learning_style) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">学习风格</h2>';
            html += '<table><tbody>';
            if (growth.learning_style.summary) {
                html += '<tr><td class="wiki-h3">性格简介</td><td class="obc-tmpl__rich-text">' + TermRenderer.render(growth.learning_style.summary) + '</td></tr>';
            }
            if (growth.learning_style.style) {
                html += '<tr><td class="wiki-h3">学习类型</td><td>' + TermRenderer.render(growth.learning_style.style) + '</td></tr>';
            }
            if (growth.learning_style.preferred_methods && growth.learning_style.preferred_methods.length > 0) {
                html += '<tr><td class="wiki-h3">偏好方法</td><td class="obc-tmpl__tags">';
                growth.learning_style.preferred_methods.forEach(method => {
                    html += '<span class="wiki-tag">' + TermRenderer.render(method) + '</span>';
                });
                html += '</td></tr>';
            }
            if (growth.learning_style.strengths && growth.learning_style.strengths.length > 0) {
                html += '<tr><td class="wiki-h3">学习优势</td><td class="obc-tmpl__list">';
                growth.learning_style.strengths.forEach(strength => {
                    html += '<p>' + TermRenderer.render(strength) + '</p>';
                });
                html += '</td></tr>';
            }
            if (growth.learning_style.challenges && growth.learning_style.challenges.length > 0) {
                html += '<tr><td class="wiki-h3">学习挑战</td><td class="obc-tmpl__list">';
                growth.learning_style.challenges.forEach(challenge => {
                    html += '<p>' + TermRenderer.render(challenge) + '</p>';
                });
                html += '</td></tr>';
            }
            if (growth.learning_style.study_tips && growth.learning_style.study_tips.length > 0) {
                html += '<tr><td class="wiki-h3">学习建议</td><td class="obc-tmpl__list">';
                growth.learning_style.study_tips.forEach(tip => {
                    html += '<p>' + TermRenderer.render(tip) + '</p>';
                });
                html += '</td></tr>';
            }
            html += '</tbody></table></div>';
        }
        
        // 时间管理
        if (growth.time_management) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">时间管理</h2>';
            html += '<table><tbody>';
            if (growth.time_management.style) {
                html += '<tr><td class="wiki-h3">管理风格</td><td>' + TermRenderer.render(growth.time_management.style) + '</td></tr>';
            }
            if (growth.time_management.description) {
                html += '<tr><td class="wiki-h3">性格简介</td><td class="obc-tmpl__rich-text">' + TermRenderer.render(growth.time_management.description) + '</td></tr>';
            }
            if (growth.time_management.strengths && growth.time_management.strengths.length > 0) {
                html += '<tr><td class="wiki-h3">管理优势</td><td class="obc-tmpl__list">';
                growth.time_management.strengths.forEach(strength => {
                    html += '<p>' + TermRenderer.render(strength) + '</p>';
                });
                html += '</td></tr>';
            }
            if (growth.time_management.challenges && growth.time_management.challenges.length > 0) {
                html += '<tr><td class="wiki-h3">管理挑战</td><td class="obc-tmpl__list">';
                growth.time_management.challenges.forEach(challenge => {
                    html += '<p>' + TermRenderer.render(challenge) + '</p>';
                });
                html += '</td></tr>';
            }
            if (growth.time_management.tips && growth.time_management.tips.length > 0) {
                html += '<tr><td class="wiki-h3">管理建议</td><td class="obc-tmpl__list">';
                growth.time_management.tips.forEach(tip => {
                    html += '<p>' + TermRenderer.render(tip) + '</p>';
                });
                html += '</td></tr>';
            }
            html += '</tbody></table></div>';
        }
        
        // 创造力
        if (growth.creativity) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">创造力</h2>';
            html += '<table><tbody>';
            if (growth.creativity.style) {
                html += '<tr><td class="wiki-h3">创造风格</td><td>' + TermRenderer.render(growth.creativity.style) + '</td></tr>';
            }
            if (growth.creativity.description) {
                html += '<tr><td class="wiki-h3">性格简介</td><td class="obc-tmpl__rich-text">' + TermRenderer.render(growth.creativity.description) + '</td></tr>';
            }
            if (growth.creativity.strengths && growth.creativity.strengths.length > 0) {
                html += '<tr><td class="wiki-h3">创造优势</td><td class="obc-tmpl__list">';
                growth.creativity.strengths.forEach(strength => {
                    html += '<p>' + TermRenderer.render(strength) + '</p>';
                });
                html += '</td></tr>';
            }
            if (growth.creativity.challenges && growth.creativity.challenges.length > 0) {
                html += '<tr><td class="wiki-h3">创造挑战</td><td class="obc-tmpl__list">';
                growth.creativity.challenges.forEach(challenge => {
                    html += '<p>' + TermRenderer.render(challenge) + '</p>';
                });
                html += '</td></tr>';
            }
            if (growth.creativity.tips && growth.creativity.tips.length > 0) {
                html += '<tr><td class="wiki-h3">创造建议</td><td class="obc-tmpl__list">';
                growth.creativity.tips.forEach(tip => {
                    html += '<p>' + TermRenderer.render(tip) + '</p>';
                });
                html += '</td></tr>';
            }
            html += '</tbody></table></div>';
        }
        
        // 决策风格
        if (growth.decision_making) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">决策风格</h2>';
            html += '<table><tbody>';
            if (growth.decision_making.style) {
                html += '<tr><td class="wiki-h3">决策风格</td><td>' + TermRenderer.render(growth.decision_making.style) + '</td></tr>';
            }
            if (growth.decision_making.description) {
                html += '<tr><td class="wiki-h3">性格简介</td><td class="obc-tmpl__rich-text">' + TermRenderer.render(growth.decision_making.description) + '</td></tr>';
            }
            if (growth.decision_making.strengths && growth.decision_making.strengths.length > 0) {
                html += '<tr><td class="wiki-h3">决策优势</td><td class="obc-tmpl__list">';
                growth.decision_making.strengths.forEach(strength => {
                    html += '<p>' + TermRenderer.render(strength) + '</p>';
                });
                html += '</td></tr>';
            }
            if (growth.decision_making.challenges && growth.decision_making.challenges.length > 0) {
                html += '<tr><td class="wiki-h3">决策挑战</td><td class="obc-tmpl__list">';
                growth.decision_making.challenges.forEach(challenge => {
                    html += '<p>' + TermRenderer.render(challenge) + '</p>';
                });
                html += '</td></tr>';
            }
            if (growth.decision_making.tips && growth.decision_making.tips.length > 0) {
                html += '<tr><td class="wiki-h3">决策建议</td><td class="obc-tmpl__list">';
                growth.decision_making.tips.forEach(tip => {
                    html += '<p>' + TermRenderer.render(tip) + '</p>';
                });
                html += '</td></tr>';
            }
            html += '</tbody></table></div>';
        }
        
        container.innerHTML = html;
    },

    /**
     * 渲染气质类型信息（显示角色命之座和气质类型名称）
     */
    renderTemperamentInfo: function(mbtiType) {
        const container = document.getElementById('character-match');
        if (!container || !mbtiType || !this.elementTemperamentMapping) return;
        
        const temperamentCode = this.elementTemperamentMapping.type_mapping[mbtiType];
        if (!temperamentCode) return;
        
        const temperamentInfo = this.elementTemperamentMapping.temperaments[temperamentCode];
        if (!temperamentInfo) return;
        
        // 获取当前匹配的角色命之座（与简介卡片相同的方式）
        let constellationName = '未知';
        if (this.charactersData) {
            const gender = GenshinMBTI?.state?.gender || 'female';
            const mapping = this.mbtiMapping ? this.mbtiMapping[mbtiType] : null;
            if (mapping) {
                const characterId = mapping[`primary_${gender}`] || mapping.primary_male || mapping.primary_female;
                if (characterId && this.charactersData[characterId]) {
                    constellationName = this.charactersData[characterId].constellation || '未知';
                }
            }
        }
        
        // 获取气质类型名称（去掉"本命"后缀，显示为"岩草型"等）
        let temperamentName = temperamentInfo.name || '';
        if (temperamentName.endsWith('本命')) {
            temperamentName = temperamentName.slice(0, -2) + '型';
        }
        
        let html = '<div class="obc-tmpl-part">';
        html += '<h2 class="wiki-h2">命之座</h2>';
        html += '<table><tbody>';
        html += '<tr>';
        html += '<td class="wiki-h3">命之座</td>';
        html += `<td><span class="temperament-badge-inline">${constellationName}</span></td>`;
        html += '</tr>';
        html += '<tr>';
        html += '<td class="wiki-h3">气质类型</td>';
        html += `<td><span class="temperament-badge-inline">${temperamentName}</span></td>`;
        html += '</tr>';
        html += '<tr>';
        html += '<td class="wiki-h3">气质描述</td>';
        html += `<td>${temperamentInfo.description}</td>`;
        html += '</tr>';
        html += '</tbody></table></div>';
        
        container.innerHTML = html;
    },

    /**
     * 获取元素名称
     */
    getElementName: function(element) {
        const names = {
            'anemo': '风', 'hydro': '水', 'pyro': '火', 'geo': '岩',
            'electro': '雷', 'dendro': '草', 'cryo': '冰', 'physical': '原'
        };
        return names[element] || element;
    },
    
    /**
     * 从API数据渲染典型角色板块
     * 
     * @param {Array} characterExamples - 角色列表
     */
    renderCharacterExamplesFromData: function(characterExamples) {
        const container = document.getElementById('character-examples-section');
        if (!container || !characterExamples || characterExamples.length === 0) return;
        
        const elementColors = TermRenderer.getNameToCodeMap();
        
        let html = '<div class="character-examples-card">';
        
        characterExamples.forEach(char => {
            let element = char.vision_cn || '';
            element = element.replace('元素', '');
            const elementClass = elementColors[element] || '';
            
            let rarity = char.rarity || '未知';
            if (rarity.includes('5')) {
                rarity = '⭐⭐⭐⭐⭐';
            } else if (rarity.includes('4')) {
                rarity = '⭐⭐⭐⭐';
            }
            
            html += `
                <div class="character-example-row">
                    <div class="character-example-avatar">
                        <img src="${char.assets?.avatar || ''}" alt="${char.name}" onerror="this.src='assets/images/logo.png'">
                    </div>
                    <div class="character-example-content">
                        <div class="character-example-header">
                            <span class="character-example-name">${char.name}</span>
                            <span class="character-example-element element-${elementClass}">${element}</span>
                        </div>
                        <div class="character-example-stars">${rarity}</div>
                        <div class="character-example-intro">${char.description || ''}</div>
                        <div class="character-example-basic">
                            <span class="basic-item"><b>地区</b> ${char.region || '未知'}</span>
                            <span class="basic-item"><b>势力</b> ${char.affiliation || '未知'}</span>
                            <span class="basic-item"><b>武器</b> ${char.weapon_type || '未知'}</span>
                            <span class="basic-item"><b>生日</b> ${char.birthday || '未知'}</span>
                            <span class="basic-item"><b>命座</b> ${char.constellation || '未知'}</span>
                            <span class="basic-item"><b>称号</b> ${char.title || '未知'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    /**
     * 从API数据渲染职业发展板块
     * 
     * @param {Object} careerInfo - 职业发展信息
     */
    renderCareerFromData: function(careerInfo) {
        const container = document.getElementById('career-section');
        if (!container || !careerInfo) return;
        
        let html = '';
        
        if (careerInfo.summary) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">职业概览</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__rich-text">' + TermRenderer.render(careerInfo.summary) + '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        if ((careerInfo.strengths || careerInfo.weaknesses) || (careerInfo.leadership_style || careerInfo.team_role)) {
            html += '<div class="obc-tmpl-row">';
            
            if (careerInfo.strengths || careerInfo.weaknesses) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">优势与劣势</h2>';
                html += '<table><thead><tr><th class="wiki-h3">优势</th><th class="wiki-h3">劣势</th></tr></thead><tbody>';
                const maxLen = Math.max(
                    careerInfo.strengths?.length || 0,
                    careerInfo.weaknesses?.length || 0
                );
                for (let i = 0; i < maxLen; i++) {
                    const strength = careerInfo.strengths?.[i] || '';
                    const weakness = careerInfo.weaknesses?.[i] || '';
                    html += '<tr>';
                    html += '<td>' + (strength ? TermRenderer.render(strength) : '-') + '</td>';
                    html += '<td>' + (weakness ? TermRenderer.render(weakness) : '-') + '</td>';
                    html += '</tr>';
                }
                html += '</tbody></table></div>';
            }
            
            if (careerInfo.leadership_style || careerInfo.team_role) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">工作风格</h2>';
                html += '<table><thead><tr>';
                html += '<th class="wiki-h3">领导风格</th>';
                html += '<th class="wiki-h3">团队角色</th>';
                html += '</tr></thead><tbody><tr>';
                if (careerInfo.leadership_style) {
                    html += '<td>';
                    html += '<p><strong>' + TermRenderer.render(careerInfo.leadership_style.type) + '</strong></p>';
                    html += '<p>' + TermRenderer.render(careerInfo.leadership_style.description) + '</p>';
                    html += '</td>';
                } else {
                    html += '<td>-</td>';
                }
                if (careerInfo.team_role) {
                    html += '<td>';
                    html += '<p><strong>' + TermRenderer.render(careerInfo.team_role.type) + '</strong></p>';
                    html += '<p>' + TermRenderer.render(careerInfo.team_role.description) + '</p>';
                    html += '</td>';
                } else {
                    html += '<td>-</td>';
                }
                html += '</tr></tbody></table></div>';
            }
            
            html += '</div>';
        }
        
        if (careerInfo.suitable_fields && careerInfo.suitable_fields.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">适合领域</h2>';
            html += '<table class="suitable-fields-table"><tbody>';
            careerInfo.suitable_fields.forEach(field => {
                html += '<tr>';
                html += '<td class="wiki-h3">' + TermRenderer.render(field.category) + '</td>';
                if (field.positions && field.positions.length > 0) {
                    html += '<td class="obc-tmpl__tags">';
                    field.positions.forEach(position => {
                        html += '<span class="wiki-tag">' + TermRenderer.render(position) + '</span>';
                    });
                    html += '</td>';
                } else {
                    html += '<td>-</td>';
                }
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }
        
        if (careerInfo.career_advice && careerInfo.career_advice.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">职业发展建议</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__list">';
            careerInfo.career_advice.forEach((advice) => {
                html += '<p><strong>' + TermRenderer.render(advice.advice) + '</strong>：' + TermRenderer.render(advice.reason) + '</p>';
            });
            html += '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        html += '<div class="career-disclaimer">本模块基于2022年版《中华人民共和国职业分类大典》编制，采用中类分类、小类命名的泛化方式，旨在提供方向性参考。职业生态瞬息万变，新兴职业不断涌现，具体岗位分工、职级发展等详细信息，还需结合当下实际情况自行调研。职业选择是复杂的动态过程，本测试仅作参考，实践请以现实为准。</div>';
        
        container.innerHTML = html;
    },
    
    /**
     * 从API数据渲染社交风格板块
     * 
     * @param {Object} socialStyle - 社交风格信息
     */
    renderSocialStyleFromData: function(socialStyle) {
        const container = document.getElementById('social-style-section');
        if (!container || !socialStyle) return;
        
        let html = '';
        
        if (socialStyle.summary || socialStyle.communication_style) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">社交风格</h2>';
            html += '<table><tbody>';
            if (socialStyle.summary) {
                let summaryText = TermRenderer.render(socialStyle.summary);
                if (socialStyle.communication_style) {
                    summaryText += ' 您的沟通风格：' + TermRenderer.render(socialStyle.communication_style) + '。';
                }
                html += '<tr><td colspan="2" class="obc-tmpl__rich-text">' + summaryText + '</td></tr>';
            }
            html += '</tbody></table></div>';
        }
        
        if (socialStyle.strengths && socialStyle.strengths.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">优势与成长</h2>';
            html += '<table><thead><tr><th class="wiki-h3">社交优势</th><th class="wiki-h3">成长空间</th></tr></thead><tbody>';
            const maxLen = Math.max(
                socialStyle.strengths?.length || 0,
                socialStyle.challenges?.length || 0
            );
            for (let i = 0; i < maxLen; i++) {
                const strength = socialStyle.strengths?.[i] || '';
                const challenge = socialStyle.challenges?.[i] || '';
                html += '<tr>';
                html += '<td>' + (strength ? TermRenderer.render(strength) : '-') + '</td>';
                html += '<td>' + (challenge ? TermRenderer.render(challenge) : '-') + '</td>';
                html += '</tr>';
            }
            html += '</tbody></table></div>';
        }
        
        if ((socialStyle.interaction_with_types) || (socialStyle.social_advice && socialStyle.social_advice.length > 0)) {
            html += '<div class="obc-tmpl-row">';
            
            if (socialStyle.interaction_with_types) {
                const typeLabels = {
                    'NT': '岩雷型',
                    'SP': '火原型',
                    'NF': '岩草型',
                    'SJ': '火冰型'
                };
                
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">与不同类型相处</h2>';
                html += '<table><tbody>';
                
                for (const [typeKey, advice] of Object.entries(socialStyle.interaction_with_types)) {
                    const typeName = typeLabels[typeKey] || typeKey;
                    html += '<tr>';
                    html += '<td class="wiki-h3">' + typeName + '</td>';
                    html += '<td>' + TermRenderer.render(advice) + '</td>';
                    html += '</tr>';
                }
                html += '</tbody></table></div>';
            }
            
            if (socialStyle.social_advice && socialStyle.social_advice.length > 0) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">社交建议</h2>';
                html += '<table><tbody>';
                html += '<tr><td colspan="2" class="obc-tmpl__list">';
                socialStyle.social_advice.forEach((item) => {
                    html += '<p>' + TermRenderer.render(item) + '</p>';
                });
                html += '</td></tr>';
                html += '</tbody></table></div>';
            }
            
            html += '</div>';
        }
        
        container.innerHTML = html;
    },
    
    /**
     * 从API数据渲染家庭风格板块
     * 
     * @param {Object} familyStyle - 家庭风格信息
     */
    renderFamilyFromData: function(familyStyle) {
        const container = document.getElementById('family-section');
        if (!container || !familyStyle) return;
        
        let html = '';
        
        if (familyStyle.summary) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">家庭风格</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__rich-text">' + TermRenderer.render(familyStyle.summary) + '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        if (familyStyle.strengths && familyStyle.strengths.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">优势与挑战</h2>';
            html += '<table><thead><tr><th class="wiki-h3">优势</th><th class="wiki-h3">挑战</th></tr></thead><tbody>';
            const maxLen = Math.max(
                familyStyle.strengths?.length || 0,
                familyStyle.challenges?.length || 0
            );
            for (let i = 0; i < maxLen; i++) {
                const strength = familyStyle.strengths?.[i] || '';
                const challenge = familyStyle.challenges?.[i] || '';
                html += '<tr>';
                html += '<td>' + (strength ? TermRenderer.render(strength) : '-') + '</td>';
                html += '<td>' + (challenge ? TermRenderer.render(challenge) : '-') + '</td>';
                html += '</tr>';
            }
            html += '</tbody></table></div>';
        }
        
        if (familyStyle.role_as_child || familyStyle.role_as_parent) {
            html += '<div class="obc-tmpl-row">';
            
            if (familyStyle.role_as_child) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">作为子女</h2>';
                html += '<table><tbody>';
                if (familyStyle.role_as_child.characteristics && familyStyle.role_as_child.characteristics.length > 0) {
                    html += '<tr>';
                    html += '<td class="wiki-h3">您的特点</td>';
                    html += '<td class="obc-tmpl__tags">';
                    familyStyle.role_as_child.characteristics.forEach((char) => {
                        html += '<span class="wiki-tag">' + TermRenderer.render(char) + '</span>';
                    });
                    html += '</td>';
                    html += '</tr>';
                }
                if (familyStyle.role_as_child.description) {
                    html += '<tr><td class="wiki-h3">角色表现</td><td class="obc-tmpl__rich-text">' + TermRenderer.render(familyStyle.role_as_child.description) + '</td></tr>';
                }
                html += '</tbody></table></div>';
            }
            
            if (familyStyle.role_as_parent) {
                html += '<div class="obc-tmpl-part obc-tmpl-half">';
                html += '<h2 class="wiki-h2">作为父母</h2>';
                html += '<table><tbody>';
                if (familyStyle.role_as_parent.characteristics && familyStyle.role_as_parent.characteristics.length > 0) {
                    html += '<tr>';
                    html += '<td class="wiki-h3">您的特点</td>';
                    html += '<td class="obc-tmpl__tags">';
                    familyStyle.role_as_parent.characteristics.forEach((char) => {
                        html += '<span class="wiki-tag">' + TermRenderer.render(char) + '</span>';
                    });
                    html += '</td>';
                    html += '</tr>';
                }
                if (familyStyle.role_as_parent.description) {
                    let descText = TermRenderer.render(familyStyle.role_as_parent.description);
                    if (familyStyle.role_as_parent.parenting_style) {
                        descText = '在育儿方面，您倾向于' + TermRenderer.render(familyStyle.role_as_parent.parenting_style) + '的方式。' + descText;
                    }
                    html += '<tr><td class="wiki-h3">角色表现</td><td class="obc-tmpl__rich-text">' + descText + '</td></tr>';
                }
                html += '</tbody></table></div>';
            }
            
            html += '</div>';
        }
        
        if (familyStyle.relationship_advice && familyStyle.relationship_advice.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">家庭关系建议</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__list">';
            familyStyle.relationship_advice.forEach((advice) => {
                html += '<p>' + TermRenderer.render(advice) + '</p>';
            });
            html += '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        container.innerHTML = html;
    },
    
    /**
     * 从API数据渲染个人成长板块
     * 
     * @param {Object} personalGrowth - 个人成长信息
     */
    renderPersonalGrowthFromData: function(personalGrowth) {
        const container = document.getElementById('personal-growth-section');
        if (!container || !personalGrowth) return;
        
        let html = '';
        
        if (personalGrowth.summary) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">成长路径</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__rich-text">' + TermRenderer.render(personalGrowth.summary) + '</td></tr>';
            html += '</tbody></table></div>';
        }
        
        const renderGrowthSection = (title, data) => {
            if (!data) return '';
            let sectionHtml = '<div class="obc-tmpl-part">';
            sectionHtml += '<h2 class="wiki-h2">' + title + '</h2>';
            sectionHtml += '<table><tbody>';
            if (data.summary) {
                sectionHtml += '<tr><td class="wiki-h3">性格简介</td><td class="obc-tmpl__rich-text">' + TermRenderer.render(data.summary) + '</td></tr>';
            }
            if (data.style) {
                sectionHtml += '<tr><td class="wiki-h3">' + title.replace('风格', '类型') + '</td><td>' + TermRenderer.render(data.style) + '</td></tr>';
            }
            if (data.preferred_methods && data.preferred_methods.length > 0) {
                sectionHtml += '<tr><td class="wiki-h3">偏好方法</td><td class="obc-tmpl__tags">';
                data.preferred_methods.forEach(method => {
                    sectionHtml += '<span class="wiki-tag">' + TermRenderer.render(method) + '</span>';
                });
                sectionHtml += '</td></tr>';
            }
            if (data.strengths && data.strengths.length > 0) {
                sectionHtml += '<tr><td class="wiki-h3">' + title.slice(0, 2) + '优势</td><td class="obc-tmpl__list">';
                data.strengths.forEach(strength => {
                    sectionHtml += '<p>' + TermRenderer.render(strength) + '</p>';
                });
                sectionHtml += '</td></tr>';
            }
            if (data.challenges && data.challenges.length > 0) {
                sectionHtml += '<tr><td class="wiki-h3">' + title.slice(0, 2) + '挑战</td><td class="obc-tmpl__list">';
                data.challenges.forEach(challenge => {
                    sectionHtml += '<p>' + TermRenderer.render(challenge) + '</p>';
                });
                sectionHtml += '</td></tr>';
            }
            if (data.tips && data.tips.length > 0) {
                sectionHtml += '<tr><td class="wiki-h3">' + title.slice(0, 2) + '建议</td><td class="obc-tmpl__list">';
                data.tips.forEach(tip => {
                    sectionHtml += '<p>' + TermRenderer.render(tip) + '</p>';
                });
                sectionHtml += '</td></tr>';
            }
            if (data.study_tips && data.study_tips.length > 0) {
                sectionHtml += '<tr><td class="wiki-h3">学习建议</td><td class="obc-tmpl__list">';
                data.study_tips.forEach(tip => {
                    sectionHtml += '<p>' + TermRenderer.render(tip) + '</p>';
                });
                sectionHtml += '</td></tr>';
            }
            sectionHtml += '</tbody></table></div>';
            return sectionHtml;
        };
        
        html += renderGrowthSection('学习风格', personalGrowth.learning_style);
        html += renderGrowthSection('时间管理', personalGrowth.time_management);
        html += renderGrowthSection('创造力', personalGrowth.creativity);
        html += renderGrowthSection('决策风格', personalGrowth.decision_making);
        
        container.innerHTML = html;
    },
    
    /**
     * 从API数据渲染婚恋指南板块
     * 
     * @param {Array} compatibilityPairs - 配对数据
     * @param {string} currentType - 当前MBTI类型
     */
    renderRelationshipFromData: async function(compatibilityPairs, currentType) {
        const container = document.getElementById('relationship-section');
        if (!container || !compatibilityPairs || compatibilityPairs.length === 0) {
            if (container) {
                container.innerHTML = '<div class="no-compatibility-data">暂无配对数据</div>';
            }
            return;
        }
        
        const groupedPairs = this.groupByLevel(compatibilityPairs);
        this.renderCompatibilitySelector(container, currentType, groupedPairs);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultRenderer;
}
