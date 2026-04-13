// 版本号: v1.0.0
/**
 * 智能人格解析模块
 * 
 * 功能: 处理大模型分析模式的答题交互
 */

const AIAnalysis = {
    questions: [],
    answers: {},
    gender: null,
    isLoading: false,
    selectedModel: null,
    availableModels: [],
    initialized: false,
    testMode: 'quick', // 'quick' = 5/10道题快速测试, 'precise' = 25道题完整测试
    skippedQuestions: [], // 记录用户抛弃的题目
    questionCount: 10, // 默认题目数量
    debounceTimers: {}, // 防抖动计时器，按题目索引存储
    DEBOUNCE_DELAY: 1500, // 防抖动延迟时间（毫秒）

    /**
     * 直接开始测试（从欢迎界面按钮直接进入）
     * 
     * @param {string} gender - 性别 ('male' 或 'female')
     */
    startTest: function (gender) {
        this.gender = gender;
        UI.showPage('ai-analysis');
        this.init();
    },

    /**
     * 获取当前模式的题目数量
     * 
     * @returns {number} 题目数量
     */
    getQuestionCount: function () {
        // 如果已经设置了 questionCount，直接返回
        if (this.questionCount) {
            return this.questionCount;
        }
        // 否则根据 testMode 返回默认值
        return this.testMode === 'precise' ? 25 : 10;
    },

    /**
     * 初始化页面
     */
    init: async function () {
        console.log('========== [AI分析] 初始化开始 ==========');
        console.log('[AI分析] initialized状态:', this.initialized);

        if (this.initialized) return;

        // 从 localStorage 获取性别（进入前已经选择过了）
        if (!this.gender) {
            this.gender = this.getGenderFromStorage();
        }
        console.log('[AI分析] 性别:', this.gender);

        this.answers = {};
        this.questions = [];

        // 加载模型和题目
        console.log('[AI分析] 开始加载模型和题目...');
        await Promise.all([
            this.loadModels(),
            this.loadQuestions()
        ]);

        this.bindEvents();
        this.initialized = true;
        console.log('========== [AI分析] 初始化完成 ==========');
    },

    /**
     * 恢复保存的进度
     * 
     * @param {Object} progress - 进度数据
     */
    resumeProgress: async function (progress) {
        console.log('[AI分析] 恢复进度:', progress);

        this.questions = progress.questions || [];
        this.answers = progress.answers || {};
        this.gender = progress.gender || this.gender;
        this.skippedQuestions = progress.skippedQuestions || [];

        // 加载模型列表
        await this.loadModels();

        // 设置选择的模型
        if (progress.provider && progress.model) {
            this.selectedModel = {
                provider: progress.provider,
                model: progress.model
            };
        }

        // 渲染题目
        this.renderQuestions();

        // 恢复答案（只更新UI状态，不触发保存）
        for (const index in this.answers) {
            const textarea = document.getElementById(`ai-answer-${index}`);
            if (textarea) {
                textarea.value = this.answers[index];
                const statusEl = document.getElementById(`ai-status-${index}`);
                if (statusEl) {
                    statusEl.textContent = '已填写';
                    statusEl.classList.add('completed');
                }
            }
        }

        this.updateProgress();
        console.log('[AI分析] 进度恢复完成');
    },

    /**
     * 清除保存的进度
     */
    clearProgress: async function () {
        localStorage.removeItem('ai_analysis_progress');

        this.answers = {};
        this.questions = [];
        this.skippedQuestions = [];
    },

    /**
     * 开始新测试
     */
    startNewTest: async function () {
        console.log('[AI分析] 开始新测试...');

        await Promise.all([
            this.loadModels(),
            this.loadQuestions()
        ]);
    },

    /**
     * 保存当前进度
     */
    saveProgress: async function () {
        const progressData = {
            questions: this.questions,
            answers: this.answers,
            gender: this.gender,
            provider: this.selectedModel ? this.selectedModel.provider : 'glm',
            model: this.selectedModel ? this.selectedModel.model : 'glm-4-flash',
            skippedQuestions: this.skippedQuestions,
            savedAt: new Date().toISOString()
        };

        // 保存到本地存储
        localStorage.setItem('ai_analysis_progress', JSON.stringify(progressData));
        console.log('[AI分析] 进度已保存到 localStorage');
    },

    /**
     * 重置状态
     */
    reset: function () {
        this.questions = [];
        this.answers = {};
        this.initialized = false;
    },

    /**
     * 从本地存储获取性别
     * 
     * @returns {string|null} 性别
     */
    getGenderFromStorage: function () {
        const savedProgress = localStorage.getItem('genshin_mbti_progress');
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                return progress.gender || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    /**
     * 加载可用模型列表
     */
    loadModels: async function () {
        console.log('[AI分析] 开始加载模型列表...');
        try {
            const response = await fetch('/api/ai-models');
            const data = await response.json();

            console.log('[AI分析] 模型列表响应:', JSON.stringify(data, null, 2));

            if (data.success) {
                this.availableModels = data.data.models;
                this.selectedModel = data.data.defaultModel;
                console.log('[AI分析] 可用模型:', this.availableModels);
                console.log('[AI分析] 默认模型:', this.selectedModel);
                this.renderModelSelector();
            }
        } catch (error) {
            console.error('[AI分析] 加载模型列表失败:', error);
        }
    },

    /**
     * 渲染模型选择器
     */
    renderModelSelector: function () {
        const select = document.getElementById('aiModelSelect');
        console.log('[AI分析] renderModelSelector called, select:', select, 'availableModels:', this.availableModels);
        if (!select) {
            console.log('[AI分析] select 元素不存在');
            return;
        }
        if (!this.availableModels || this.availableModels.length === 0) {
            console.log('[AI分析] availableModels 为空');
            return;
        }

        let html = '';

        this.availableModels.forEach(provider => {
            html += `<optgroup label="${provider.providerName}">`;
            provider.models.forEach(model => {
                const isDefault = this.selectedModel &&
                    this.selectedModel.provider === provider.provider &&
                    this.selectedModel.model === model.id;
                html += `<option value="${provider.provider}:${model.id}" ${isDefault ? 'selected' : ''}>
                    ${model.name}
                </option>`;
            });
            html += '</optgroup>';
        });

        select.innerHTML = html;
        console.log('[AI分析] 模型选择器渲染完成');
    },

    /**
     * 获取当前选择的模型
     * 
     * @returns {Object} { provider, model }
     */
    getSelectedModel: function () {
        const select = document.getElementById('aiModelSelect');
        if (!select || !select.value) {
            return this.selectedModel || { provider: 'glm', model: 'glm-4-flash' };
        }

        const [provider, model] = select.value.split(':');
        return { provider, model };
    },

    /**
     * 加载题目
     */
    loadQuestions: async function () {
        console.log('[AI分析] 开始加载题目...');
        try {
            this.showLoading(true, '正在加载题目...');

            const questionCount = this.getQuestionCount();
            console.log('[AI分析] 请求题目数量:', questionCount);

            const response = await fetch(`/api/ai-questions?count=${questionCount}`);
            const data = await response.json();

            console.log('[AI分析] 题目加载响应:', JSON.stringify(data, null, 2));

            if (data.success) {
                this.questions = data.data.questions;
                console.log('[AI分析] 加载的题目:', JSON.stringify(this.questions, null, 2));
                this.renderQuestions();
            } else {
                console.error('[AI分析] 加载题目失败:', data.error);
                this.showError('加载题目失败: ' + data.error);
            }
        } catch (error) {
            console.error('[AI分析] 加载题目失败:', error);
            this.showError('加载题目失败，请刷新页面重试');
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * 渲染题目列表
     */
    renderQuestions: function () {
        const container = document.getElementById('aiQuestionsContainer');
        if (!container) return;

        const totalCount = this.questions.length;
        const self = this;
        container.innerHTML = this.questions.map((q, index) => {
            const creator = q.creator || '大模型';
            return `
            <div class="ai-question-card" data-question-id="${q.id}" data-index="${index}">
                <button class="ai-replace-btn" data-index="${index}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    换题
                </button>
                
                <div class="ai-question-header">
                    <div>
                        <span class="ai-question-number">第 ${index + 1} 题 / 共 ${totalCount} 题</span>
                    </div>
                    <span class="ai-question-status" id="ai-status-${index}">未填写</span>
                </div>
                
                <div class="ai-question-scene">${this.escapeHtml(q.scene)}</div>
                
                <div class="ai-question-text">${this.escapeHtml(q.question)}</div>
                
                <div class="ai-question-hint" data-index="${index}">
                    <div class="ai-question-hint-header">
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            提示
                        </span>
                        <span class="hint-arrow">▼ 点击展开</span>
                    </div>
                    <div class="ai-question-hint-content">
                        ${this.escapeHtml(q.hint || '暂无提示')}
                    </div>
                </div>
                
                <textarea 
                    class="ai-answer-textarea" 
                    id="ai-answer-${index}"
                    data-index="${index}"
                    placeholder="请输入您的回答，字数不限..."
                ></textarea>
            </div>
        `}).join('');

        this.updateProgress();
    },

    /**
     * 切换提示展开状态
     * 
     * @param {HTMLElement} element - 提示元素
     */
    toggleHint: function (element) {
        element.classList.toggle('expanded');
        const arrow = element.querySelector('.hint-arrow');
        if (arrow) {
            arrow.textContent = element.classList.contains('expanded') ? '▲ 点击收起' : '▼ 点击展开';
        }
    },

    /**
     * 答案变化处理
     * 
     * @param {number} index - 题目索引
     * @param {boolean} immediate - 是否立即保存（blur时为true，input时为false）
     */
    onAnswerChange: function (index, immediate = false) {
        const textarea = document.getElementById(`ai-answer-${index}`);
        if (!textarea) return;

        const answer = textarea.value.trim();
        const statusEl = document.getElementById(`ai-status-${index}`);

        if (answer.length > 0) {
            this.answers[index] = answer;
            if (statusEl) {
                statusEl.textContent = '已填写';
                statusEl.classList.add('completed');
            }
        } else {
            delete this.answers[index];
            if (statusEl) {
                statusEl.textContent = '未填写';
                statusEl.classList.remove('completed');
            }
        }

        this.updateProgress();

        // 根据是否立即保存来决定保存策略
        if (immediate) {
            // blur事件：立即保存，并取消可能存在的防抖动计时器
            if (this.debounceTimers[index]) {
                clearTimeout(this.debounceTimers[index]);
                delete this.debounceTimers[index];
            }
            this.saveProgress();
            console.log(`[AI分析] 题目${index + 1} blur触发立即保存`);
        } else {
            // input事件：使用防抖动保存
            if (this.debounceTimers[index]) {
                clearTimeout(this.debounceTimers[index]);
            }
            this.debounceTimers[index] = setTimeout(() => {
                this.saveProgress();
                console.log(`[AI分析] 题目${index + 1} 防抖动保存触发`);
                delete this.debounceTimers[index];
            }, this.DEBOUNCE_DELAY);
        }
    },

    /**
     * 更新进度条
     */
    updateProgress: function () {
        const progressBar = document.getElementById('aiProgressBar');
        const submitBtn = document.getElementById('aiSubmitBtn');
        const mallmBtn = document.getElementById('aiMallmBtn');

        const filledCount = Object.keys(this.answers).length;
        const totalCount = this.questions.length || this.getQuestionCount();
        const progress = (filledCount / totalCount) * 100;

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (submitBtn) {
            submitBtn.disabled = filledCount < totalCount;
            submitBtn.textContent = filledCount < totalCount
                ? `已填写 ${filledCount}/${totalCount}`
                : '单模型分析';
        }

        // 多智能体讨论按钮的禁用状态与提交分析一致
        if (mallmBtn) {
            mallmBtn.disabled = filledCount < totalCount;
        }
    },

    /**
     * 保存进度到本地存储和服务器
     */
    saveProgress: async function () {
        const progress = {
            answers: this.answers,
            questions: this.questions,
            gender: this.gender,
            provider: this.selectedModel ? this.selectedModel.provider : 'glm',
            model: this.selectedModel ? this.selectedModel.model : 'glm-4-flash',
            skippedQuestions: this.skippedQuestions,
            timestamp: Date.now(),
            savedAt: new Date().toISOString()
        };

        // 保存到 localStorage
        localStorage.setItem('ai_analysis_progress', JSON.stringify(progress));
        console.log('[AI分析] 进度已保存到 localStorage');

        // 如果已登录，保存到服务器
        if (window.UI && window.UI.isLoggedIn) {
            this._debounceSaveToServer(progress);
        }
    },

    /**
     * 防抖保存进度到服务器
     * 
     * @param {Object} progress - 进度数据
     */
    _debounceSaveToServer: function (progress) {
        if (this._saveProgressTimer) {
            clearTimeout(this._saveProgressTimer);
        }
        this._saveProgressTimer = setTimeout(async () => {
            await this._saveToServerNow(progress);
        }, 1500);
    },

    /**
     * 立即保存进度到服务器
     * 
     * @param {Object} progress - 进度数据
     */
    _saveToServerNow: async function (progress) {
        if (!window.UI || !window.UI.isLoggedIn) {
            console.log('[AI分析] 未登录，跳过服务器保存');
            return false;
        }

        try {
            const response = await fetch('/api/user/progress/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(progress)
            });
            const data = await response.json();
            if (data.success) {
                console.log('[AI分析] 进度已保存到服务器');
                return true;
            } else {
                console.error('[AI分析] 保存到服务器失败:', data.error);
                return false;
            }
        } catch (error) {
            console.error('[AI分析] 保存到服务器网络错误:', error);
            return false;
        }
    },

    /**
     * 清除保存的进度
     */
    clearSavedProgress: async function () {
        // 清除 localStorage
        localStorage.removeItem('ai_analysis_progress');
        console.log('[AI分析] 本地进度已清除');

        // 如果已登录，清除服务器进度
        if (window.UI && window.UI.isLoggedIn) {
            try {
                await fetch('/api/user/progress/ai', {
                    method: 'DELETE'
                });
                console.log('[AI分析] 服务器进度已清除');
            } catch (error) {
                console.error('[AI分析] 清除服务器进度失败:', error);
            }
        }
    },

    /**
     * 加载进度（优先从服务器加载）
     * 
     * @returns {Promise<boolean>} 是否成功加载
     */
    loadProgress: async function () {
        // 如果已登录，优先从服务器加载
        if (window.UI && window.UI.isLoggedIn) {
            try {
                const response = await fetch('/api/user/progress/ai');
                const data = await response.json();

                if (data.success && data.hasProgress && data.data) {
                    const progress = data.data;
                    if (progress.answers && progress.questions) {
                        this.answers = progress.answers;
                        this.questions = progress.questions;
                        this.gender = progress.gender || this.gender;
                        this.skippedQuestions = progress.skippedQuestions || [];

                        // 同步到本地存储
                        localStorage.setItem('ai_analysis_progress', JSON.stringify(progress));
                        console.log('[AI分析] 从服务器加载进度成功');
                        return true;
                    }
                }
            } catch (error) {
                console.error('[AI分析] 从服务器加载进度失败:', error);
            }
        }

        // 如果服务器加载失败或未登录，尝试从本地加载
        const saved = localStorage.getItem('ai_analysis_progress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                if (progress.answers && progress.questions) {
                    this.answers = progress.answers;
                    this.questions = progress.questions;
                    return true;
                }
            } catch (e) {
                console.error('加载进度失败:', e);
            }
        }
        return false;
    },

    /**
     * 替换题目
     * 
     * @param {number} index - 要替换的题目索引
     */
    replaceQuestion: async function (index) {
        if (this.isLoading) return;

        console.log('[AI分析] 开始换题，索引:', index);

        const currentAnswer = this.answers[index];
        if (currentAnswer) {
            const confirmed = confirm('更换题目将清空当前答案，确定要更换吗？');
            if (!confirmed) {
                console.log('[AI分析] 用户取消换题');
                return;
            }
        }

        try {
            this.isLoading = true;

            const currentIds = this.questions.map(q => q.id);
            const requestBody = {
                currentQuestionIds: currentIds,
                replaceIndex: index
            };

            console.log('[AI分析] 换题请求:', JSON.stringify(requestBody, null, 2));

            const response = await fetch('/api/ai-questions/replace', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            console.log('[AI分析] 换题响应:', JSON.stringify(data, null, 2));

            if (data.success) {
                // 记录被抛弃的题目
                const skippedQuestion = {
                    ...this.questions[index],
                    skippedAt: Date.now(),
                    hadAnswer: !!this.answers[index]
                };
                this.skippedQuestions.push(skippedQuestion);
                console.log('[AI分析] 记录抛弃题目:', skippedQuestion);
                console.log('[AI分析] 当前抛弃题目列表:', this.skippedQuestions);

                this.questions[index] = data.data.question;
                delete this.answers[index];
                this.saveProgress();
                this.renderQuestions();

                this.restoreAnswers();
            } else {
                alert('换题失败: ' + data.error);
            }
        } catch (error) {
            console.error('换题失败:', error);
            alert('换题失败，请重试');
        } finally {
            this.isLoading = false;
        }
    },

    /**
     * 恢复已填写的答案
     */
    restoreAnswers: function () {
        Object.entries(this.answers).forEach(([index, answer]) => {
            const textarea = document.getElementById(`ai-answer-${index}`);
            if (textarea) {
                textarea.value = answer;
                // 只更新UI状态，不触发保存（因为数据本身就是从保存的进度中恢复的）
                const statusEl = document.getElementById(`ai-status-${index}`);
                if (statusEl) {
                    statusEl.textContent = '已填写';
                    statusEl.classList.add('completed');
                }
            }
        });
        this.updateProgress();
    },

    /**
     * 提交答案
     */
    submit: async function () {
        if (this.isLoading) return;

        const filledCount = Object.keys(this.answers).length;
        if (filledCount < 5) {
            alert('请完成所有题目后再提交');
            return;
        }

        const selectedModel = this.getSelectedModel();

        console.log('========== [AI分析] 提交开始 ==========');
        console.log('[AI分析] 选择的模型:', selectedModel);
        console.log('[AI分析] 性别:', this.gender);
        console.log('[AI分析] 测试模式:', this.testMode);
        console.log('[AI分析] 已填写题目数:', filledCount);

        try {
            this.isLoading = true;

            // 伪状态文字列表
            const progressMessages = [
                '正在连接大模型服务...',
                '正在解析您的回答...',
                '正在分析性格维度...',
                '正在匹配MBTI类型...',
                '正在计算认知功能...',
                '正在生成个性描述...',
                '正在匹配代表角色...',
                '正在分析职业倾向...',
                '正在生成成长建议...',
                '正在组装分析报告...'
            ];

            let messageIndex = 0;
            const progressEl = document.createElement('div');
            progressEl.id = 'aiProgressText';

            this.showLoading(true, `
                <div style="text-align: center; line-height: 1.8;">
                    <div style="margin-bottom: 10px;">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="20" stroke="#d3bc8e" stroke-width="2" fill="none"/>
                            <path d="M16 20 Q20 16 24 20 Q28 24 32 20" stroke="#d3bc8e" stroke-width="2" fill="none"/>
                            <path d="M16 28 Q20 24 24 28 Q28 32 32 28" stroke="#d3bc8e" stroke-width="2" fill="none"/>
                            <circle cx="18" cy="22" r="2" fill="#d3bc8e"/>
                            <circle cx="30" cy="22" r="2" fill="#d3bc8e"/>
                            <circle cx="24" cy="30" r="2" fill="#d3bc8e"/>
                        </svg>
                    </div>
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">人工智能正在分析您的回答...</div>
                    <div style="font-size: 14px; color: #d3bc8e; margin-bottom: 6px;">使用模型：${selectedModel.model}</div>
                    <div id="aiProgressStage" style="font-size: 13px; color: #aaa; margin-top: 10px;">正在准备...</div>
                    <div style="margin-top: 15px; padding: 10px; background: rgba(211, 188, 142, 0.1); border-radius: 8px;">
                        <div style="font-size: 13px; color: #e74c3c;">
                            <svg width="14" height="14" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 4px;">
                                <path d="M8 1 L15 14 H1 Z" stroke="#e74c3c" stroke-width="1.5" fill="none"/>
                                <line x1="8" y1="5" x2="8" y2="9" stroke="#e74c3c" stroke-width="1.5"/>
                                <circle cx="8" cy="11.5" r="1" fill="#e74c3c"/>
                            </svg>
                            请勿退出或刷新页面，否则将丢失分析结果
                        </div>
                        <div style="font-size: 13px; color: #f39c12; margin-top: 5px;">
                            <svg width="14" height="14" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 4px;">
                                <circle cx="8" cy="8" r="6" stroke="#f39c12" stroke-width="1.5" fill="none"/>
                                <path d="M8 4 L8 8 L11 10" stroke="#f39c12" stroke-width="1.5" fill="none"/>
                            </svg>
                            深度思考模式可能需要1-3分钟，请耐心等待
                        </div>
                    </div>
                </div>
            `);

            // 启动伪状态更新定时器
            const progressInterval = setInterval(() => {
                const stageEl = document.getElementById('aiProgressStage');
                if (stageEl) {
                    // 随机选择一条进度文字
                    const randomIndex = Math.floor(Math.random() * progressMessages.length);
                    stageEl.textContent = progressMessages[randomIndex];
                }
            }, 3000);

            // 保存定时器引用以便后续清除
            this._progressInterval = progressInterval;

            const answersArray = Object.entries(this.answers).map(([index, answerText]) => ({
                questionId: this.questions[index].id,
                answerText: answerText
            }));

            const requestBody = {
                answers: answersArray,
                gender: this.gender,
                questions: this.questions,
                provider: selectedModel.provider,
                model: selectedModel.model,
                skippedQuestions: this.skippedQuestions
            };

            console.log('[AI分析] 提交的完整数据:', JSON.stringify(requestBody, null, 2));
            console.log('[AI分析] answers数组:', JSON.stringify(answersArray, null, 2));
            console.log('[AI分析] questions数组:', JSON.stringify(this.questions, null, 2));
            console.log('[AI分析] 抛弃的题目:', JSON.stringify(this.skippedQuestions, null, 2));

            const response = await fetch('/api/ai-analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('[AI分析] 响应状态:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AI分析] HTTP错误:', response.status, errorText);
                throw new Error(`服务器错误 (${response.status}): ${errorText.substring(0, 200)}`);
            }

            // 解析流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalResult = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        try {
                            const json = JSON.parse(data);
                            console.log('[AI分析] 收到数据:', json.stage);

                            if (json.stage === 'result') {
                                // 收到最终结果
                                finalResult = json.data;
                            } else if (json.stage === 'error') {
                                // 收到错误
                                throw new Error(json.error);
                            }
                            // 其他阶段（preparing, thinking等）忽略，使用伪状态
                        } catch (e) {
                            if (e.message && !e.message.includes('JSON')) {
                                throw e;
                            }
                        }
                    }
                }
            }

            if (finalResult) {
                console.log('[AI分析] 分析成功，结果:', JSON.stringify(finalResult, null, 2));
                this.saveResult(finalResult);
                localStorage.removeItem('ai_analysis_progress');
                this.showLoading(false);

                const resultWithMode = {
                    ...finalResult,
                    mode: 'ai',
                    isAIAnalysis: true
                };

                console.log('[AI分析] 准备显示结果, resultWithMode:', resultWithMode);
                UI.displayResult(resultWithMode);
            } else {
                console.error('[AI分析] 未收到最终结果');
                this.showError('分析失败: 未收到分析结果');
            }
        } catch (error) {
            console.error('[AI分析] 提交失败:', error);

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                this.showError('网络连接失败，请检查网络后重试');
            } else {
                this.showError('提交失败: ' + error.message);
            }
        } finally {
            // 清除伪状态定时器
            if (this._progressInterval) {
                clearInterval(this._progressInterval);
                this._progressInterval = null;
            }
            this.isLoading = false;
            this.showLoading(false);
            console.log('========== [AI分析] 提交结束 ==========');
        }
    },

