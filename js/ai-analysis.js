const AIAnalysis = {
    questions: [],
    answers: {},
    gender: null,
    isLoading: false,
    selectedModel: null,
    availableModels: [],
    initialized: false,
    testMode: 'quick',
    skippedQuestions: [],
    questionCount: 10,
    debounceTimers: {},
    DEBOUNCE_DELAY: 1000,

    startTest: async function (gender) {
        this.gender = gender;
        this.initialized = false;
        this.questions = [];
        this.answers = {};
        UI.showPage('ai-analysis');
        await this.init();
    },

    getQuestionCount: function () {
        if (this.questionCount) {
            return this.questionCount;
        }
        return this.testMode === 'precise' ? 25 : 10;
    },

    init: async function () {
        if (this.initialized) return;

        if (!this.gender) {
            this.gender = this.getGenderFromStorage();
        }

        this.answers = {};
        this.questions = [];

        await Promise.all([
            this.loadModels(),
            this.loadQuestions()
        ]);

        this.bindEvents();
        this.initialized = true;
    },

    resumeProgress: async function (progress) {
        this.questions = progress.questions || [];
        this.answers = progress.answers || {};
        this.gender = progress.gender || this.gender;
        this.skippedQuestions = progress.skippedQuestions || [];

        await this.loadModels();

        if (progress.provider && progress.model) {
            this.selectedModel = {
                provider: progress.provider,
                model: progress.model
            };
        }

        this.renderQuestions();

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
    },

    clearProgress: async function () {
        this.answers = {};
        this.questions = [];
        this.skippedQuestions = [];

        if (window.UI && window.UI.isLoggedIn) {
            try {
                await fetch('/api/user/progress/ai', {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error('清除AI进度失败:', e);
            }
        }
    },

    startNewTest: async function () {
        await Promise.all([
            this.loadModels(),
            this.loadQuestions()
        ]);
    },

    reset: function () {
        this.questions = [];
        this.answers = {};
        this.initialized = false;
    },

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

    loadModels: async function () {
        try {
            const response = await fetch('/api/ai-models');
            const data = await response.json();

            if (data.success) {
                this.availableModels = data.data.models;
                this.selectedModel = data.data.defaultModel;
                this.renderModelSelector();
            }
        } catch (error) {
            console.error('[AI分析] 加载模型列表失败:', error);
        }
    },

    renderModelSelector: function () {
        const select = document.getElementById('aiModelSelect');
        if (!select) {
            return;
        }
        if (!this.availableModels || this.availableModels.length === 0) {
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
    },

    getSelectedModel: function () {
        const select = document.getElementById('aiModelSelect');
        if (!select || !select.value) {
            return this.selectedModel || { provider: 'glm', model: 'glm-4-flash' };
        }

        const [provider, model] = select.value.split(':');
        return { provider, model };
    },

    loadQuestions: async function () {
        try {
            this.showLoading(true, '正在加载题目...');

            const questionCount = this.getQuestionCount();

            const response = await fetch(`/api/ai-questions?count=${questionCount}`);
            const data = await response.json();

            if (data.success) {
                this.questions = data.data.questions;
                this.renderQuestions();
            } else {
                this.showError('加载题目失败: ' + data.error);
            }
        } catch (error) {
            this.showError('加载题目失败，请刷新页面重试');
        } finally {
            this.showLoading(false);
        }
    },

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

        for (var idx in self.answers) {
            var ta = document.getElementById('ai-answer-' + idx);
            if (ta) {
                ta.value = self.answers[idx];
                var stEl = document.getElementById('ai-status-' + idx);
                if (stEl) { stEl.textContent = '已填写'; stEl.classList.add('completed'); }
            }
        }

        this.updateProgress();
    },

    toggleHint: function (element) {
        element.classList.toggle('expanded');
        const arrow = element.querySelector('.hint-arrow');
        if (arrow) {
            arrow.textContent = element.classList.contains('expanded') ? '▲ 点击收起' : '▼ 点击展开';
        }
    },

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

        if (immediate) {
            if (this.debounceTimers[index]) {
                clearTimeout(this.debounceTimers[index]);
                delete this.debounceTimers[index];
            }
            this.saveProgress();
        } else {
            if (this.debounceTimers[index]) {
                clearTimeout(this.debounceTimers[index]);
            }
            this.debounceTimers[index] = setTimeout(() => {
                this.saveProgress();
                delete this.debounceTimers[index];
            }, this.DEBOUNCE_DELAY);
        }
    },

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

        if (mallmBtn) {
            mallmBtn.disabled = filledCount < totalCount;
        }
    },

    saveProgress: async function () {
        // 只有至少答了一道题才保存进度
        const answeredCount = Object.keys(this.answers || {}).length;
        if (answeredCount === 0) {
            console.log('[AI进度] 没有答题，不保存进度');
            return;
        }
        
        const progress = {
            answers: this.answers,
            questions: this.questions,
            gender: this.gender,
            provider: this.selectedModel ? this.selectedModel.provider : 'glm',
            model: this.selectedModel ? this.selectedModel.model : 'glm-4-flash',
            skippedQuestions: this.skippedQuestions,
            totalCount: this.questions.length,  // 明确记录题目总数
            timestamp: Date.now(),
            savedAt: new Date().toISOString()
        };

        if (window.UI && window.UI.isLoggedIn) {
            this._debounceSaveToServer(progress);
        }
    },

    _debounceSaveToServer: function (progress) {
        if (this._saveProgressTimer) {
            clearTimeout(this._saveProgressTimer);
        }
        this._saveProgressTimer = setTimeout(async () => {
            await this._saveToServerNow(progress);
        }, 1000);
    },

    _saveToServerNow: async function (progress) {
        if (!window.UI || !window.UI.isLoggedIn) {
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
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    },

    clearSavedProgress: async function () {
        localStorage.removeItem('ai_analysis_progress');

        if (window.UI && window.UI.isLoggedIn) {
            try {
                await fetch('/api/user/progress/ai', {
                    method: 'DELETE'
                });
            } catch (error) {
            }
        }
    },

    loadProgress: async function () {
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
                        return true;
                    }
                }
            } catch (error) {
            }
        }
        return false;
    },

    replaceQuestion: async function (index) {
        if (this.isLoading) return;

        const currentAnswer = this.answers[index];
        if (currentAnswer) {
            const confirmed = confirm('更换题目将清空当前答案，确定要更换吗？');
            if (!confirmed) {
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

            const response = await fetch('/api/ai-questions/replace', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.success) {
                const skippedQuestion = {
                    ...this.questions[index],
                    skippedAt: Date.now(),
                    hadAnswer: !!this.answers[index]
                };
                this.skippedQuestions.push(skippedQuestion);

                this.questions[index] = data.data.question;
                delete this.answers[index];
                this.saveProgress();
                this.renderQuestions();

                this.restoreAnswers();
            } else {
                alert('换题失败: ' + data.error);
            }
        } catch (error) {
            alert('换题失败，请重试');
        } finally {
            this.isLoading = false;
        }
    },

    restoreAnswers: function () {
        Object.entries(this.answers).forEach(([index, answer]) => {
            const textarea = document.getElementById(`ai-answer-${index}`);
            if (textarea) {
                textarea.value = answer;
                const statusEl = document.getElementById(`ai-status-${index}`);
                if (statusEl) {
                    statusEl.textContent = '已填写';
                    statusEl.classList.add('completed');
                }
            }
        });
        this.updateProgress();
    },

    submit: async function () {
        if (this.isLoading) return;

        const filledCount = Object.keys(this.answers).length;
        if (filledCount < 5) {
            alert('请完成所有题目后再提交');
            return;
        }

        const selectedModel = this.getSelectedModel();

        try {
            this.isLoading = true;

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
                    <div id="aiThinkingContent" style="font-size: 12px; color: #888; margin-top: 10px; max-height: 60px; overflow: hidden; text-overflow: ellipsis;"></div>
                    <div style="margin-top: 15px; padding: 10px; background: rgba(211, 188, 142, 0.1); border-radius: 8px;">
                        <div style="font-size: 13px; color: #27ae60;">
                            <svg width="14" height="14" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 4px;">
                                <path d="M8 1 L15 8 L8 15 L1 8 Z" stroke="#27ae60" stroke-width="1.5" fill="none"/>
                            </svg>
                            即使退出页面，分析也会在后台完成并保存
                        </div>
                        <div style="font-size: 13px; color: #f39c12; margin-top: 5px;">
                            <svg width="14" height="14" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 4px;">
                                <circle cx="8" cy="8" r="6" stroke="#f39c12" stroke-width="1.5" fill="none"/>
                                <path d="M8 4 L8 8 L11 10" stroke="#f39c12" stroke-width="1.5" fill="none"/>
                            </svg>
                            深度思考模式可能需要1-5分钟，请耐心等待
                        </div>
                    </div>
                </div>
            `);

            const progressInterval = setInterval(() => {
                const stageEl = document.getElementById('aiProgressStage');
                if (stageEl) {
                    const randomIndex = Math.floor(Math.random() * progressMessages.length);
                    stageEl.textContent = progressMessages[randomIndex];
                }
            }, 3000);

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

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`服务器错误 (${response.status}): ${errorText.substring(0, 200)}`);
            }

            // 检查响应类型，处理 JSON 和 SSE 两种情况
            const contentType = response.headers.get('Content-Type') || '';
            
            if (contentType.includes('application/json')) {
                // 后端返回 JSON（通常是配额不足等错误）
                const jsonData = await response.json();
                if (jsonData.success === false) {
                    throw new Error(jsonData.error || '请求失败');
                }
                throw new Error('服务器返回了意外的响应格式');
            }

            // SSE 流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalResult = null;
            let lastHeartbeat = Date.now();
            let receivedStages = [];
            let lastError = null;

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
                            receivedStages.push(json.stage);

                            if (json.stage === 'result') {
                                finalResult = json.data;
                            } else if (json.stage === 'error') {
                                lastError = json.error;
                                throw new Error(json.error);
                            } else if (json.stage === 'heartbeat') {
                                lastHeartbeat = Date.now();
                                console.log('[AI分析] 收到心跳');
                            } else if (json.stage === 'thinking') {
                                const thinkingEl = document.getElementById('aiThinkingContent');
                                if (thinkingEl) {
                                    thinkingEl.textContent = json.content;
                                }
                            } else if (json.stage === 'start') {
                                console.log('[AI分析] 服务器确认开始分析');
                            }
                        } catch (e) {
                            if (e.message && !e.message.includes('JSON')) {
                                throw e;
                            }
                        }
                    }
                }
            }

            if (finalResult) {
                this.saveResult(finalResult);
                localStorage.removeItem('ai_analysis_progress');
                this.showLoading(false);

                const resultWithMode = {
                    ...finalResult,
                    mode: 'ai',
                    isAIAnalysis: true
                };

                UI.displayResult(resultWithMode);
            } else {
                this.showLoading(false);
                let errorMsg = '分析失败';
                if (lastError) {
                    errorMsg = lastError;
                } else if (receivedStages.length === 0) {
                    errorMsg = '服务器没有响应，请检查网络连接后重试';
                } else {
                    errorMsg = '分析过程中断，请稍后在历史记录中查看结果';
                }
                this.renderQuestions();
                this.showError(errorMsg);
                console.error('[AI分析] 详细信息:', { receivedStages, lastError });
            }
        } catch (error) {
            this.showLoading(false);
            let errorMsg = '提交失败';
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMsg = '网络连接失败，请检查网络后重试';
            } else if (error.message.includes('每位用户仅限一次')) {
                errorMsg = '您已经使用过AI分析功能了，每位用户仅限一次';
            } else if (error.message.includes('请先登录')) {
                errorMsg = '请先登录后再进行AI分析';
            } else if (error.message) {
                errorMsg = error.message;
            }
            this.renderQuestions();
            this.showError(errorMsg);
        } finally {
            if (this._progressInterval) {
                clearInterval(this._progressInterval);
                this._progressInterval = null;
            }
            this.isLoading = false;
        }
    },

submitToMallm: async function () {
    if (this.isLoading) return;

    const filledCount = Object.keys(this.answers).length;
    const totalCount = this.questions.length || this.getQuestionCount();

    if (filledCount < totalCount) {
        alert(`请完成所有题目后再提交（已填写 ${filledCount}/${totalCount}）`);
        return;
    }

    try {
        this.isLoading = true;

        this.showLoading(true, '正在保存答卷...');

        const answersArray = Object.entries(this.answers).map(([index, answerText]) => ({
            questionId: this.questions[index].id,
            answerText: answerText
        }));

        const answerSheet = {
            mode: 'ai',
            isAIAnalysis: true,
            isMallmOnly: true,
            gender: this.gender,
            testMode: this.testMode,
            questionCount: this.questions.length,
            questions: this.questions,
            answers: answersArray,
            skippedQuestions: this.skippedQuestions,
            timestamp: Date.now(),
            createdAt: new Date().toISOString(),
            type: null,
            typeLabel: null,
            aiAnalysis: null,
            usedModel: null,
            mallmOnlyLabel: '多模型讨论'
        };

        if (window.UI && window.UI.isLoggedIn) {
            const response = await fetch('/api/user/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answerSheet)
            });
            const data = await response.json();

            if (data.success) {
                localStorage.removeItem('ai_analysis_progress');

                this.showLoading(false);

                localStorage.setItem('mallm_select_sheet', 'ai_0');

                if (window.MALLM_UI && window.MALLM_UI.openMALLMPage) {
                    const aiPage = document.getElementById('ai-analysis-page');
                    if (aiPage) {
                        aiPage.classList.remove('active');
                    }
                    window.MALLM_UI.openMALLMPage();
                } else {
                    alert('答卷已保存，请从主页面的"多智能体讨论"进入');
                }
            } else {
                alert('保存答卷失败: ' + data.error);
                this.renderQuestions();
            }
        } else {
            alert('请先登录');
            this.renderQuestions();
        }

    } catch (error) {
        alert('提交失败: ' + error.message);
        this.renderQuestions();
    } finally {
        this.isLoading = false;
        this.showLoading(false);
    }
},

saveResult: function(result) {
    const resultData = {
        ...result,
        mode: 'ai',
        timestamp: Date.now(),
        gender: this.gender
    };

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
},

showLoading: function(show, text = '') {
    const container = document.getElementById('aiQuestionsContainer');
    if (!container) return;
    
    if (show) {
        // 复用已有的 loading-container 样式
        container.innerHTML = `
            <div class="loading-container">
                <div class="element-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="loading-text">${text || '加载中...'}</div>
            </div>
        `;
    } else if (container.querySelector('.loading-container')) {
        container.innerHTML = '';
    }
},

showError: function(message) {
    var toast = document.getElementById('fixed-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'fixed-toast';
        toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:rgba(220,50,50,0.92);color:#fff;padding:16px 32px;border-radius:8px;font-size:16px;text-align:center;max-width:80vw;box-shadow:0 4px 20px rgba(220,50,50,0.4);display:none;pointer-events:auto;';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    if (toast._timer) clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
        toast.style.display = 'none';
    }, 5000);
},

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

        container.oninput = function (e) {
            const target = e.target;
            if (target.classList.contains('ai-answer-textarea')) {
                const index = parseInt(target.dataset.index);
                self.onAnswerChange(index, false);
            }
        };

        container.addEventListener('focusout', function (e) {
            const target = e.target;
            if (target.classList.contains('ai-answer-textarea')) {
                const index = parseInt(target.dataset.index);
                self.onAnswerChange(index, true);
            }
        });
    }
},

escapeHtml: function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
},

loadImportedData: async function(record) {
    if (!record || !record.questions || !record.answers) {
        alert('导入数据无效');
        return;
    }

    this.questions = record.questions;
    this.answers = {};
    this.gender = record.gender;
    this.skippedQuestions = record.skippedQuestions || [];
    this.questionCount = this.questions.length;

    if (this.questionCount <= 5) {
        this.testMode = 'quick';
    } else {
        this.testMode = 'precise';
    }

    if (Array.isArray(record.answers)) {
        record.answers.forEach((item, index) => {
            if (item && typeof item === 'object') {
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
                this.answers[key] = value.answer || value.answerText || value.text || '';
            }
        });
    }

    UI.showPage('ai-analysis');

    this.initialized = false;
    this.isLoading = false;

    try {
        await this.loadModels();

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
    }

    this.initialized = true;
    this.renderQuestions();
    this.restoreAnswers();
    this.bindEvents();
    this.updateProgress();

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

    if (window.UI && window.UI.isLoggedIn) {
        await this._saveToServerNow(progressData);
    }
}
};

window.AIAnalysis = AIAnalysis;