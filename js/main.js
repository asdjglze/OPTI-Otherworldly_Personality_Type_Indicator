// 版本号: v1.0.0
/**
 * 原神版MBTI - 主程序入口
 * 
 * 功能: 初始化应用、加载题目、协调各模块
 */

const GenshinMBTI = {
    /**
     * 应用版本
     */
    version: '1.0.0',
    
    /**
     * 应用状态
     */
    state: {
        initialized: false,
        questions: [],
        answers: [],
        result: null,
        questionVersion: '200',
        isGenshinVersion: false,
        gender: null,
        pendingVersion: null,
        isQuickTest: false,
        audioStarted: false,
        pendingImportData: null
    },

    /**
     * 音频管理器
     */
    audioManager: {
        bgm: null,
        ambient: null,
        bgmVolume: 0.8,
        ambientVolume: 0.7,
        isMuted: false,
        previousBgmVolume: 0.8,
        previousAmbientVolume: 0.7,
        
        /**
         * 初始化音频元素
         */
        init: function() {
            this.bgm = document.getElementById('bgm-audio');
            this.ambient = document.getElementById('ambient-audio');
            
            if (this.bgm) {
                this.bgm.volume = this.bgmVolume;
            }
            if (this.ambient) {
                this.ambient.volume = this.ambientVolume;
            }
            
            this.initAudioControl();
            this.loadSavedVolume();
        },
        
        /**
         * 初始化音频控制按钮
         */
        initAudioControl: function() {
            const self = this;
            const audioController = document.getElementById('audio-controller');
            const tooltip = document.getElementById('audio-tooltip');
            
            if (!audioController) return;
            
            audioController.addEventListener('click', function() {
                self.toggleMute();
                
                audioController.classList.add('clicking');
                setTimeout(function() {
                    audioController.classList.remove('clicking');
                }, 300);
            });
            
            audioController.addEventListener('mouseenter', function() {
                self.updateTooltip();
            });
        },
        
        /**
         * 更新状态提示文字
         */
        updateTooltip: function() {
            const tooltip = document.getElementById('audio-tooltip');
            if (tooltip) {
                tooltip.textContent = this.isMuted ? '音乐已关闭' : '音乐开启';
            }
        },
        
        /**
         * 切换静音状态
         */
        toggleMute: function() {
            const audioController = document.getElementById('audio-controller');
            
            if (this.isMuted) {
                this.setBgmVolume(this.previousBgmVolume);
                this.setAmbientVolume(this.previousAmbientVolume);
                this.isMuted = false;
                if (audioController) audioController.classList.remove('muted');
            } else {
                this.previousBgmVolume = this.bgmVolume;
                this.previousAmbientVolume = this.ambientVolume;
                this.setBgmVolume(0);
                this.setAmbientVolume(0);
                this.isMuted = true;
                if (audioController) audioController.classList.add('muted');
            }
            
            this.updateTooltip();
            this.saveVolume();
        },
        
        /**
         * 保存音量设置到本地存储
         */
        saveVolume: function() {
            const settings = {
                bgmVolume: this.bgmVolume,
                ambientVolume: this.ambientVolume,
                isMuted: this.isMuted
            };
            localStorage.setItem('genshin_mbti_audio', JSON.stringify(settings));
        },
        
        /**
         * 从本地存储加载音量设置
         */
        loadSavedVolume: function() {
            const saved = localStorage.getItem('genshin_mbti_audio');
            if (saved) {
                try {
                    const settings = JSON.parse(saved);
                    this.bgmVolume = settings.bgmVolume || 0.3;
                    this.ambientVolume = settings.ambientVolume || 0.15;
                    this.isMuted = settings.isMuted || false;
                    
                    if (this.bgm) this.bgm.volume = this.bgmVolume;
                    if (this.ambient) this.ambient.volume = this.ambientVolume;
                    
                    const audioController = document.getElementById('audio-controller');
                    if (this.isMuted && audioController) {
                        audioController.classList.add('muted');
                    }
                    
                    this.updateTooltip();
                } catch (e) {
                    console.log('加载音量设置失败:', e);
                }
            }
        },
        
        /**
         * 播放所有背景音频
         * @returns {Promise<boolean>} 是否成功播放
         */
        playAll: async function() {
            const results = await Promise.all([
                this.play(this.bgm),
                this.play(this.ambient)
            ]);
            return results.every(r => r);
        },
        
        /**
         * 播放单个音频
         * @param {HTMLAudioElement} audio - 音频元素
         * @returns {Promise<boolean>} 是否成功播放
         */
        play: function(audio) {
            if (!audio) return Promise.resolve(false);
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                return playPromise
                    .then(() => true)
                    .catch(error => {
                        console.log('音频播放被阻止，等待用户交互:', error);
                        return false;
                    });
            }
            return Promise.resolve(true);
        },
        
        /**
         * 暂停所有音频
         */
        pauseAll: function() {
            if (this.bgm) this.bgm.pause();
            if (this.ambient) this.ambient.pause();
        },
        
        /**
         * 设置背景音乐音量
         * @param {number} volume - 音量值 (0-1)
         */
        setBgmVolume: function(volume) {
            this.bgmVolume = Math.max(0, Math.min(1, volume));
            if (this.bgm) this.bgm.volume = this.bgmVolume;
        },
        
        /**
         * 设置环境音效音量
         * @param {number} volume - 音量值 (0-1)
         */
        setAmbientVolume: function(volume) {
            this.ambientVolume = Math.max(0, Math.min(1, volume));
            if (this.ambient) this.ambient.volume = this.ambientVolume;
        }
    },

    /**
     * 初始化应用
     */
    init: async function() {
        console.log(`原神版MBTI v${this.version} 初始化中...`);
        
        this.state.initialized = true;
        this.audioManager.init();
        this.setupAudioAutoPlay();
        this.setupVideoBackground();
        UI.bindEvents();
        
        // 初始化登录弹窗事件
        UI.initLoginModalEvents();
        
        // 检查登录状态
        await UI.checkLoginStatus();
        
        await UI.loadCharactersData();
        
        console.log(`原神版MBTI 初始化完成！`);
        
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'ai') {
            this.showAIResult();
        } else {
            this.showWelcome();
        }
    },
    
    /**
     * 设置视频背景加载检测
     * 视频一开始就显示，poster图片覆盖在上面
     * 当视频开始播放时立即隐藏poster
     */
    setupVideoBackground: function() {
        const video = document.getElementById('bg-video');
        const poster = document.getElementById('video-poster');
        
        if (!video) return;
        
        console.log('[视频背景] 开始设置，视频状态:', {
            paused: video.paused,
            currentTime: video.currentTime,
            readyState: video.readyState,
            networkState: video.networkState
        });
        
        const hidePoster = () => {
            if (poster && !poster.classList.contains('hidden')) {
                console.log('[视频背景] 隐藏poster，视频开始播放');
                poster.classList.add('hidden');
            }
        };
        
        // 尝试立即播放
        const tryPlay = () => {
            if (video.paused) {
                console.log('[视频背景] 尝试调用 play()');
                video.play().then(() => {
                    console.log('[视频背景] play() 成功');
                    hidePoster();
                }).catch(err => {
                    console.log('[视频背景] play() 失败:', err.message);
                });
            } else {
                hidePoster();
            }
        };
        
        // 如果视频已经在播放，立即隐藏poster
        if (!video.paused && video.currentTime > 0) {
            console.log('[视频背景] 视频已在播放');
            hidePoster();
        } else {
            // 监听多种事件，确保尽早开始播放
            // loadedmetadata: 元数据加载完成，可以开始播放
            // loadeddata: 第一帧数据加载完成
            // canplay: 可以播放
            // playing: 正在播放
            
            video.addEventListener('loadedmetadata', () => {
                console.log('[视频背景] loadedmetadata 事件');
                tryPlay();
            }, { once: true });
            
            video.addEventListener('loadeddata', () => {
                console.log('[视频背景] loadeddata 事件');
                tryPlay();
            }, { once: true });
            
            video.addEventListener('canplay', () => {
                console.log('[视频背景] canplay 事件');
                tryPlay();
            }, { once: true });
            
            video.addEventListener('playing', () => {
                console.log('[视频背景] playing 事件');
                hidePoster();
            }, { once: true });
            
            video.addEventListener('timeupdate', () => {
                hidePoster();
            }, { once: true });
            
            // 如果 readyState 已经足够，立即尝试播放
            if (video.readyState >= 1) {
                console.log('[视频背景] readyState >= 1，立即尝试播放');
                tryPlay();
            }
        }
    },

    /**
     * 显示 AI 分析结果
     */
    showAIResult: function() {
        try {
            const savedResult = localStorage.getItem('mbti_result');
            if (savedResult) {
                const result = JSON.parse(savedResult);
                if (result.mode === 'ai') {
                    UI.displayResult(result);
                    return;
                }
            }
        } catch (e) {
            console.error('加载 AI 结果失败:', e);
        }
        
        window.location.href = 'index.html';
    },

    /**
     * 设置音频自动播放（处理浏览器自动播放策略）
     */
    setupAudioAutoPlay: function() {
        const tryPlayAudio = async () => {
            if (this.state.audioStarted) return;
            
            const success = await this.audioManager.playAll();
            if (success) {
                this.state.audioStarted = true;
                console.log('背景音频已开始播放~');
            }
        };
        
        document.addEventListener('click', tryPlayAudio, { once: true });
        document.addEventListener('touchstart', tryPlayAudio, { once: true });
        document.addEventListener('keydown', tryPlayAudio, { once: true });
        document.addEventListener('wheel', tryPlayAudio, { once: true });
        document.addEventListener('touchmove', tryPlayAudio, { once: true });
        
        document.addEventListener('click', () => {
            if (!this.state.audioStarted) {
                tryPlayAudio();
            }
        });
        document.addEventListener('touchstart', () => {
            if (!this.state.audioStarted) {
                tryPlayAudio();
            }
        });
        document.addEventListener('wheel', () => {
            if (!this.state.audioStarted) {
                tryPlayAudio();
            }
        });
        document.addEventListener('touchmove', () => {
            if (!this.state.audioStarted) {
                tryPlayAudio();
            }
        });
    },

    /**
     * 绑定版本按钮点击事件
     */
    bindVersionButtons: function() {
        const versionBtns = document.querySelectorAll('.version-btn[data-action="start-test"]');
        versionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const version = btn.dataset.version;
                this.startTest(version);
            });
        });
    },

    /**
     * 开始测试 - 显示性别选择弹窗
     * 
     * @param {string} version - 题库版本 ('200', '90', '200-genshin', '90-genshin')
     */
    startTest: async function(version) {
        console.log('========== [步骤1] startTest 被调用 ==========');
        console.log('[步骤1] 接收到的 version 参数:', version, '类型:', typeof version);
        console.log('[步骤1] 调用栈:', new Error().stack);
        this.state.pendingVersion = version;
        console.log('[步骤1] 已保存到 state.pendingVersion:', this.state.pendingVersion);
        
        // 检查是否有保存的进度
        const progress = await UI.checkNormalProgress();
        if (progress) {
            // 显示断点续答提示
            UI.showProgressPrompt(progress, 'normal');
        } else {
            // 显示性别选择弹窗
            UI.showGenderModal();
        }
    },

    /**
     * 确认性别后开始加载题目
     * 
     * @param {string} gender - 性别 ('male' 或 'female')
     */
    confirmGenderAndStart: async function(gender) {
        console.log('========== [步骤2] confirmGenderAndStart 被调用 ==========');
        console.log('[步骤2] 接收到的 gender 参数:', gender);
        console.log('[步骤2] 从 state.pendingVersion 读取版本:', this.state.pendingVersion);
        
        this.state.gender = gender;
        
        const genderModal = document.getElementById('gender-modal');
        const isAIMode = genderModal && genderModal.dataset.mode === 'ai';
        const isAIQuickMode = genderModal && genderModal.dataset.mode === 'ai-quick';
        const isAIFixedMode = genderModal && genderModal.dataset.mode === 'ai-fixed';
        const aiCount = genderModal && genderModal.dataset.count ? parseInt(genderModal.dataset.count) : 5;
        
        const version = this.state.pendingVersion;
        console.log('[步骤2] 准备使用的 version 变量:', version, '类型:', typeof version);
        
        UI.hideGenderModal();
        
        // AI固定题测试模式
        if (isAIFixedMode) {
            if (genderModal) {
                genderModal.dataset.mode = '';
                const title = genderModal.querySelector('.gender-modal-title');
                if (title) {
                    title.textContent = '开始测试';
                }
                const versionDiv = document.getElementById('gender-modal-version');
                if (versionDiv) {
                    versionDiv.style.display = '';
                }
            }
            localStorage.setItem('genshin_mbti_progress', JSON.stringify({ gender: gender }));
            // 开始AI固定题测试
            UI.startAIFixedTestWithGender(gender);
            return;
        }
        
        if (isAIQuickMode) {
            if (genderModal) {
                genderModal.dataset.mode = '';
                genderModal.dataset.count = '';
                const title = genderModal.querySelector('.gender-modal-title');
                if (title) {
                    title.textContent = '开始测试';
                }
                const versionDiv = document.getElementById('gender-modal-version');
                if (versionDiv) {
                    versionDiv.style.display = '';
                }
            }
            localStorage.setItem('genshin_mbti_progress', JSON.stringify({ gender: gender }));
            // 直接开始AI测试，不显示模式选择弹窗
            if (window.AIAnalysis) {
                // 根据题目数量设置正确的测试模式和题目数量
                // 5道题 -> 'quick', 10道题 -> 'quick', 25道题 -> 'precise'
                window.AIAnalysis.testMode = (aiCount === 25) ? 'precise' : 'quick';
                window.AIAnalysis.questionCount = aiCount;
                window.AIAnalysis.startTest(gender);
            }
            return;
        }
        
        UI.answers = [];
        UI.currentQuestionIndex = 0;
        UI.clearProgress();
        
        if (this.state.isQuickTest) {
            this.state.isQuickTest = false;
            UI.quickTestWithGender(gender);
            return;
        }
        
        if (!version) {
            console.error('未找到待处理的版本信息');
            return;
        }
        
        const questions = await this.loadQuestions(version);
        
        if (questions.length === 0) {
            console.error('题目加载失败！');
            this.showError('题目加载失败，请刷新页面重试');
            return;
        }
        
        await UI.init(questions);
        UI.startTest();
    },

    /**
     * 快速测试 - 直接模拟答题并跳转到结果页（不需要选择性别）
     */
    quickTest: async function() {
        this.state.isQuickTest = true;
        
        await UI.loadCharactersData();
        
        // 随机选择题库版本
        const versions = ['200', '90', '200-genshin', '90-genshin'];
        const randomVersion = versions[Math.floor(Math.random() * versions.length)];
        
        const questions = await this.loadQuestions(randomVersion);
        if (questions.length > 0) {
            UI.questions = questions;
            UI.answers = new Array(questions.length).fill(null);
        }
        
        const randomGender = Math.random() > 0.5 ? 'male' : 'female';
        this.state.gender = randomGender;
        
        UI.quickTestWithGender(randomGender);
    },
    
    /**
     * 全流程测试 - 使用专门的20题测试题库模拟完整答题流程
     */
    fullFlowTest: async function() {
        console.log('========== 开始全流程测试 ==========');
        
        await UI.loadCharactersData();
        
        // 加载专门的20题测试题库
        const testQuestions = await this.loadQuestions('20-genshin');
        if (!testQuestions || testQuestions.length === 0) {
            console.error('题目加载失败！');
            this.showError('题目加载失败，请刷新页面重试');
            return;
        }
        
        console.log('加载测试题目:', testQuestions.length, '题');
        
        // 随机选择性别
        const randomGender = Math.random() > 0.5 ? 'male' : 'female';
        this.state.gender = randomGender;
        console.log('选择性别:', randomGender);
        
        // 初始化答题页面
        UI.questions = testQuestions;
        UI.answers = new Array(testQuestions.length).fill(null);
        UI.currentQuestionIndex = 0;
        
        // 显示答题页面
        await UI.init(testQuestions);
        UI.startTest();
        
        console.log('========== 全流程测试初始化完成 ==========');
        console.log('提示: 答题页面已显示，请手动答题测试');
        console.log('或打开控制台执行: GenshinMBTI.autoAnswerAll() 自动答题');
    },
    
    /**
     * 自动答题 - 模拟用户选择（全部选择右侧选项）
     * @param {string} side - 'right' 全选右侧, 'left' 全选左侧, 'random' 随机
     */
    autoAnswerAll: function(side = 'right') {
        console.log('========== 开始自动答题 ==========');
        console.log('答题策略:', side === 'right' ? '全选右侧' : (side === 'left' ? '全选左侧' : '随机'));
        
        const questions = AnswerPage.questions;
        if (!questions || questions.length === 0) {
            console.error('没有题目可答！');
            return;
        }
        
        // 模拟答题
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            let coordinate;
            
            if (side === 'right') {
                coordinate = 3; // 最右侧
            } else if (side === 'left') {
                coordinate = -3; // 最左侧
            } else {
                const coordinates = [-3, -2, -1, 1, 2, 3];
                coordinate = coordinates[Math.floor(Math.random() * coordinates.length)];
            }
            
            AnswerPage.answers[i] = {
                questionId: question.id,
                coordinate: coordinate,
                optionA: { character_type: question.options[0].character_type },
                optionB: { character_type: question.options[1].character_type }
            };
        }
        
        console.log('答题完成！答案:', AnswerPage.answers);
        console.log('答案统计: 已答', AnswerPage.answers.filter(a => a !== null).length, '题');
        
        // 跳转到最后一题
        AnswerPage.currentIndex = questions.length - 1;
        AnswerPage.renderQuestion(AnswerPage.currentIndex);
        
        console.log('========== 自动答题完成 ==========');
    },

    /**
     * 加载题目
     * 
     * @param {string} version - 题库版本 ('200', '90', '200-genshin', '90-genshin', '20-genshin')
     */
    loadQuestions: async function(version) {
        console.log('========== [步骤3] loadQuestions 被调用 ==========');
        console.log('[步骤3] 接收到的 version 参数:', version, '类型:', typeof version);
        
        this.state.questionVersion = version;
        
        let fileName;
        let isGenshin = false;
        
        console.log('[步骤3] 开始匹配版本...');
        
        if (version === '200-genshin') {
            console.log('[步骤3] 匹配到: 200-genshin');
            fileName = 'data/questions/genshin/mbti-200.json';
            isGenshin = true;
        } else if (version === '90-genshin') {
            console.log('[步骤3] 匹配到: 90-genshin');
            fileName = 'data/questions/genshin/mbti-90.json';
            isGenshin = true;
        } else if (version === '20-genshin') {
            console.log('[步骤3] 匹配到: 20-genshin');
            fileName = 'data/questions/genshin/mbti-20.json';
            isGenshin = true;
        } else if (version === '172') {
            console.log('[步骤3] 匹配到: 172');
            fileName = 'data/questions/original/mbti-172.json';
        } else if (version === '106') {
            console.log('[步骤3] 匹配到: 106');
            fileName = 'data/questions/original/mbti-106.json';
        } else if (version === '90') {
            console.log('[步骤3] 匹配到: 90');
            fileName = 'data/questions/original/mbti-90.json';
        } else {
            console.log('[步骤3] 未匹配到任何版本！使用默认: 200');
            console.log('[步骤3] version值:', JSON.stringify(version));
            fileName = 'data/questions/original/mbti-200.json';
        }
        
        console.log('[步骤3] 最终选择的文件路径:', fileName);
        
        this.state.isGenshinVersion = isGenshin;
        
        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            
            if (typeof QuestionLoader !== 'undefined') {
                this.state.questions = QuestionLoader.loadFromJson(jsonData);
            } else {
                console.error('QuestionLoader 未定义');
                this.state.questions = this.fallbackLoad(jsonData);
            }
            
            console.log(`成功加载 ${this.state.questions.length} 道题目 (${version}版本)`);
            return this.state.questions;
        } catch (error) {
            console.error('加载题目失败:', error);
            this.state.questions = [];
            return [];
        }
    },

    /**
     * 备用加载方法
     * 
     * @param {Object} jsonData - JSON数据
     * @returns {Array} 题目数组
     */
    fallbackLoad: function(jsonData) {
        if (!jsonData || !jsonData.data || !jsonData.data.list || !Array.isArray(jsonData.data.list)) return [];
        
        return jsonData.data.list.map((q, index) => ({
            id: q.id.toString(),
            text: q.name,
            type: 'choice',
            options: q.option.map(opt => ({
                id: opt.id.toString(),
                text: opt.name,
                characterType: opt.character_type
            })),
            originalIndex: index
        }));
    },

    /**
     * 显示欢迎页面
     */
    showWelcome: function() {
        UI.showPage('welcome');
    },

    /**
     * 获取当前进度
     * 
     * @returns {Object} 进度信息对象
     */
    getProgress: function() {
        const answered = this.state.answers.filter(a => a !== null).length;
        const total = this.state.questions.length;
        return {
            answered: answered,
            total: total,
            percentage: (answered / total) * 100
        };
    },

    /**
     * 导出结果
     * 
     * @returns {string} JSON格式的结果字符串
     */
    exportResult: function() {
        return JSON.stringify(this.state.result, null, 2);
    },

    /**
     * 获取历史记录
     * 
     * @returns {Array} 历史记录数组
     */
    getHistory: function() {
        return JSON.parse(localStorage.getItem('genshin_mbti_history') || '[]');
    },

    /**
     * 清除所有数据
     */
    clearAllData: function() {
        localStorage.removeItem('genshin_mbti_progress');
        localStorage.removeItem('genshin_mbti_history');
        localStorage.removeItem('genshin_mbti_latest_result');
        this.state.answers = [];
        this.state.result = null;
        this.state.gender = null;
        this.state.pendingVersion = null;
        console.log('所有数据已清除');
    },

    /**
     * 显示错误信息
     * 
     * @param {string} message - 错误信息
     */
    showError: function(message) {
        const container = document.getElementById('question-container');
        if (container) {
            container.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">[!]</div>
                    <div style="color: var(--pyro); margin-bottom: 1rem;">${message}</div>
                    <button class="btn btn-primary" onclick="location.reload()">刷新页面</button>
                </div>
            `;
        }
    }
};

// 挂载到全局对象
window.GenshinMBTI = GenshinMBTI;

document.addEventListener('DOMContentLoaded', function() {
    GenshinMBTI.init();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GenshinMBTI;
}