/**
 * 提交答卷到多智能体讨论（不进行AI分析）
 */
submitToMallm: async function () {
    if (this.isLoading) return;

    const filledCount = Object.keys(this.answers).length;
    const totalCount = this.questions.length || this.getQuestionCount();
    
    // 判断条件与提交分析一致：需要填完所有题目
    if (filledCount < totalCount) {
        alert(`请完成所有题目后再提交（已填写 ${filledCount}/${totalCount}）`);
        return;
    }

    console.log('========== [AI分析] 提交到MALLM ==========');
    console.log('[AI分析] 性别:', this.gender);
    console.log('[AI分析] 测试模式:', this.testMode);
    console.log('[AI分析] 已填写题目数:', filledCount);

    try {
        this.isLoading = true;

        // 显示加载提示
        this.showLoading(true, '正在保存答卷...');

        // 构建答卷数据
        const answersArray = Object.entries(this.answers).map(([index, answerText]) => ({
            questionId: this.questions[index].id,
            answerText: answerText
        }));

        // 构建答卷结果（不包含AI分析结果）
        const answerSheet = {
            mode: 'ai',
            isAIAnalysis: true,
            isMallmOnly: true,  // 标记：仅用于MALLM讨论，未进行AI分析
            gender: this.gender,
            testMode: this.testMode,
            questionCount: this.questions.length,
            questions: this.questions,
            answers: answersArray,
            skippedQuestions: this.skippedQuestions,
            timestamp: Date.now(),
            createdAt: new Date().toISOString(),
            type: null,  // 未分析，无MBTI类型
            typeLabel: null,
            aiAnalysis: null,  // 无AI分析结果
            usedModel: null,  // 无使用模型
            mallmOnlyLabel: '多模型讨论'  // 显示标签
        };

        // 保存到服务器并等待完成
        if (window.UI && window.UI.isLoggedIn) {
            const response = await fetch('/api/user/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answerSheet)
            });
            const data = await response.json();
            
            if (data.success) {
                console.log('[AI分析] 答卷已保存到服务器');
                
                // 清除进度
                localStorage.removeItem('ai_analysis_progress');
                
                // 隐藏加载提示
                this.showLoading(false);
                
                // 设置预设答卷参数（刚保存的答卷索引为0）
                localStorage.setItem('mallm_select_sheet', 'ai_0');
                
                // 检查MALLM_UI是否存在
                console.log('[AI分析] 检查MALLM_UI:', window.MALLM_UI);
                console.log('[AI分析] 检查openMALLMPage:', window.MALLM_UI?.openMALLMPage);
                
                // 直接调用MALLM_UI.openMALLMPage()，与欢迎页面一致
                if (window.MALLM_UI && window.MALLM_UI.openMALLMPage) {
                    console.log('[AI分析] 准备打开MALLM页面');
                    // 先隐藏AI答题页面
                    const aiPage = document.getElementById('ai-analysis-page');
                    if (aiPage) {
                        console.log('[AI分析] 隐藏AI答题页面');
                        aiPage.classList.remove('active');
                    }
                    // 打开MALLM页面
                    console.log('[AI分析] 调用openMALLMPage');
                    window.MALLM_UI.openMALLMPage();
                } else {
                    console.error('[AI分析] MALLM_UI不存在，无法跳转');
                    // 备用方案：显示提示
                    alert('答卷已保存，请从主页面的"多智能体讨论"进入');
                }
            } else {
                console.error('[AI分析] 保存答卷失败:', data.error);
                alert('保存答卷失败: ' + data.error);
            }
        } else {
            // 未登录
            alert('请先登录');
        }

    } catch (error) {
        console.error('[AI分析] 提交到MALLM失败:', error);
        alert('提交失败: ' + error.message);
    } finally {
        this.isLoading = false;
        this.showLoading(false);
        console.log('========== [AI分析] 提交到MALLM结束 ==========');
    }
},

