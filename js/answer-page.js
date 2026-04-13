// 版本号: v1.0.0
/**
 * 原神版MBTI - 答题页面模块
 * 
 * 功能: 处理答题页面的所有逻辑
 */

const AnswerPage = {
    /**
     * 当前题目索引
     */
    currentIndex: 0,
    
    /**
     * 最后答题位置（用于"回到最后"功能）
     * 记录用户最后作答的题目索引
     */
    lastAnsweredIndex: -1,
    
    /**
     * 题目列表
     */
    questions: [],
    
    /**
     * 用户答案存储
     */
    answers: [],
    
    /**
     * 题库版本
     */
    questionVersion: '',
    
    /**
     * 跳转定时器
     */
    nextQuestionTimer: null,
    
    /**
     * 初始化答题页面
     * 
     * @param {Array} questions - 题目列表
     * @returns {Object} 答题页面实例
     */
    init: function(questions) {
        this.questions = questions;
        this.answers = new Array(questions.length).fill(null);
        this.currentIndex = 0;
        this.lastAnsweredIndex = -1;
        
        // 尝试加载保存的进度
        const hasProgress = this.loadProgress();
        if (hasProgress) {
            console.log('已恢复之前的答题进度');
        }
        
        return this;
    },
    
    /**
     * 渲染题目
     * 
     * @param {number} index - 题目索引
     */
    renderQuestion: function(index) {
        const question = this.questions[index];
        if (!question) return;
        
        this.currentIndex = index;
        
        const container = document.getElementById('question-container');
        if (!container) return;
        
        const totalQuestions = this.questions.length;
        const currentAnswer = this.answers[index];
        const optionA = question.options[0];
        const optionB = question.options[1];
        
        let html = `
            <div class="question-card">
                <div class="question-number" id="questionCounter">${index + 1} / ${totalQuestions}</div>
                <div class="test-progress-bar">
                    <div class="test-progress-fill" id="progress-fill" style="width: ${(index / totalQuestions * 100).toFixed(1)}%"></div>
                </div>
                <div class="question-text" id="questionDisplay">${question.text}</div>
        `;
        
        html += '<div class="dot-options-container">';
        
        html += `
            <div class="dot-side dot-side-left">
                <span class="dot-direction-label">${optionA ? optionA.text : 'A'}</span>
                <button class="dot-btn dot-size-3 ${this.isSelected(currentAnswer, 'left', 'strong') ? 'selected' : ''}" 
                        data-side="left" data-intensity="strong"
                        title="${optionA ? optionA.text : ''}"></button>
                <button class="dot-btn dot-size-2 ${this.isSelected(currentAnswer, 'left', 'medium') ? 'selected' : ''}" 
                        data-side="left" data-intensity="medium"
                        title="${optionA ? optionA.text : ''}"></button>
                <button class="dot-btn dot-size-1 ${this.isSelected(currentAnswer, 'left', 'weak') ? 'selected' : ''}" 
                        data-side="left" data-intensity="weak"
                        title="${optionA ? optionA.text : ''}"></button>
            </div>
            
            <div class="dot-side dot-side-right">
                <button class="dot-btn dot-size-1 ${this.isSelected(currentAnswer, 'right', 'weak') ? 'selected' : ''}" 
                        data-side="right" data-intensity="weak"
                        title="${optionB ? optionB.text : ''}"></button>
                <button class="dot-btn dot-size-2 ${this.isSelected(currentAnswer, 'right', 'medium') ? 'selected' : ''}" 
                        data-side="right" data-intensity="medium"
                        title="${optionB ? optionB.text : ''}"></button>
                <button class="dot-btn dot-size-3 ${this.isSelected(currentAnswer, 'right', 'strong') ? 'selected' : ''}" 
                        data-side="right" data-intensity="strong"
                        title="${optionB ? optionB.text : ''}"></button>
                <span class="dot-direction-label">${optionB ? optionB.text : 'B'}</span>
            </div>
        `;
        
        html += '</div>';
        
        html += '<div class="question-hint">请选择您的倾向、偏好或程度</div>';
        
        html += '</div>';
        
        // 渲染导航按钮
        html += this.renderNavigationButtons(index, totalQuestions);
        
        container.innerHTML = html;
        
        // 绑定事件
        this.bindEvents();
        
        // 更新进度
        if (typeof UI !== 'undefined' && UI.updateProgress) {
            UI.updateProgress();
        }
    },
    
    /**
     * 判断选项是否被选中
     * 
     * @param {Object} answer - 答案对象
     * @param {string} side - 左右方向
     * @param {string} intensity - 强度
     * @returns {boolean} 是否选中
     */
    isSelected: function(answer, side, intensity) {
        if (!answer || answer.coordinate === undefined) return false;
        
        const intensityValue = intensity === 'strong' ? 3 : (intensity === 'medium' ? 2 : 1);
        const expectedCoordinate = side === 'left' ? -intensityValue : intensityValue;
        
        return answer.coordinate === expectedCoordinate;
    },
    
    /**
     * 渲染导航按钮
     * 
     * @param {number} index - 当前题目索引
     * @param {number} totalQuestions - 总题目数
     * @returns {string} HTML字符串
     */
    renderNavigationButtons: function(index, totalQuestions) {
        const isLastQuestion = index === totalQuestions - 1;
        const hasAnswered = this.answers[index] !== null;
        const canGoToLast = !isLastQuestion && this.lastAnsweredIndex >= index;
        
        let html = '<div class="test-nav-buttons">';
        
        if (index > 0) {
            html += '<button class="btn-test-prev" data-action="prev-question">← 上一题</button>';
        } else {
            html += '<div></div>';
        }
        
        if (isLastQuestion && hasAnswered) {
            html += '<button class="btn-test-submit" data-action="submit-test">查看结果</button>';
        } else if (canGoToLast) {
            html += '<button class="btn-test-next" data-action="go-to-last">回到最后 →</button>';
        } else {
            html += '<div></div>';
        }
        
        html += '</div>';
        
        return html;
    },
    
    /**
     * 绑定事件
     */
    bindEvents: function() {
        const allDots = document.querySelectorAll('.dot-btn');
        allDots.forEach(dot => {
            dot.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                if (!dot.classList.contains('processing')) {
                    dot.classList.add('processing');
                    this.handleDotClick(dot);
                    setTimeout(() => {
                        dot.classList.remove('processing');
                    }, 500);
                }
            });
            
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            dot.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });
            
            dot.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
    },
    
    /**
     * 处理圆点按钮点击
     * 
     * @param {HTMLElement} clickedDot - 被点击的圆点按钮
     */
    handleDotClick: function(clickedDot) {
        const question = this.questions[this.currentIndex];
        const optionA = question.options[0];
        const optionB = question.options[1];
        
        const side = clickedDot.dataset.side;
        const intensity = clickedDot.dataset.intensity;
        
        // 更新选中状态
        document.querySelectorAll('.dot-btn').forEach(dot => {
            dot.classList.remove('selected');
        });
        clickedDot.classList.add('selected');
        
        // 计算坐标
        const intensityValue = intensity === 'strong' ? 3 : (intensity === 'medium' ? 2 : 1);
        const coordinate = side === 'left' ? -intensityValue : intensityValue;
        
        // 保存答案
        this.answers[this.currentIndex] = {
            questionId: question.id,
            coordinate: coordinate,
            optionA: {
                character_type: optionA.character_type
            },
            optionB: {
                character_type: optionB.character_type
            }
        };
        
        // 更新最后答题位置
        if (this.currentIndex > this.lastAnsweredIndex) {
            this.lastAnsweredIndex = this.currentIndex;
        }
        
        // 保存进度
        this.saveProgress();
        
        // 清除之前的定时器
        if (this.nextQuestionTimer) {
            clearTimeout(this.nextQuestionTimer);
        }
        
        // 判断是否是最后一题
        const isLastQuestion = this.currentIndex === this.questions.length - 1;
        
        if (isLastQuestion) {
            // 最后一题：更新按钮显示提交按钮
            this.updateNavigationButtons();
        } else {
            // 不是最后一题：跳转到下一题
            this.nextQuestionTimer = setTimeout(() => {
                this.currentIndex++;
                this.renderQuestion(this.currentIndex);
            }, 350);
        }
    },
    
    /**
     * 更新导航按钮
     */
    updateNavigationButtons: function() {
        const navButtons = document.querySelector('.test-nav-buttons');
        if (!navButtons) return;
        
        const isLastQuestion = this.currentIndex === this.questions.length - 1;
        const hasAnswered = this.answers[this.currentIndex] !== null;
        const canGoBack = this.lastAnsweredIndex > this.currentIndex;
        
        const rightSlot = navButtons.children[1];
        if (rightSlot) {
            if (isLastQuestion && hasAnswered) {
                rightSlot.outerHTML = '<button class="btn-test-submit" data-action="submit-test">查看结果</button>';
            } else if (canGoBack) {
                rightSlot.outerHTML = '<button class="btn-test-next" data-action="go-to-last">回到最后 →</button>';
            } else {
                rightSlot.outerHTML = '<div></div>';
            }
        }
    },
    
    /**
     * 上一题
     */
    prevQuestion: function() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderQuestion(this.currentIndex);
        }
    },
    
    /**
     * 下一题
     */
    nextQuestion: function() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            this.renderQuestion(this.currentIndex);
        }
    },
    
    /**
     * 回到最后答题位置
     */
    goToLast: function() {
        // 跳转到最后答题位置的下一题
        const targetIndex = this.lastAnsweredIndex + 1;
        if (targetIndex < this.questions.length) {
            this.currentIndex = targetIndex;
            this.renderQuestion(this.currentIndex);
        } else {
            // 如果已经答完所有题，跳到最后一题
            this.currentIndex = this.questions.length - 1;
            this.renderQuestion(this.currentIndex);
        }
    },
    
    /**
     * 提交测试
     */
    submitTest: function() {
        const unansweredIndices = [];
        for (let i = 0; i < this.answers.length; i++) {
            if (this.answers[i] === null) {
                unansweredIndices.push(i);
            }
        }
        
        if (unansweredIndices.length > 0) {
            this.showUnansweredModal(unansweredIndices);
            return;
        }
        
        if (typeof UI !== 'undefined' && UI.showCalculatingPage) {
            UI.showCalculatingPage();
        }
    },
    
    showUnansweredModal: function(unansweredIndices) {
        let modal = document.getElementById('unanswered-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'unanswered-modal';
            modal.innerHTML = `
                <div class="unanswered-modal-overlay"></div>
                <div class="unanswered-modal-content">
                    <div class="unanswered-modal-title">提示</div>
                    <div class="unanswered-modal-body">
                        还有 <span id="unanswered-count">${unansweredIndices.length}</span> 道题目未作答
                    </div>
                    <div class="unanswered-modal-buttons">
                        <button class="unanswered-modal-btn unanswered-modal-btn-primary" id="unanswered-goto">前往作答</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            const style = document.createElement('style');
            style.textContent = `
                .unanswered-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 10000;
                }
                .unanswered-modal-content {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%);
                    border: 1px solid rgba(255, 215, 0, 0.3);
                    border-radius: 16px;
                    padding: 30px 40px;
                    z-index: 10001;
                    text-align: center;
                    min-width: 300px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                }
                .unanswered-modal-title {
                    font-size: 20px;
                    font-weight: bold;
                    color: #ffd700;
                    margin-bottom: 15px;
                }
                .unanswered-modal-body {
                    font-size: 16px;
                    color: #fff;
                    margin-bottom: 25px;
                }
                .unanswered-modal-body span {
                    color: #ff6b6b;
                    font-weight: bold;
                    font-size: 18px;
                }
                .unanswered-modal-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                }
                .unanswered-modal-btn {
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                }
                .unanswered-modal-btn-primary {
                    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                    color: #000;
                    font-weight: bold;
                }
                .unanswered-modal-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
                }
            `;
            document.head.appendChild(style);
        } else {
            document.getElementById('unanswered-count').textContent = unansweredIndices.length;
            modal.style.display = 'block';
        }
        
        const gotoBtn = document.getElementById('unanswered-goto');
        const overlay = modal.querySelector('.unanswered-modal-overlay');
        
        const goToUnanswered = () => {
            modal.style.display = 'none';
            this.currentIndex = unansweredIndices[0];
            this.renderQuestion(this.currentIndex);
        };
        
        gotoBtn.onclick = goToUnanswered;
        overlay.onclick = goToUnanswered;
    },
    
    /**
     * 保存进度（格式与导入格式一致）
     */
    saveProgress: async function() {
        try {
            // 将答案对象转换为coordinate值数组（与导入格式一致）
            const coordinateAnswers = this.answers.map(answer => {
                if (answer && answer.coordinate !== undefined) {
                    return answer.coordinate;
                }
                return null;
            });
            
            // 计算已答题数量
            const answeredCount = coordinateAnswers.filter(a => a !== null).length;
            
            const progress = {
                type: 'normal',
                questionSet: this.questionVersion || this.getQuestionSetName(),
                answers: coordinateAnswers,
                gender: localStorage.getItem('mbti_gender') || 'male',
                savedAt: new Date().toISOString(),
                // 额外字段用于断点续答
                currentIndex: this.currentIndex,
                lastAnsweredIndex: this.lastAnsweredIndex,
                timestamp: Date.now()
            };
            
            // 保存到本地存储
            localStorage.setItem('mbti_progress', JSON.stringify(progress));
            
            // 如果已登录，保存到服务器
            if (window.UI && window.UI.isLoggedIn) {
                // 每答5题强制保存一次，或者使用防抖保存
                const shouldForceSave = answeredCount % 5 === 0 && answeredCount > 0 && this._lastSavedCount !== answeredCount;
                
                if (shouldForceSave) {
                    // 强制立即保存
                    console.log(`[进度保存] 已答${answeredCount}题，强制保存到服务器`);
                    this._lastSavedCount = answeredCount;
                    await this._saveToServerNow(progress);
                } else {
                    // 防抖保存
                    this._debounceSaveToServer(progress);
                }
            }
        } catch (e) {
            console.error('保存进度失败:', e);
        }
    },
    
    /**
     * 立即保存进度到服务器
     * 
     * @param {Object} progress - 进度数据
     */
    _saveToServerNow: async function(progress) {
        try {
            const response = await fetch('/api/user/progress/normal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(progress)
            });
            const data = await response.json();
            if (data.success) {
                console.log('[进度保存] 保存到服务器成功');
            } else {
                console.error('[进度保存] 保存到服务器失败:', data.error);
            }
        } catch (error) {
            console.error('[进度保存] 网络错误:', error);
        }
    },
    
    /**
     * 防抖保存进度到服务器
     * 
     * @param {Object} progress - 进度数据
     */
    _debounceSaveToServer: function(progress) {
        if (this._saveProgressTimer) {
            clearTimeout(this._saveProgressTimer);
        }
        this._saveProgressTimer = setTimeout(async () => {
            await this._saveToServerNow(progress);
        }, 1500);
    },
    
    /**
     * 加载进度
     * 
     * @returns {Promise<boolean>} 是否成功加载
     */
    loadProgress: async function() {
        // 如果已登录，优先从服务器加载
        if (window.UI && window.UI.isLoggedIn) {
            try {
                const response = await fetch('/api/user/progress/normal');
                const data = await response.json();

                if (data.success && data.hasProgress && data.data) {
                    const progress = data.data;
                    
                    // 检查题目数量是否一致
                    if (progress.answers && progress.answers.length !== this.questions.length) {
                        console.log('题目数量不一致，跳过服务器进度');
                    } else {
                        this.currentIndex = progress.currentIndex || 0;
                        this.lastAnsweredIndex = progress.lastAnsweredIndex || -1;
                        this.questionVersion = progress.questionSet || '';
                        
                        // 将coordinate值转换为答案对象
                        for (let i = 0; i < progress.answers.length; i++) {
                            const coordinate = progress.answers[i];
                            if (coordinate !== null && coordinate !== undefined) {
                                const question = this.questions[i];
                                if (question) {
                                    this.answers[i] = {
                                        questionId: question.id,
                                        coordinate: coordinate,
                                        optionA: {
                                            character_type: question.options ? question.options[0].character_type : 'A'
                                        },
                                        optionB: {
                                            character_type: question.options ? question.options[1].character_type : 'B'
                                        }
                                    };
                                }
                            }
                        }
                        
                        // 同步到本地存储
                        localStorage.setItem('mbti_progress', JSON.stringify(progress));
                        console.log('[进度加载] 从服务器加载成功');
                        return true;
                    }
                }
            } catch (error) {
                console.error('[进度加载] 从服务器加载失败:', error);
            }
        }
        
        // 如果服务器加载失败或未登录，尝试从本地加载
        try {
            const saved = localStorage.getItem('mbti_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                
                // 检查题目数量是否一致（保留此检查，确保进度与当前题库匹配）
                if (progress.answers && progress.answers.length !== this.questions.length) {
                    console.log('题目数量不一致，清除旧进度');
                    localStorage.removeItem('mbti_progress');
                    return false;
                }
                
                this.currentIndex = progress.currentIndex || 0;
                this.lastAnsweredIndex = progress.lastAnsweredIndex || -1;
                this.questionVersion = progress.questionSet || '';
                
                // 将coordinate值转换为答案对象
                for (let i = 0; i < progress.answers.length; i++) {
                    const coordinate = progress.answers[i];
                    if (coordinate !== null && coordinate !== undefined) {
                        const question = this.questions[i];
                        if (question) {
                            this.answers[i] = {
                                questionId: question.id,
                                coordinate: coordinate,
                                optionA: {
                                    character_type: question.options ? question.options[0].character_type : 'A'
                                },
                                optionB: {
                                    character_type: question.options ? question.options[1].character_type : 'B'
                                }
                            };
                        }
                    }
                }
                
                return true;
            }
        } catch (e) {
            console.error('加载进度失败:', e);
        }
        return false;
    },
    
    /**
     * 清除进度
     */
    clearProgress: function() {
        try {
            localStorage.removeItem('mbti_progress');
        } catch (e) {
            console.error('清除进度失败:', e);
        }
    },
    
    /**
     * 重置
     */
    reset: function() {
        this.currentIndex = 0;
        this.lastAnsweredIndex = -1;
        this.answers = new Array(this.questions.length).fill(null);
        this.clearProgress();
    },
    
    /**
     * 获取答案
     * 
     * @returns {Array} 答案数组
     */
    getAnswers: function() {
        return this.answers;
    },
    
    /**
     * 导出当前答卷数据
     * 
     * @returns {Object} 答卷数据对象
     */
    exportData: function() {
        return {
            type: 'normal',
            questionSet: this.getQuestionSetName(),
            answers: this.answers,
            gender: localStorage.getItem('mbti_gender') || 'unknown',
            savedAt: new Date().toISOString()
        };
    },
    
    /**
     * 获取当前题库名称
     * 
     * @returns {string} 题库名称
     */
    getQuestionSetName: function() {
        // 优先使用保存的题库版本
        if (this.questionVersion) {
            return this.questionVersion;
        }
        
        // 如果没有保存版本，根据题目数量推断（兼容旧数据）
        const count = this.questions.length;
        if (count === 20) return 'mbti-20';
        if (count === 90) return 'mbti-90';
        if (count === 106) return 'mbti-106';
        if (count === 172) return 'mbti-172';
        if (count === 200) return 'mbti-200';
        
        // 默认返回200题版本
        return 'mbti-200';
    }
};

// 挂载到全局对象
window.AnswerPage = AnswerPage;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnswerPage;
}