/**
 * 保存结果到本地存储
 * 
 * @param {Object} result - 分析结果
 */
saveResult: function(result) {
    console.log('[AI分析] 保存结果，原始数据:', JSON.stringify(result, null, 2));

    const resultData = {
        ...result,
        mode: 'ai',
        timestamp: Date.now(),
        gender: this.gender
    };

    console.log('[AI分析] 保存的完整结果数据:', JSON.stringify(resultData, null, 2));

    localStorage.setItem('mbti_result', JSON.stringify(resultData));

    const history = JSON.parse(localStorage.getItem('genshin_mbti_history') || '[]');
    history.unshift({
        type: result.type,
        typeLabel: result.typeLabel,
        timestamp: Date.now(),
        mode: 'ai'
    });
    if (history.length > 10) {
        history.pop();
    }
    localStorage.setItem('genshin_mbti_history', JSON.stringify(history));

    console.log('[AI分析] 结果已保存到localStorage');
},

/**
 * 显示/隐藏加载状态
 * 
 * @param {boolean} show - 是否显示
 * @param {string} text - 加载文字
 */
showLoading: function(show, text = '') {
    const overlay = document.getElementById('aiLoadingOverlay');
    const loadingText = document.getElementById('aiLoadingText');

    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
    if (loadingText && text) {
        // 支持HTML格式，添加图标
        loadingText.innerHTML = text;
    }
},

/**
 * 显示错误信息
 * 
 * @param {string} message - 错误信息
 */
showError: function(message) {
    const container = document.getElementById('aiQuestionsContainer');
    if (container) {
        const errorEl = document.createElement('div');
        errorEl.className = 'ai-error-message';
        errorEl.textContent = message;
        container.insertBefore(errorEl, container.firstChild);

        setTimeout(() => {
            errorEl.remove();
        }, 5000);
    }
},

/**
 * 绑定事件
 */
bindEvents: function() {
    const self = this;

    const submitBtn = document.getElementById('aiSubmitBtn');
    if (submitBtn) {
        submitBtn.onclick = function () {
            self.submit();
        };
    }

    const mallmBtn = document.getElementById('aiMallmBtn');
    if (mallmBtn) {
        mallmBtn.onclick = function () {
            self.submitToMallm();
        };
    }

    const container = document.getElementById('aiQuestionsContainer');
    if (container) {
        container.onclick = function (e) {
            const target = e.target;

            const replaceBtn = target.closest('.ai-replace-btn');
            if (replaceBtn) {
                const index = parseInt(replaceBtn.dataset.index);
                self.replaceQuestion(index);
                return;
            }

            const hintEl = target.closest('.ai-question-hint');
            if (hintEl) {
                self.toggleHint(hintEl);
                return;
            }
        };

        // input事件：使用防抖动保存
        container.oninput = function (e) {
            const target = e.target;
            if (target.classList.contains('ai-answer-textarea')) {
                const index = parseInt(target.dataset.index);
                self.onAnswerChange(index, false); // 防抖动保存
            }
        };

        // blur事件：立即保存
        container.addEventListener('focusout', function (e) {
            const target = e.target;
            if (target.classList.contains('ai-answer-textarea')) {
                const index = parseInt(target.dataset.index);
                self.onAnswerChange(index, true); // 立即保存
            }
        });
    }
},

/**
 * HTML 转义
 * 
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
escapeHtml: function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
},

/**
 * 加载导入的答卷数据
 * 
 * @param {Object} record - 导入的答卷记录
 */
loadImportedData: async function(record) {
    console.log('[AI分析] 加载导入数据:', record);

    if (!record || !record.questions || !record.answers) {
        alert('导入数据无效');
        return;
    }

    // 设置题目和答案
    this.questions = record.questions;
    this.answers = {};
    this.gender = record.gender;
    this.skippedQuestions = record.skippedQuestions || [];
    this.questionCount = this.questions.length;

    // 根据题目数量设置测试模式
    if (this.questionCount <= 5) {
        this.testMode = 'quick';
    } else {
        this.testMode = 'precise';
    }

    // 处理答案：可能是数组或对象
    if (Array.isArray(record.answers)) {
        record.answers.forEach((item, index) => {
            if (item && typeof item === 'object') {
                // 支持多种字段名：answer, answerText, text
                this.answers[index] = item.answer || item.answerText || item.text || '';
            } else if (typeof item === 'string' && item.trim()) {
                this.answers[index] = item;
            }
        });
    } else if (typeof record.answers === 'object') {
        Object.keys(record.answers).forEach(key => {
            const value = record.answers[key];
            if (typeof value === 'string' && value.trim()) {
                this.answers[key] = value;
            } else if (value && typeof value === 'object') {
                // 支持多种字段名：answer, answerText, text
                this.answers[key] = value.answer || value.answerText || value.text || '';
            }
        });
    }

    // 切换到AI分析页面
    UI.showPage('ai-analysis');

    this.initialized = false;
    this.isLoading = false;

    // 加载模型列表
    try {
        await this.loadModels();

        // 如果导入数据中有模型选择，尝试设置
        const importedModel = record.usedModel;
        if (importedModel && importedModel.provider && importedModel.model) {
            const provider = this.availableModels.find(m =>
                m.provider.toLowerCase() === importedModel.provider.toLowerCase()
            );
            if (provider && provider.models) {
                const model = provider.models.find(subModel =>
                    subModel.id.toLowerCase() === importedModel.model.toLowerCase()
                );
                if (model) {
                    this.selectedModel = {
                        provider: provider.provider,
                        model: model.id
                    };
                    this.renderModelSelector();
                }
            }
        }
    } catch (error) {
        console.error('[AI分析] 加载模型列表失败:', error);
    }

    // 渲染题目并恢复答案
    this.initialized = true;
    this.renderQuestions();
    this.restoreAnswers();
    this.bindEvents();
    this.updateProgress();

    // 立即保存到服务器
    const progressData = {
        questions: this.questions,
        answers: this.answers,
        gender: this.gender,
        provider: this.selectedModel ? this.selectedModel.provider : 'glm',
        model: this.selectedModel ? this.selectedModel.model : 'glm-4-flash',
        skippedQuestions: this.skippedQuestions,
        timestamp: Date.now(),
        savedAt: new Date().toISOString()
    };

    // 保存到本地存储
    localStorage.setItem('ai_analysis_progress', JSON.stringify(progressData));
    console.log('[AI分析] 导入数据已保存到 localStorage');

    // 立即上传到服务器
    if (window.UI && window.UI.isLoggedIn) {
        const saved = await this._saveToServerNow(progressData);
        if (saved) {
            console.log('[AI分析] 导入数据已上传到服务器');
        } else {
            console.warn('[AI分析] 导入数据上传服务器失败，但已保存到本地');
        }
    }

    console.log('[AI分析] 导入完成，共', this.questions.length, '题');
}
};

window.AIAnalysis = AIAnalysis;
