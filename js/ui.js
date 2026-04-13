// 版本号: v1.0.0
/**
 * 原神版MBTI - UI交互模块
 * 
 * 功能: 处理页面渲染、用户交互、动画效果等界面相关操作
 */

// 加载消息常量（省略号由程序动态添加）
const LOADING_MESSAGES = [
    '正在感知你的元素之力',
    '正在与神之眼共鸣',
    '正在解读你的命运轨迹',
    '正在连接提瓦特的元素',
    '正在聆听风神的指引',
    '正在唤醒沉睡的记忆',
    '正在探索你的内心世界',
    '正在与地脉建立连接',
    '正在解析你的灵魂密码',
    '正在召唤元素精灵',
    '正在绘制你的命运星图',
    '正在穿越时空的迷雾',
    '正在向七天神像祈祷',
    '正在寻找失落的神瞳',
    '正在激活传送锚点',
    '正在解锁尘歌壶的秘密',
    '正在与派蒙确认身份',
    '正在向凯瑟琳报到',
    '冒险家协会正在审核资质',
    '正在计算原石储备',
    '正在检查树脂恢复情况',
    '正在确认深渊通关记录',
    '正在分析圣遗物副词条',
    '正在优化队伍配置',
    '正在调整角色天赋加点',
    '正在突破世界等级',
    '正在探索未解锁区域',
    '正在完成每日委托',
    '正在领取月卡奖励',
    '正在参与限时活动',
    '正在挑战周本BOSS',
    '正在收集角色突破材料',
    '正在锻造四星武器',
    '正在研究元素反应机制',
    '正在学习角色连招技巧',
    '正在规划抽卡策略',
    '正在计算保底进度',
    '原来你也玩原神',
    '正在加载提瓦特地图',
    '正在与钟离品茶论道',
    '正在听温迪弹琴唱歌',
    '正在陪可莉炸鱼',
    '正在帮胡桃推销往生堂',
    '正在和赛诺讲冷笑话',
    '正在看雷电将军做饭',
    '正在陪八重神子写小说',
    '正在和纳西妲讨论哲学',
    '正在帮芙宁娜选剧本',
    '正在和那维莱特审判',
    '正在听林尼变魔术',
    '正在和闲云学风水',
    '正在帮嘉明舞狮',
    '正在和闲云一起飞翔',
    '正在探索枫丹水下世界',
    '正在挑战深渊咏者',
    '正在躲避丘丘人巡逻',
    '正在与遗迹守卫周旋',
    '正在破解元素方碑谜题',
    '正在收集风神瞳',
    '正在寻找岩神瞳',
    '正在追踪雷神瞳',
    '正在探索草神瞳',
    '正在收集水神瞳',
    '正在解锁传送点',
    '正在激活秘境入口',
    '正在完成世界任务',
    '正在解锁隐藏成就',
    '正在收集珍贵宝箱',
    '正在挑战无相系列',
    '正在讨伐周常BOSS',
    '正在完成纪行任务',
    '正在领取活动奖励',
    '正在参与联机冒险',
    '正在帮助萌新开荒',
    '正在挑战高难副本',
    '正在研究配队攻略',
    '正在观看角色演示',
    '正在聆听角色语音',
    '正在阅读角色故事',
    '正在欣赏游戏风景',
    '正在截图留念',
    '正在录制精彩瞬间',
    '正在分享游戏心得',
    '正在期待新版本更新',
    '正在猜测新角色技能',
    '正在规划原石使用',
    '正在计算抽卡概率',
    '正在祈祷十连双黄',
    '正在期待小保底不歪',
    '正在为大保底攒原石',
    '正在完成成就收集',
    '正在解锁全图鉴',
    '正在追求满命满精',
    '正在挑战速通记录',
    '正在研究无伤打法',
    '正在探索游戏彩蛋',
    '正在发现隐藏剧情',
    '正在解锁角色名片',
    '正在收集角色皮肤',
    '正在装饰尘歌壶',
    '正在拜访好友洞天',
    '正在制作摆设套装',
    '正在完成洞天任务',
    '正在领取洞天宝钱',
    '正在优化角色配装',
    '正在计算伤害期望',
    '正在研究元素附着',
    '正在掌握输出循环',
    '正在练习角色操作',
    '正在提升游戏理解',
    '正在享受提瓦特之旅',
    '旅行者，你的命运即将揭晓'
];

const UI = {
    /**
     * 当前页面状态
     */
    currentPage: 'welcome',

    /**
     * 登录状态
     */
    isLoggedIn: false,
    username: null,

    /**
     * 待执行的操作（登录后执行）
     */
    pendingAction: null,

    /**
     * 当前题目索引
     */
    currentQuestionIndex: 0,

    /**
     * 最后答题位置（用于"回到最后"功能）
     */
    lastAnsweredIndex: -1,

    /**
     * 用户答案存储
     */
    answers: [],

    /**
     * 题目列表
     */
    questions: [],

    /**
     * 人物数据
     */
    charactersData: null,

    /**
     * MBTI类型与角色映射数据
     */
    mbtiMapping: null,

    /**
     * 当前语言（cn/jp）
     */
    currentLang: 'cn',

    /**
     * 当前音频播放器
     */
    currentAudio: null,

    /**
     * 当前播放的按钮
     */
    currentPlayingBtn: null,

    /**
     * 初始化UI
     * 
     * @param {Array} questionList - 题目列表
     */
    init: async function (questionList) {
        this.questions = questionList;
        this.answers = new Array(questionList.length).fill(null);
        this.currentQuestionIndex = 0;
        
        // 检查登录状态
        await this.checkLoginStatus();
        
        // 不在这里加载进度，由 AnswerPage 在答题时处理
        this.loadCharactersData();
    },

    /**
     * 检查登录状态
     * 
     * @returns {Promise<boolean>} 是否已登录
     */
    checkLoginStatus: async function () {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();

            if (data.loggedIn) {
                this.isLoggedIn = true;
                this.username = data.username;
                console.log('[登录状态] 已登录:', this.username);
                return true;
            } else {
                this.isLoggedIn = false;
                this.username = null;
                console.log('[登录状态] 未登录');
                return false;
            }
        } catch (error) {
            console.error('[登录状态] 检查失败:', error);
            this.isLoggedIn = false;
            this.username = null;
            return false;
        }
    },

    /**
     * 加载初始化数据（仅加载欢迎页面需要的少量数据）
     */
    loadCharactersData: async function () {
        try {
            const response = await fetch('data/about_test.json');
            if (response.ok) {
                this.aboutTestData = await response.json();
                this.renderAboutTest();
                console.log('初始化数据加载完成');
            }
        } catch (e) {
            console.error('加载初始化数据失败:', e);
        }
    },

    /**
     * 渲染关于本测试部分
     */
    renderAboutTest: function () {
        const container = document.querySelector('.info-section');
        if (!container || !this.aboutTestData) return;

        let html = `<h3>${this.aboutTestData.title}</h3><ul>`;
        this.aboutTestData.items.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
    },

    /**
     * 绑定事件监听器
     */
    bindEvents: function () {
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));

        // 初始化直接查看结果弹窗事件
        this.initDirectResultModalEvents();

        // 初始化登录弹窗事件
        this.initLoginModalEvents();

        // 检查是否有历史结果
        this.checkHistoryResult();

        window.addEventListener('beforeunload', (e) => {
            if (this.answers.some(a => a !== null)) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    },

    /**
     * 处理点击事件
     * 
     * @param {Event} e - 点击事件对象
     */
    handleClick: function (e) {
        const target = e.target;

        if (target.closest('[data-action="start-test"]')) {
            const btn = target.closest('[data-action="start-test"]');
            const version = btn.dataset.version;
            console.log('========== [步骤0] 点击版本按钮 ==========');
            console.log('[步骤0] 按钮元素:', btn);
            console.log('[步骤0] data-version 属性:', version);
            console.log('[步骤0] dataset 完整内容:', JSON.stringify(btn.dataset));
            this.requireLogin(() => GenshinMBTI.startTest(version));
        } else if (target.closest('[data-action="quick-test"]')) {
            this.requireLogin(() => this.quickTest());
        } else if (target.closest('[data-action="full-flow-test"]')) {
            this.requireLogin(() => this.fullFlowTest());
        } else if (target.closest('[data-action="prev-question"]')) {
            this.prevQuestion();
        } else if (target.closest('[data-action="next-question"]')) {
            this.nextQuestion();
        } else if (target.closest('[data-action="go-to-last"]')) {
            this.goToLastQuestion();
        } else if (target.closest('[data-action="submit-test"]')) {
            this.submitTest();
        } else if (target.closest('[data-action="restart"]')) {
            this.restart();
        } else if (target.closest('[data-action="go-home"]')) {
            this.goHome();
        } else if (target.closest('[data-action="share"]')) {
            this.shareResult();
        } else if (target.closest('[data-action="export-answers"]')) {
            this.requireLogin(() => this.showExportModal('answers'));
        } else if (target.closest('[data-action="export-report"]')) {
            this.requireLogin(() => this.showExportModal('report'));
        } else if (target.closest('[data-action="show-import-modal"]')) {
            this.requireLogin(() => this.showImportModal());
        } else if (target.closest('[data-action="save-progress"]')) {
            this.saveProgress();
        } else if (target.closest('[data-action="confirm-gender"]')) {
            const gender = target.closest('[data-action="confirm-gender"]').dataset.gender;
            GenshinMBTI.confirmGenderAndStart(gender);
        } else if (target.closest('[data-action="continue-progress"]')) {
            this.continueProgress();
        } else if (target.closest('[data-action="restart-progress"]')) {
            this.restartProgress();
        } else if (target.closest('.dot-btn')) {
            AnswerPage.handleDotClick(target.closest('.dot-btn'));
        } else if (target.closest('.option-btn')) {
            this.selectOption(target.closest('.option-btn'));
        } else if (target.closest('.likert-option')) {
            this.selectLikert(target.closest('.likert-option'));
        } else if (target.closest('.element-card')) {
            this.showTraitModal(target.closest('.element-card'));
        } else if (target.closest('.trait-modal') && !target.closest('.trait-modal-content')) {
            this.hideTraitModal();
        } else if (target.closest('#login-modal') && !target.closest('.gender-modal')) {
            this.hideLoginModal();
        } else if (target.closest('.gender-modal-overlay') && !target.closest('.gender-modal')) {
            this.hideGenderModal();
        } else if (target.closest('[data-action="show-direct-result-modal"]')) {
            this.requireLogin(() => this.showDirectResultModal());
        } else if (target.closest('.direct-result-modal-overlay') && !target.closest('.direct-result-modal')) {
            this.hideDirectResultModal();
        } else if (target.closest('[data-action="show-last-result"]')) {
            this.requireLogin(() => this.showLastResult());
        } else if (target.closest('[data-action="start-ai-test"]')) {
            this.requireLogin(() => this.startAITest());
        } else if (target.closest('[data-action="start-ai-quick"]')) {
            this.requireLogin(() => this.startAITestQuick(10));
        } else if (target.closest('[data-action="start-ai-precise"]')) {
            this.requireLogin(() => this.startAITestQuick(25));
        } else if (target.closest('[data-action="ai-fixed-test"]')) {
            this.requireLogin(() => this.startAIFixedTest());
        } else if (target.closest('[data-action="show-debug-modal"]')) {
            this.showDebugModal();
        } else if (target.closest('#debug-cancel')) {
            this.hideDebugModal();
        } else if (target.closest('#debug-confirm')) {
            this.handleDebugConfirm();
        } else if (target.closest('#debug-modal') && !target.closest('.direct-result-modal')) {
            this.hideDebugModal();
        }
    },

    /**
     * 处理键盘事件
     * 
     * @param {KeyboardEvent} e - 键盘事件对象
     */
    handleKeydown: function (e) {
        if (this.currentPage !== 'test') return;

        switch (e.key) {
            case 'ArrowLeft':
                this.prevQuestion();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                const likertOptions = document.querySelectorAll('.likert-option');
                const idx = parseInt(e.key) - 1;
                if (likertOptions[idx]) {
                    this.selectLikert(likertOptions[idx]);
                }
                break;
            case 'a':
            case 'A':
                const dotA = document.querySelector('.dot-btn[data-side="left"]');
                if (dotA) AnswerPage.handleDotClick(dotA);
                break;
            case 'b':
            case 'B':
                const dotB = document.querySelector('.dot-btn[data-side="right"]');
                if (dotB) AnswerPage.handleDotClick(dotB);
                break;
            case 'ArrowLeft':
                const dotLeft = document.querySelector('.dot-btn[data-side="left"]');
                if (dotLeft) AnswerPage.handleDotClick(dotLeft);
                break;
            case 'ArrowRight':
                const dotRight = document.querySelector('.dot-btn[data-side="right"]');
                if (dotRight) AnswerPage.handleDotClick(dotRight);
                break;
        }
    },

    /**
     * 显示指定页面
     * 
     * @param {string} pageName - 页面名称
     */
    showPage: function (pageName) {
        console.log('[showPage] 切换到页面:', pageName);
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            window.scrollTo(0, 0);
            console.log('[showPage] 页面已激活:', pageName);

            this.switchBackground(pageName);

            const toolbar = document.getElementById('float-toolbar');
            if (toolbar) {
                if (pageName !== 'result') {
                    toolbar.classList.remove('show');
                }
            }
        } else {
            console.error('[showPage] 找不到页面元素:', `${pageName}-page`);
        }
    },

    /**
     * 切换页面背景
     * 
     * @param {string} pageName - 页面名称
     */
    switchBackground: function (pageName) {
        const videoBg = document.getElementById('video-background');
        const body = document.body;

        if (pageName === 'test') {
            if (videoBg) videoBg.style.display = 'none';
            body.classList.add('test-page-bg');
            body.classList.remove('ai-analysis-bg');
        } else if (pageName === 'result') {
            if (videoBg) videoBg.style.display = 'none';
            body.classList.remove('test-page-bg');
            body.classList.remove('ai-analysis-bg');
        } else if (pageName === 'ai-analysis') {
            if (videoBg) videoBg.style.display = 'none';
            body.classList.remove('test-page-bg');
            body.classList.add('ai-analysis-bg');
        } else {
            if (videoBg) videoBg.style.display = 'block';
            body.classList.remove('test-page-bg');
            body.classList.remove('ai-analysis-bg');
        }
    },

    /**
     * 显示性别选择弹窗
     */
    showGenderModal: function () {
        const modal = document.getElementById('gender-modal');
        const versionNameEl = document.getElementById('gender-modal-version-name');

        if (modal) {
            modal.classList.add('show');

            if (versionNameEl) {
                if (GenshinMBTI.state.isQuickTest) {
                    versionNameEl.textContent = '快速测试（模拟答题）';
                } else if (GenshinMBTI.state.pendingVersion) {
                    const versionNames = {
                        '200': '200题完整版',
                        '90': '93题标准版',
                        '200-genshin': '200题原神高手版',
                        '90-genshin': '93题原神标准版'
                    };
                    versionNameEl.textContent = versionNames[GenshinMBTI.state.pendingVersion] || GenshinMBTI.state.pendingVersion;
                }
            }

            // 普通答题不需要滚动检测，确保性别选择区域是启用状态
            const genderSection = document.getElementById('ai-gender-select-section');
            if (genderSection) {
                genderSection.classList.remove('disabled');
                const options = genderSection.querySelectorAll('.gender-modal-option');
                options.forEach(opt => opt.classList.remove('disabled'));
            }
        }
    },

    /**
     * 隐藏性别选择弹窗
     */
    hideGenderModal: function () {
        console.log('========== [hideGenderModal] 被调用 ==========');
        console.log('[hideGenderModal] 调用前的 pendingVersion:', GenshinMBTI.state.pendingVersion);
        const modal = document.getElementById('gender-modal');
        if (modal) {
            modal.classList.remove('show');
            console.log('[hideGenderModal] 即将把 pendingVersion 设为 null');
            GenshinMBTI.state.pendingVersion = null;
            const normalTips = document.getElementById('normal-test-tips');
            const aiTips = document.getElementById('ai-test-tips');
            if (normalTips) normalTips.style.display = 'block';
            if (aiTips) aiTips.style.display = 'none';

            this.resetAITipsScrollCheck();
        }
        console.log('[hideGenderModal] 调用后的 pendingVersion:', GenshinMBTI.state.pendingVersion);
    },

    /**
     * 检查普通答题是否有保存的进度
     * 
     * @returns {Object|null} 进度数据或null
     */
    /**
     * 检查是否有保存的进度（包括服务器）
     * 
     * @returns {Promise<Object|null>} 进度数据或null
     */
    checkNormalProgress: async function () {
        // 如果已登录，优先从服务器检查
        if (this.isLoggedIn) {
            try {
                const response = await fetch('/api/user/progress/normal');
                const data = await response.json();

                if (data.success && data.hasProgress && data.data) {
                    const progress = data.data;
                    // 检查是否有有效答案
                    const hasAnswers = progress.answers && progress.answers.some(a => a !== null && a !== undefined);
                    if (hasAnswers && progress.questionSet) {
                        return progress;
                    }
                }
            } catch (e) {
                console.error('[进度检查] 从服务器检查失败:', e);
            }
        }

        // 如果服务器没有进度或未登录，检查本地存储
        try {
            const saved = localStorage.getItem('mbti_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                // 检查是否有有效答案
                const hasAnswers = progress.answers && progress.answers.some(a => a !== null && a !== undefined);
                if (hasAnswers && progress.questionSet) {
                    return progress;
                }
            }
        } catch (e) {
            console.error('检查进度失败:', e);
        }
        return null;
    },

    /**
     * 显示断点续答提示弹窗（复用性别选择弹窗样式）
     * 
     * @param {Object} progress - 保存的进度数据
     * @param {string} type - 类型 'normal' 或 'ai'
     */
    showProgressPrompt: function (progress, type) {
        const modal = document.getElementById('gender-modal');
        if (!modal) return;

        const savedTime = progress.savedAt ? new Date(progress.savedAt).toLocaleString('zh-CN') : '未知';
        let infoHtml = '';

        if (type === 'normal') {
            const answeredCount = progress.answers ? progress.answers.filter(a => a !== null && a !== undefined).length : 0;
            const totalCount = progress.answers ? progress.answers.length : 0;
            infoHtml = `
                您在 <strong>${savedTime}</strong> 有一个未完成的测试<br>
                题库: <strong>${progress.questionSet}</strong><br>
                已完成 <strong>${answeredCount}</strong> / <strong>${totalCount}</strong> 题
            `;
        } else if (type === 'ai') {
            const answeredCount = Object.keys(progress.answers || {}).length;
            const totalCount = progress.questions ? progress.questions.length : 0;
            infoHtml = `
                您在 <strong>${savedTime}</strong> 有一个未完成的AI测试<br>
                已完成 <strong>${answeredCount}</strong> / <strong>${totalCount}</strong> 题
            `;
        }

        // 修改弹窗内容
        const titleEl = modal.querySelector('.gender-modal-title');
        if (titleEl) titleEl.textContent = '发现未完成的测试';

        const versionDiv = document.getElementById('gender-modal-version');
        if (versionDiv) {
            versionDiv.innerHTML = `
                <div style="text-align: center; padding: 10px 0; line-height: 1.8;">
                    ${infoHtml}
                </div>
            `;
            versionDiv.style.display = 'block';
        }

        // 隐藏普通提示和AI提示
        const normalTips = document.getElementById('normal-test-tips');
        const aiTips = document.getElementById('ai-test-tips');
        if (normalTips) normalTips.style.display = 'none';
        if (aiTips) aiTips.style.display = 'none';

        // 修改性别选择区域为继续/重新开始按钮
        const genderSection = document.getElementById('ai-gender-select-section');
        if (genderSection) {
            genderSection.innerHTML = `
                <div class="gender-select-title">请选择操作</div>
                <div class="gender-modal-options">
                    <div class="gender-modal-option" data-action="continue-progress" style="width: 180px; height: 80px;">
                        <div class="gender-icon" style="font-size: 24px;">▶</div>
                        <div class="gender-label">继续答题</div>
                    </div>
                    <div class="gender-modal-option" data-action="restart-progress" style="width: 180px; height: 80px;">
                        <div class="gender-icon" style="font-size: 24px;">↻</div>
                        <div class="gender-label">重新开始</div>
                    </div>
                </div>
            `;
        }

        modal.classList.add('show');
        modal.dataset.progressType = type;
    },

    /**
     * 恢复性别选择弹窗的原始内容
     */
    resetGenderModal: function () {
        const modal = document.getElementById('gender-modal');
        if (!modal) return;

        const titleEl = modal.querySelector('.gender-modal-title');
        if (titleEl) titleEl.textContent = '开始测试';

        const versionDiv = document.getElementById('gender-modal-version');
        if (versionDiv) {
            versionDiv.innerHTML = `
                <span class="version-label">已选题库：</span>
                <span class="version-name" id="gender-modal-version-name">-</span>
            `;
        }

        const genderSection = document.getElementById('ai-gender-select-section');
        if (genderSection) {
            genderSection.innerHTML = `
                <div class="gender-select-title">请选择你的性别</div>
                <div class="gender-select-subtitle">这将影响匹配的角色结果</div>
                <div class="gender-modal-options">
                    <div class="gender-modal-option" data-gender="male" data-action="confirm-gender">
                        <div class="gender-icon">♂</div>
                        <div class="gender-label">男性</div>
                    </div>
                    <div class="gender-modal-option" data-gender="female" data-action="confirm-gender">
                        <div class="gender-icon">♀</div>
                        <div class="gender-label">女性</div>
                    </div>
                </div>
            `;
        }

        const normalTips = document.getElementById('normal-test-tips');
        if (normalTips) normalTips.style.display = 'block';

        delete modal.dataset.progressType;
    },

    /**
     * 继续答题（断点续答）
     */
    continueProgress: async function () {
        const modal = document.getElementById('gender-modal');
        const progressType = modal ? modal.dataset.progressType : '';

        this.hideGenderModal();
        this.resetGenderModal();

        if (progressType === 'normal') {
            // 普通答题断点续答
            const progress = await this.checkNormalProgress();
            if (progress && progress.questionSet) {
                // 根据 questionSet 确定 version
                let version;
                const questionSet = progress.questionSet;
                if (questionSet.includes('genshin')) {
                    version = questionSet.replace('mbti-', '') + '-genshin';
                } else {
                    version = questionSet.replace('mbti-', '');
                }

                // 设置性别
                if (progress.gender) {
                    GenshinMBTI.state.gender = progress.gender;
                    localStorage.setItem('mbti_gender', progress.gender);
                }

                // 设置导入数据
                GenshinMBTI.state.pendingImportData = progress;

                // 加载题库
                const questions = await GenshinMBTI.loadQuestions(version);
                if (questions.length > 0) {
                    this.init(questions);
                    this.startTest();
                } else {
                    alert('题库加载失败');
                }
            }
        } else if (progressType === 'ai') {
            // AI答题断点续答
            const saved = localStorage.getItem('ai_analysis_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                if (window.AIAnalysis && typeof window.AIAnalysis.loadImportedData === 'function') {
                    window.AIAnalysis.loadImportedData(progress);
                }
            }
        }
    },

    /**
     * 重新开始（清除进度）
     */
    restartProgress: function () {
        const modal = document.getElementById('gender-modal');
        const progressType = modal ? modal.dataset.progressType : '';

        // 清除进度
        if (progressType === 'normal') {
            localStorage.removeItem('mbti_progress');
        } else if (progressType === 'ai') {
            localStorage.removeItem('ai_analysis_progress');
        }

        // 先重置弹窗内容为性别选择
        this.resetGenderModal();

        // 根据类型显示相应的界面
        if (progressType === 'normal') {
            // 普通答题：设置 pendingVersion 并显示性别选择弹窗
            // 注意：需要恢复 pendingVersion，因为 resetGenderModal 会清除它
            if (GenshinMBTI && GenshinMBTI.state) {
                // 恢复默认版本
                GenshinMBTI.state.pendingVersion = '200-genshin';
            }
            // 弹窗已经是性别选择内容，直接显示
            modal.classList.add('show');
        } else if (progressType === 'ai') {
            // AI答题：隐藏弹窗后显示模式选择
            this.hideGenderModal();
            if (window.AIAnalysis) {
                window.AIAnalysis.showModeSelectModal();
            }
        }
    },

    /**
     * 开始测试
     */
    startTest: function () {
        this.showPage('test');
        AnswerPage.init(this.questions);

        // 设置题库版本
        if (window.GenshinMBTI && window.GenshinMBTI.state.questionVersion) {
            AnswerPage.questionVersion = window.GenshinMBTI.state.questionVersion;
        }

        // 检查是否有导入数据
        const importData = window.GenshinMBTI && window.GenshinMBTI.state.pendingImportData;
        if (importData && importData.answers) {
            // 恢复导入的答案
            const savedAnswers = importData.answers;
            for (let i = 0; i < savedAnswers.length && i < AnswerPage.questions.length; i++) {
                const savedAnswer = savedAnswers[i];
                if (savedAnswer !== null && savedAnswer !== undefined) {
                    const question = AnswerPage.questions[i];
                    const coordinate = typeof savedAnswer === 'number' ? savedAnswer : savedAnswer.coordinate;

                    if (coordinate !== undefined && coordinate !== null) {
                        AnswerPage.answers[i] = {
                            questionId: question.id,
                            coordinate: coordinate,
                            optionA: {
                                character_type: question.options ? question.options[0].character_type : 'A'
                            },
                            optionB: {
                                character_type: question.options ? question.options[1].character_type : 'B'
                            }
                        };
                        AnswerPage.lastAnsweredIndex = i;
                    }
                }
            }
            // 清除导入数据
            window.GenshinMBTI.state.pendingImportData = null;
        }

        // 如果有恢复的进度，定位到第一道未答题
        let startIndex = 0;
        if (AnswerPage.answers && AnswerPage.answers.length > 0) {
            // 找到第一道未答题
            for (let i = 0; i < AnswerPage.answers.length; i++) {
                if (AnswerPage.answers[i] === null) {
                    startIndex = i;
                    break;
                }
            }
            // 如果所有题都答了，跳到最后一题
            if (startIndex === 0 && AnswerPage.answers.every(a => a !== null)) {
                startIndex = AnswerPage.answers.length - 1;
            }
        }

        AnswerPage.renderQuestion(startIndex);
        this.updateProgress();
    },

    /**
     * 上一题
     */
    prevQuestion: function () {
        AnswerPage.prevQuestion();
        this.currentQuestionIndex = AnswerPage.currentIndex;
        this.lastAnsweredIndex = AnswerPage.lastAnsweredIndex;
        this.updateProgress();
    },

    /**
     * 下一题
     */
    nextQuestion: function () {
        AnswerPage.nextQuestion();
        this.currentQuestionIndex = AnswerPage.currentIndex;
        this.updateProgress();
    },

    /**
     * 回到最后答题位置
     */
    goToLastQuestion: function () {
        AnswerPage.goToLast();
        this.currentQuestionIndex = AnswerPage.currentIndex;
        this.lastAnsweredIndex = AnswerPage.lastAnsweredIndex;
        this.updateProgress();
    },

    /**
     * 更新进度条
     */
    updateProgress: function () {
        const progressFill = document.getElementById('progress-fill');
        const questionCounter = document.getElementById('questionCounter');

        // 从 AnswerPage 获取答题数据
        const answers = typeof AnswerPage !== 'undefined' ? AnswerPage.answers : this.answers;
        const currentIndex = typeof AnswerPage !== 'undefined' ? AnswerPage.currentIndex : this.currentQuestionIndex;
        const total = this.questions.length;

        const answered = answers.filter(a => a !== null).length;
        const percentage = (answered / total) * 100;

        if (progressFill) {
            progressFill.style.width = `${percentage.toFixed(1)}%`;
        }

        if (questionCounter) {
            questionCounter.textContent = `${currentIndex + 1} / ${total}`;
        }
    },

    /**
     * 提交测试
     */
    submitTest: function () {
        AnswerPage.submitTest();
    },

    /**
     * 显示计算中页面
     */
    showCalculatingPage: function () {
        const self = this;
        const answers = AnswerPage.answers || this.answers;
        const questions = AnswerPage.questions || this.questions;

        console.log('========== [showCalculatingPage] 开始 ==========');
        console.log('[showCalculatingPage] 性别:', GenshinMBTI.state.gender);
        console.log('[showCalculatingPage] 题目数量:', questions.length);
        console.log('[showCalculatingPage] 答案数量:', answers.length);
        console.log('[showCalculatingPage] 已答题数:', answers.filter(a => a !== null).length);
        console.log('[showCalculatingPage] 答卷详情:', JSON.stringify(answers, null, 2));
        console.log('==============================');

        // 隐藏所有页面元素
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        let container = document.getElementById('calculating-page-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'calculating-page-container';
            document.body.appendChild(container);
        }

        console.log('[showCalculatingPage] 创建计算页面容器');

        // 保持视频背景可见，计算页面使用透明背景
        const videoBg = document.getElementById('video-background');
        if (videoBg) {
            videoBg.style.display = 'block';
            videoBg.style.zIndex = '0';
        }

        container.innerHTML = `
            <div class="calculating-page">
                <div class="calculating-card">
                    <div class="mhy-login-platform__loading--rotation">
                        <div></div>
                    </div>
                    <div class="calculating-message" id="calculating-message">${LOADING_MESSAGES[0]}</div>
                </div>
            </div>
        `;

        const progressBar = document.getElementById('calculating-progress-bar');
        const messageEl = document.getElementById('calculating-message');

        const startTime = Date.now();
        const minDuration = 3000;

        let result = null;
        let preloadedAssets = { images: [], audio: null, audioLoaded: false };

        const preloadAssets = async (characterData) => {
            if (!characterData) {
                console.log('预加载: 没有角色数据');
                return;
            }

            console.log('预加载: 开始加载角色素材', characterData.name);
            const imagePromises = [];

            if (characterData.showcase) {
                console.log('预加载: 加载showcase', characterData.showcase);
                const img = new Image();
                img.src = characterData.showcase;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('预加载: showcase加载完成'); resolve(); }; img.onerror = () => { console.log('预加载: showcase加载失败'); resolve(); }; }));
            }

            if (characterData.card) {
                console.log('预加载: 加载card', characterData.card);
                const img = new Image();
                img.src = characterData.card;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('预加载: card加载完成'); resolve(); }; img.onerror = () => { console.log('预加载: card加载失败'); resolve(); }; }));
            }

            if (characterData.mobile_card) {
                console.log('预加载: 加载mobile_card', characterData.mobile_card);
                const img = new Image();
                img.src = characterData.mobile_card;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('预加载: mobile_card加载完成'); resolve(); }; img.onerror = () => { console.log('预加载: mobile_card加载失败'); resolve(); }; }));
            }

            if (characterData.assets?.avatar) {
                console.log('预加载: 加载avatar', characterData.assets.avatar);
                const img = new Image();
                img.src = characterData.assets.avatar;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('预加载: avatar加载完成'); resolve(); }; img.onerror = () => { console.log('预加载: avatar加载失败'); resolve(); }; }));
            }

            if (characterData.assets?.portrait) {
                console.log('预加载: 加载portrait', characterData.assets.portrait);
                const img = new Image();
                img.src = characterData.assets.portrait;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('预加载: portrait加载完成'); resolve(); }; img.onerror = () => { console.log('预加载: portrait加载失败'); resolve(); }; }));
            }

            if (characterData.assets?.name_image) {
                console.log('预加载: 加载name_image', characterData.assets.name_image);
                const img = new Image();
                img.src = characterData.assets.name_image;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('预加载: name_image加载完成'); resolve(); }; img.onerror = () => { console.log('预加载: name_image加载失败'); resolve(); }; }));
            }

            if (characterData.assets?.pattern) {
                console.log('预加载: 加载pattern', characterData.assets.pattern);
                const img = new Image();
                img.src = characterData.assets.pattern;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('预加载: pattern加载完成'); resolve(); }; img.onerror = () => { console.log('预加载: pattern加载失败'); resolve(); }; }));
            }

            if (characterData.voice_lines && characterData.voice_lines.length > 0) {
                const audioSrc = characterData.voice_lines[0].audio;
                console.log('预加载: 发现语音文件', audioSrc);
                if (audioSrc) {
                    preloadedAssets.audio = new Audio(audioSrc);
                    preloadedAssets.audio.volume = 0.7;
                    preloadedAssets.audio.preload = 'auto';

                    const audioPromise = new Promise(resolve => {
                        preloadedAssets.audio.oncanplaythrough = () => {
                            preloadedAssets.audioLoaded = true;
                            console.log('预加载: 语音加载完成');
                            resolve();
                        };
                        preloadedAssets.audio.onerror = (e) => {
                            console.log('预加载: 语音加载失败', e);
                            resolve();
                        };
                        preloadedAssets.audio.load();
                    });
                    imagePromises.push(audioPromise);
                }
            } else {
                console.log('预加载: 没有语音文件');
            }

            await Promise.all(imagePromises);
            console.log('预加载: 所有素材加载完成');
        };

        const calculateResult = async () => {
            console.log('[calculateResult] 开始计算结果...');
            try {
                console.log('[calculateResult] 发送请求到 /api/submit');
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        answers: answers,
                        gender: GenshinMBTI.state.gender,
                        questionVersion: GenshinMBTI.state?.questionVersion
                    })
                });

                console.log('[calculateResult] 收到响应，解析JSON...');
                const data = await response.json();

                if (data.success && data.data) {
                    result = data.data;
                    console.log('[calculateResult] API返回成功，result:', result);
                    console.log('[calculateResult] characterFull:', result.characterFull);
                    console.log('[calculateResult] voice_lines:', result.characterFull?.voice_lines);
                } else {
                    console.error('[calculateResult] API返回错误:', data.error);
                    result = Calculator.calculateResult(answers, GenshinMBTI.state.gender);
                }
            } catch (error) {
                console.error('[calculateResult] 调用API失败，使用本地计算:', error);
                result = Calculator.calculateResult(answers, GenshinMBTI.state.gender);
            }

            if (result?.characterFull) {
                console.log('[calculateResult] 开始预加载角色素材...');
                await preloadAssets(result.characterFull);
                console.log('[calculateResult] 预加载完成');
            } else {
                console.log('[calculateResult] 没有characterFull，跳过预加载');
            }

            self.preGenerateQRCode();
        };

        const showResult = () => {
            console.log('[showResult] 开始显示结果, result:', result);
            if (result) {
                try {
                    self.displayResult(result);
                    self.clearProgress();
                    console.log('[showResult] 结果显示完成');
                } catch (e) {
                    console.error('[showResult] 显示结果失败:', e);
                }
            } else {
                console.error('[showResult] result 为空，无法显示结果');
            }
        };

        const playAudioAndShowResult = () => {
            console.log('playAudioAndShowResult: 检查音频状态', {
                hasAudio: !!preloadedAssets.audio,
                audioLoaded: preloadedAssets.audioLoaded
            });

            if (preloadedAssets.audio && preloadedAssets.audioLoaded) {
                console.log('playAudioAndShowResult: 播放预加载的角色语音');
                preloadedAssets.audio.play().then(() => {
                    console.log('playAudioAndShowResult: 语音播放成功，等待500ms后切换页面');
                    setTimeout(showResult, 500);
                }).catch(e => {
                    console.log('playAudioAndShowResult: 角色语音播放失败:', e);
                    setTimeout(showResult, 300);
                });
            } else {
                console.log('playAudioAndShowResult: 没有预加载的音频，直接显示结果');
                showResult();
            }
        };

        const usedMessages = new Set();
        const getRandomMessage = () => {
            const available = LOADING_MESSAGES.filter((_, i) => !usedMessages.has(i));
            if (available.length === 0) {
                usedMessages.clear();
                return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
            }
            const randomIndex = Math.floor(Math.random() * available.length);
            const originalIndex = LOADING_MESSAGES.indexOf(available[randomIndex]);
            usedMessages.add(originalIndex);
            return available[randomIndex];
        };

        let currentMessage = LOADING_MESSAGES[0];
        let dots = 0;
        let lastDotTime = Date.now();
        const dotInterval = 400;

        const updateUI = () => {
            const elapsed = Date.now() - startTime;
            const now = Date.now();

            if (progressBar) {
                progressBar.style.width = `${Math.min((elapsed / minDuration) * 100, 100)}%`;
            }

            if (now - lastDotTime >= dotInterval) {
                dots++;
                if (dots > 3) {
                    dots = 0;
                    currentMessage = getRandomMessage();
                    console.log('[动画] 切换消息:', currentMessage);
                }
                lastDotTime = now;
                console.log('[动画] 点数更新:', dots, '消息:', currentMessage + '.'.repeat(dots));
            }

            const dotsStr = '.'.repeat(dots);

            if (messageEl) {
                messageEl.textContent = currentMessage + dotsStr;
            }

            if (result && elapsed >= minDuration) {
                playAudioAndShowResult();
                return;
            }

            if (!result || elapsed < minDuration) {
                requestAnimationFrame(updateUI);
            }
        };

        setTimeout(calculateResult, 0);
        requestAnimationFrame(updateUI);
    },

    /**
     * 播放入场音频（角色语音）
     * 
     * @param {Object} result - 计算结果对象
     */
    playEntranceAudio: function (result) {
        try {
            let audioSrc = null;
            const character = result?.characterFull;

            if (character && character.voice_lines && character.voice_lines.length > 0) {
                audioSrc = character.voice_lines[0].audio;
                console.log(`播放角色语音: ${character.name} - ${character.voice_lines[0].content}`);
            }

            if (audioSrc) {
                const audio = new Audio(audioSrc);
                audio.volume = 0.7;
                audio.play().catch(e => {
                    console.log('角色语音播放失败:', e);
                });
            }
        } catch (e) {
            console.log('音频播放失败:', e);
        }
    },

    /**
     * 显示加载状态
     * 
     * @param {string} message - 加载提示信息
     */
    showLoading: function (message) {
        const container = document.getElementById('question-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="element-loading">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div class="loading-text">${message || '加载中...'}</div>
                </div>
            `;
        }
    },

    /**
     * 显示结果
     * 
     * @param {Object} result - 计算结果对象
     */
    displayResult: function (result) {
        console.log('========== [displayResult] 开始 ==========');
        console.log('[displayResult] result:', result);

        const calculatingContainer = document.getElementById('calculating-page-container');
        if (calculatingContainer) {
            calculatingContainer.remove();
            console.log('[displayResult] 已移除计算页面容器');
        }

        this.showPage('result');
        console.log('[displayResult] 已切换到结果页面');

        this.currentResult = result;

        this.applyTemperamentColors(result);

        if (result.isAIAnalysis || result.mode === 'ai') {
            console.log('[displayResult] AI分析模式');
            this.renderAIResult(result);
        } else {
            console.log('[displayResult] 普通模式');
            this.renderCharacterHero(result);
            this.renderResultDetail(result);
        }

        this.saveResult(result);
        console.log('========== [displayResult] 完成 ==========');
    },

    /**
     * 渲染 AI 分析模式的结果
     * 
     * @param {Object} result - AI 分析结果对象
     */
    renderAIResult: function (result) {
        this.renderCharacterHero(result);

        const typeContainer = document.getElementById('result-type');
        if (typeContainer) {
            typeContainer.innerHTML = `
                <div class="ai-result-badge">AI 深度分析</div>
                <div class="mbti-type-display">
                    <span class="mbti-type-code">${result.type}</span>
                    <span class="mbti-type-label">${result.label || result.typeLabel || ''}</span>
                </div>
            `;
        }

        // 处理维度数据：支持两种格式
        if (result.dimensionScores) {
            // 后端返回的格式：dimensionScores.EI.leftScore / rightScore
            const dims = {
                E: result.dimensionScores.EI.rightScore,
                I: result.dimensionScores.EI.leftScore,
                S: result.dimensionScores.SN.leftScore,
                N: result.dimensionScores.SN.rightScore,
                T: result.dimensionScores.TF.leftScore,
                F: result.dimensionScores.TF.rightScore,
                J: result.dimensionScores.JP.leftScore,
                P: result.dimensionScores.JP.rightScore
            };
            this.renderAIDimensionAnalysis(dims);
        } else if (result.dimensions) {
            // 兼容旧格式
            this.renderAIDimensionAnalysis(result.dimensions);
        }

        // 渲染角色信息
        if (result.characterFull) {
            this.renderCharacterInfoCard(result);
        } else if (result.characterMatch) {
            this.renderCharacterInfoCard(result);
        }

        // 渲染详细结果（包含AI分析模块）
        this.renderResultDetail(result);
    },

    /**
     * 渲染 AI 维度分析
     * 
     * @param {Object} dimensions - 维度数据
     */
    renderAIDimensionAnalysis: function (dimensions) {
        const container = document.getElementById('dimension-analysis');
        if (!container) return;

        const dimConfig = [
            { key: 'E', pair: 'I', name: '能量来源', leftLabel: '风（外倾）', rightLabel: '水（内倾）', leftElement: 'anemo', rightElement: 'hydro' },
            { key: 'S', pair: 'N', name: '信息收集', leftLabel: '火（感觉）', rightLabel: '岩（直觉）', leftElement: 'pyro', rightElement: 'geo' },
            { key: 'T', pair: 'F', name: '决策方式', leftLabel: '雷（思考）', rightLabel: '草（情感）', leftElement: 'electro', rightElement: 'dendro' },
            { key: 'J', pair: 'P', name: '生活方式', leftLabel: '冰（判断）', rightLabel: '原（感知）', leftElement: 'cryo', rightElement: 'physical' }
        ];

        let html = '';
        dimConfig.forEach(dim => {
            const leftPercent = dimensions[dim.key] || 50;
            const rightPercent = dimensions[dim.pair] || 50;
            const dominantElement = leftPercent >= rightPercent ? dim.leftElement : dim.rightElement;
            const dominantPercent = Math.max(leftPercent, rightPercent);

            html += `
                <div class="dimension-card">
                    <div class="dimension-header">
                        <span class="dimension-name">${dim.name}</span>
                        <span class="dimension-value">${this.getElementName(dominantElement)}元素 - ${dominantPercent}%</span>
                    </div>
                    <div class="dimension-bar">
                        <div class="dimension-bar-fill left" 
                             style="width: ${leftPercent}%; --element-color-1: var(--${dim.leftElement})"></div>
                        <div class="dimension-bar-fill right" 
                             style="width: ${rightPercent}%; --element-color-2: var(--${dim.rightElement})"></div>
                    </div>
                    <div class="dimension-labels">
                        <span class="dimension-label">
                            <img class="dimension-element-icon" src="assets/images/elements/${dim.leftElement}.png" alt="${this.getElementName(dim.leftElement)}">
                            ${dim.leftLabel} ${leftPercent}%
                        </span>
                        <span class="dimension-label">
                            <img class="dimension-element-icon" src="assets/images/elements/${dim.rightElement}.png" alt="${this.getElementName(dim.rightElement)}">
                            ${dim.rightLabel} ${rightPercent}%
                        </span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * 获取元素名称
     * 
     * @param {string} element - 元素代码
     * @returns {string} 元素名称
     */
    getElementName: function (element) {
        const names = {
            anemo: '风', hydro: '水', pyro: '火', geo: '岩',
            electro: '雷', dendro: '草', cryo: '冰', physical: '原'
        };
        return names[element] || element;
    },

    /**
     * 应用气质类型颜色到结果页面
     * 
     * @param {Object} result - 计算结果对象
     */
    applyTemperamentColors: function (result) {
        console.log('========== [applyTemperamentColors] 开始 ==========');
        let temperamentCode = '';

        if (result.temperamentInfo && result.temperamentInfo.code) {
            temperamentCode = result.temperamentInfo.code;
            console.log('[applyTemperamentColors] 从 result.temperamentInfo.code 获取:', temperamentCode);
        } else if (this.elementTemperamentMapping && result.type) {
            temperamentCode = this.elementTemperamentMapping.type_mapping[result.type] || '';
            console.log('[applyTemperamentColors] 从 elementTemperamentMapping 获取:', temperamentCode);
        }

        console.log('[applyTemperamentColors] 最终 temperamentCode:', temperamentCode);

        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);

        const primary = computedStyle.getPropertyValue('--temperament-' + temperamentCode + '-primary').trim();
        const light = computedStyle.getPropertyValue('--temperament-' + temperamentCode + '-light').trim();
        const dark = computedStyle.getPropertyValue('--temperament-' + temperamentCode + '-dark').trim();
        const lighter = computedStyle.getPropertyValue('--temperament-' + temperamentCode + '-lighter').trim();
        const darker = computedStyle.getPropertyValue('--temperament-' + temperamentCode + '-darker').trim();
        const bgLight = computedStyle.getPropertyValue('--temperament-' + temperamentCode + '-bg-light').trim();
        const bgMedium = computedStyle.getPropertyValue('--temperament-' + temperamentCode + '-bg-medium').trim();
        const bgDark = computedStyle.getPropertyValue('--temperament-' + temperamentCode + '-bg-dark').trim();

        console.log('[applyTemperamentColors] 读取到的颜色值:');
        console.log('  primary:', primary);
        console.log('  bgLight:', bgLight);
        console.log('  bgMedium:', bgMedium);

        root.style.setProperty('--temperament-primary', primary);
        root.style.setProperty('--temperament-light', light);
        root.style.setProperty('--temperament-dark', dark);
        root.style.setProperty('--temperament-lighter', lighter);
        root.style.setProperty('--temperament-darker', darker);
        root.style.setProperty('--temperament-bg-light', bgLight);
        root.style.setProperty('--temperament-bg-medium', bgMedium);
        root.style.setProperty('--temperament-bg-dark', bgDark);

        console.log('[applyTemperamentColors] 已设置CSS变量');
        console.log('========== [applyTemperamentColors] 完成 ==========');
    },

    /**
     * 调整颜色亮度
     *
     * @param {string} hexColor - 十六进制颜色
     * @param {number} factor - 亮度因子
     * @returns {string} 调整后的颜色
     */
    adjustColorBrightness: function (hexColor, factor) {
        const hex = hexColor.replace('#', '');
        const r = Math.min(255, Math.max(0, Math.round(parseInt(hex.substr(0, 2), 16) * factor)));
        const g = Math.min(255, Math.max(0, Math.round(parseInt(hex.substr(2, 2), 16) * factor)));
        const b = Math.min(255, Math.max(0, Math.round(parseInt(hex.substr(4, 2), 16) * factor)));
        return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    },

    /**
     * 十六进制转RGBA
     * 
     * @param {string} hexColor - 十六进制颜色
     * @param {number} alpha - 透明度
     * @returns {string} RGBA颜色
     */
    hexToRgba: function (hexColor, alpha) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * 初始化视差效果
     * @param {number} delay - 延迟启用时间（毫秒）
     */
    initParallax: function (delay = 100) {
        // 移动端禁用视差动画效果
        if (window.innerWidth <= 768) {
            console.log('Mobile device: parallax disabled');
            return;
        }

        const heroScreen = document.getElementById('result-hero-screen');
        if (!heroScreen) {
            console.log('heroScreen not found');
            return;
        }

        const parallaxItems = heroScreen.querySelectorAll('.parallax-item');
        if (parallaxItems.length === 0) {
            console.log('parallaxItems not found');
            return;
        }

        console.log('initParallax called, items:', parallaxItems.length);

        let parallaxEnabled = false;

        let currentOffsets = {};
        let targetOffsets = {};

        parallaxItems.forEach((item, index) => {
            const key = item.id || `parallax-${index}`;
            currentOffsets[key] = { x: 0, y: 0 };
            targetOffsets[key] = { x: 0, y: 0 };
        });

        setTimeout(() => {
            parallaxEnabled = true;
            console.log('parallax enabled');
            parallaxItems.forEach((item, index) => {
                item.dataset.parallaxX = '0';
                item.dataset.parallaxY = '0';
                item.dataset.animated = 'true';
            });
        }, delay);

        const animate = () => {
            parallaxItems.forEach((item, index) => {
                const key = item.id || `parallax-${index}`;
                const current = currentOffsets[key];
                const target = targetOffsets[key];

                if (!current || !target) return;

                // 根据元素类型设置不同的摩擦系数
                let friction = 0.08;
                if (item.classList.contains('character-person')) {
                    friction = 0.05;
                } else if (item.classList.contains('character-icon')) {
                    friction = 0.1;
                } else if (item.classList.contains('character-content')) {
                    friction = 0.12;
                } else if (item.classList.contains('character-sen')) {
                    friction = 0.06;
                }

                current.x += (target.x - current.x) * friction;
                current.y += (target.y - current.y) * friction;

                if (parallaxEnabled && item.dataset.animated === 'true') {
                    if (item.classList.contains('character-person')) {
                        item.style.transform = `translate(${current.x}px, ${current.y}px)`;
                    } else if (item.classList.contains('character-icon')) {
                        item.style.transform = `translate(${current.x}px, calc(-50% + ${current.y}px)) scale(1)`;
                    } else if (item.classList.contains('character-content')) {
                        item.style.transform = `translate(${current.x}px, calc(-50% + ${current.y}px))`;
                    } else if (item.classList.contains('character-sen')) {
                        item.style.transform = `scale(1.2) translate(${current.x}px, ${current.y}px)`;
                    } else {
                        item.style.transform = `translate(${current.x}px, ${current.y}px)`;
                    }
                }
            });

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        heroScreen.addEventListener('mousemove', (e) => {
            if (!parallaxEnabled) return;

            const rect = heroScreen.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const deltaX = (mouseX - centerX) / centerX;
            const deltaY = (mouseY - centerY) / centerY;

            parallaxItems.forEach((item, index) => {
                const depth = parseFloat(item.dataset.parallaxDepth) || 0.5;
                let moveX = -deltaX * 30 * depth;
                let moveY = -deltaY * 30 * depth;

                // 名片的晃动方向跟立绘相反
                if (item.classList.contains('character-sen')) {
                    moveX = -moveX;
                    moveY = -moveY;
                }

                const key = item.id || `parallax-${index}`;
                targetOffsets[key] = { x: moveX, y: moveY };
            });
        });

        heroScreen.addEventListener('mouseleave', () => {
            parallaxItems.forEach((item, index) => {
                const key = item.id || `parallax-${index}`;
                targetOffsets[key] = { x: 0, y: 0 };
            });
        });
    },

    /**
     * 渲染角色展示第一屏
     * 
     * @param {Object} result - 计算结果对象
     */
    renderCharacterHero: function (result) {
        // 默认显示琴的角色
        const defaultCharacter = {
            id: 'character_001',
            name: '琴',
            element: 'anemo',
            cv: '林簌',
            description: '身为西风骑士团的代理团长，琴一直忠于职守，为人们带来安宁。虽然并非天赋异禀，但通过刻苦训练，如今的她已然能够独当一面。当风魔龙的威胁开始临近，这位可靠的代理团长早已做好了准备，誓要守护蒙德。',
            assets: {
                portrait: 'assets/characters/portraits/character_001_portrait.png',
                icon: 'assets/characters/badges/anemo.png',
                name_image: 'assets/characters/names/character_001_name.png',
                pattern: 'assets/characters/patterns/character_001_pattern.png'
            }
        };

        // 优先使用 result.characterFull（计算时已查询好的完整数据）
        let character = result?.characterFull || null;

        // 如果没有预加载的数据，则实时查询
        if (!character) {
            const mbtiType = result?.type;

            if (mbtiType && this.mbtiMapping && this.charactersData) {
                const mapping = this.mbtiMapping[mbtiType];
                if (mapping) {
                    const gender = result.gender || GenshinMBTI?.state?.gender || 'female';
                    const characterId = mapping[`primary_${gender}`] || mapping.primary_male || mapping.primary_female;

                    if (characterId && this.charactersData[characterId]) {
                        character = this.charactersData[characterId];
                        console.log(`MBTI类型 ${mbtiType} 对应角色: ${character.name}`);
                    }
                }
            }
        }

        // 如果没有找到角色，使用默认角色
        if (!character) {
            character = defaultCharacter;
            console.log('使用默认角色: 琴');
        }

        // 设置 result.characterFull 以便分享卡片使用
        result.characterFull = character;

        // 设置立绘
        const portrait = document.getElementById('result-portrait');
        if (portrait) {
            portrait.src = character.assets?.portrait || defaultCharacter.assets.portrait;
            portrait.alt = character.name || '角色';
        }

        // 设置角色徽标（元素图标）
        const charIcon = document.getElementById('result-character-icon');
        if (charIcon) {
            charIcon.src = character.assets?.icon || defaultCharacter.assets.icon;
        }

        // 设置角色名图片
        const nameImg = document.getElementById('result-character-name-img');
        if (nameImg) {
            nameImg.style.display = 'block';
            nameImg.src = character.assets?.name_image || defaultCharacter.assets.name_image;
        }

        // 设置简介
        const introEl = document.getElementById('result-character-intro');
        if (introEl) {
            introEl.innerHTML = (character.description || defaultCharacter.description).replace(/\n/g, '<br>');
        }

        // 设置CV
        const cvCnEl = document.getElementById('result-cv-cn');
        if (cvCnEl) {
            cvCnEl.textContent = `CV: ${character.cv || defaultCharacter.cv}`;
        }

        // 重置CV标签
        this.currentLang = 'cn';
        const tabs = document.querySelectorAll('.character-sbtn');
        tabs.forEach(tab => {
            tab.classList.remove('character-sbtn--active');
            if (tab.dataset.lang === 'cn') {
                tab.classList.add('character-sbtn--active');
            }
        });

        // 设置专属纹样
        const charSen = document.getElementById('result-character-sen');
        if (charSen) {
            charSen.src = character.assets?.pattern || defaultCharacter.assets.pattern;

            // 移动端动态缩小专属纹样以保持间距限制（左15%右30%）
            charSen.onload = function () {
                if (window.innerWidth <= 768) {
                    const viewportWidth = window.innerWidth;
                    const leftMargin = viewportWidth * 0.15;
                    const rightMargin = viewportWidth * 0.30;
                    const availableWidth = viewportWidth - leftMargin - rightMargin;

                    const imgWidth = charSen.naturalWidth;
                    const imgHeight = charSen.naturalHeight;

                    if (imgWidth > availableWidth) {
                        const scale = availableWidth / imgWidth;
                        charSen.style.width = availableWidth + 'px';
                        charSen.style.height = (imgHeight * scale) + 'px';
                    }
                }
            };
        }

        // 移动端：将 character-intro 移动到与 character-sen 同级
        const charIntro = document.querySelector('.character-intro.mCustomScrollbar');
        if (window.innerWidth <= 1024 && charIntro) {
            const parallaxContainer = document.querySelector('.parallax-container');
            if (parallaxContainer) {
                parallaxContainer.appendChild(charIntro);
            }
        }

        // 触发入场动画
        setTimeout(() => {
            const portrait = document.getElementById('result-portrait');
            const charIcon = document.getElementById('result-character-icon');
            const content = document.querySelector('.character-content');

            if (portrait) portrait.classList.add('animate-in');
            if (charIcon) charIcon.classList.add('animate-in');
            if (content) content.classList.add('animate-in');
            if (charSen) charSen.classList.add('animate-in');
        }, 100);

        // 初始化视差效果
        this.initParallax();
    },

    /**
     * 获取元素渐变色
     * 
     * @param {string} element - 元素代码
     * @returns {string} CSS渐变色
     */
    getElementGradient: function (element) {
        const gradients = {
            anemo: 'linear-gradient(135deg, #74c2a8 0%, #5fb89a 100%)',
            hydro: 'linear-gradient(135deg, #4cc2f1 0%, #3ab5e5 100%)',
            pyro: 'linear-gradient(135deg, #ef7938 0%, #e66a2c 100%)',
            geo: 'linear-gradient(135deg, #f0b232 0%, #e5a52c 100%)',
            electro: 'linear-gradient(135deg, #b08fc2 0%, #9f7fb5 100%)',
            dendro: 'linear-gradient(135deg, #a5c83b 0%, #95b835 100%)',
            cryo: 'linear-gradient(135deg, #9fd6e3 0%, #8fccd9 100%)',
            physical: 'linear-gradient(135deg, #888888 0%, #777777 100%)'
        };
        return gradients[element] || gradients.anemo;
    },

    /**
     * 渲染详细分析第二屏
     * 
     * @param {Object} result - 计算结果对象
     */
    renderResultDetail: function (result) {
        this.renderCharacterInfoCard(result);
        this.renderMbtiPortrait(result);

        const typeContainer = document.getElementById('result-type');
        if (typeContainer) {
            const elements = result.elements || [];
            typeContainer.innerHTML = `
                <div class="result-elements">
                    ${elements.map(el => `
                        <div class="result-letter" data-element="${el}">
                            ${this.getElementLetter(el)}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const labelEl = document.getElementById('result-label');
        if (labelEl) {
            const characterName = result.characterFull?.name || this.getCharacterNameByMbti(result.type);
            labelEl.innerHTML = `<span class="label-name">${characterName}</span><span class="label-suffix">型人格</span>`;

            let temperamentCode = result.temperamentInfo?.code || '';
            if (!temperamentCode && this.elementTemperamentMapping && result.type) {
                temperamentCode = this.elementTemperamentMapping.type_mapping[result.type] || '';
            }
            if (temperamentCode) {
                const root = document.documentElement;
                const computedStyle = getComputedStyle(root);
                const primaryColor = computedStyle.getPropertyValue('--temperament-' + temperamentCode + '-primary').trim();
                if (primaryColor) {
                    const rgbaColor = this.hexToRgba(primaryColor, 0.5);
                    labelEl.style.textShadow = `0 0 30px ${rgbaColor}`;
                }
            }
        }

        const descEl = document.getElementById('result-description');
        if (descEl) {
            const dynamicDesc = this.generateDynamicDescription(result.descTemplate, result.characterFull?.name);
            descEl.textContent = dynamicDesc || result.characterFull?.description || '';
        }

        if (typeof ResultRenderer !== 'undefined') {
            console.log('========== [渲染结果] 开始渲染 ==========');
            console.log('[渲染结果] result 对象:', result);
            console.log('[渲染结果] dimensionScores:', result.dimensionScores);
            console.log('[渲染结果] careerInfo:', result.careerInfo);
            console.log('[渲染结果] socialStyle:', result.socialStyle);
            console.log('[渲染结果] familyStyle:', result.familyStyle);
            console.log('[渲染结果] personalGrowth:', result.personalGrowth);

            const gender = result.gender || GenshinMBTI?.state?.gender || 'female';
            ResultRenderer.setResult(result, gender);
            ResultRenderer.renderDimensionAnalysis(result.dimensionScores);
            ResultRenderer.renderFunctionStack(result.functionStack);

            if (result.characterExamples && result.characterExamples.length > 0) {
                console.log('[渲染结果] 渲染 characterExamples');
                ResultRenderer.renderCharacterExamplesFromData(result.characterExamples);
            }

            if (result.careerInfo) {
                console.log('[渲染结果] 渲染 careerInfo');
                ResultRenderer.renderCareerFromData(result.careerInfo);
            }

            if (result.compatibilityPairs && result.compatibilityPairs.length > 0) {
                console.log('[渲染结果] 渲染 compatibilityPairs');
                ResultRenderer.renderRelationshipFromData(result.compatibilityPairs, result.type);
            }

            if (result.socialStyle) {
                console.log('[渲染结果] 渲染 socialStyle');
                ResultRenderer.renderSocialStyleFromData(result.socialStyle);
            }

            if (result.familyStyle) {
                console.log('[渲染结果] 渲染 familyStyle');
                ResultRenderer.renderFamilyFromData(result.familyStyle);
            }

            if (result.personalGrowth) {
                console.log('[渲染结果] 渲染 personalGrowth');
                ResultRenderer.renderPersonalGrowthFromData(result.personalGrowth);
            }

            if (result.temperamentInfo) {
                console.log('[渲染结果] 渲染 temperamentInfo');
                this.renderTemperamentInfoFromData(result.temperamentInfo, result.characterFull);
            }

            if (result.isAIAnalysis && result.aiAnalysis) {
                console.log('[渲染结果] 渲染 AI分析模块');
                this.renderAIAnalysis(result.aiAnalysis, result.type);
            }
        } else {
            console.error('[渲染结果] ResultRenderer 未定义！');
        }

        StatsModal.init();
        CharacterStatsModal.init();
        this.initFloatToolbar();

        if (result.validity && !result.validity.isValid) {
            this.showValidityWarning(result.validity.warning);
        }
    },

    /**
     * 渲染AI分析模块
     * 
     * @param {Object} aiAnalysis - AI分析数据
     * @param {string} mbtiType - MBTI类型
     */
    renderAIAnalysis: function (aiAnalysis, mbtiType) {
        const section = document.getElementById('ai-analysis-section');
        const container = document.getElementById('ai-analysis-content');
        if (!section || !container || !aiAnalysis) return;

        section.style.display = 'block';

        // 显示目录中的AI模块项
        const tocAiItem = document.querySelector('.toc-item-ai');
        if (tocAiItem) {
            tocAiItem.style.display = 'block';
        }

        // 置信度直接使用1-100的值
        const confidencePercent = aiAnalysis.confidence || 50;

        // 获取气质类型颜色
        let temperamentCode = '';
        if (this.elementTemperamentMapping && mbtiType) {
            temperamentCode = this.elementTemperamentMapping.type_mapping[mbtiType] || '';
        }

        let html = '';

        // 置信度卡片（放在最上方，使用类型色）
        html += '<div class="dimension-card" style="margin-bottom: 24px;">';
        html += '<div class="dimension-header">';
        html += '<span class="dimension-name">分析置信度</span>';
        html += '<span class="dimension-value">' + confidencePercent + '%</span>';
        html += '</div>';
        html += '<div class="dimension-bar" style="height: 12px; background: #e8e0d0; border-radius: 6px;">';
        if (temperamentCode) {
            html += '<div class="dimension-bar-fill left" style="width: ' + confidencePercent + '%; --element-color-1: var(--temperament-' + temperamentCode + '-primary);"></div>';
        } else {
            html += '<div class="dimension-bar-fill left" style="width: ' + confidencePercent + '%; background: var(--temperament-primary, #667eea);"></div>';
        }
        html += '</div>';
        html += '<div class="dimension-labels" style="justify-content: flex-end;">';
        html += '<span class="dimension-label" style="font-size: 12px; color: #8b7355;">置信度越高，分析结果越可靠</span>';
        html += '</div>';
        html += '</div>';

        // 分析总结
        if (aiAnalysis.analysisSummary) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">分析总结</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" class="obc-tmpl__rich-text">' + TermRenderer.render(aiAnalysis.analysisSummary) + '</td></tr>';
            html += '</tbody></table></div>';
        }

        // 逐题分析
        if (aiAnalysis.detailedEvidence && aiAnalysis.detailedEvidence.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">逐题分析</h2>';
            html += '<table><tbody>';
            aiAnalysis.detailedEvidence.forEach((evidence, index) => {
                const qid = evidence.question_id || index + 1;
                html += '<tr><td colspan="2" style="padding: 16px;">';
                html += '<p style="font-weight: bold; color: #5c4d3d; margin-bottom: 8px;">问题 ' + qid + '</p>';
                html += '<p style="color: #8b7355; font-size: 13px; margin-bottom: 4px;">您的回答原文摘抄：</p>';
                html += '<p style="font-style: italic; color: #5c4d3d; background: #f5f0e6; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px;">"' + (evidence.user_excerpt || '') + '"</p>';
                html += '<p style="color: #764ba2; font-weight: bold; margin-bottom: 4px;">' + TermRenderer.render(evidence.observed_trait || '') + '</p>';
                html += '<p style="color: #5c4d3d; line-height: 1.6;">' + TermRenderer.render(evidence.reasoning || '') + '</p>';
                html += '</td></tr>';
            });
            html += '</tbody></table></div>';
        }

        // 其他可能性
        if (aiAnalysis.alternativeHypotheses && aiAnalysis.alternativeHypotheses.length > 0) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2" style="margin-bottom: 4px;">其他可能性</h2>';
            html += '<p style="font-size: 13px; color: #8b7355; margin-bottom: 16px;">若结论与自我认知存在差异，可参考以下备选类型</p>';
            html += '<table><tbody>';
            aiAnalysis.alternativeHypotheses.forEach(alt => {
                const altElements = TermRenderer.getElements(alt.type || '');
                html += '<tr>';
                html += '<td class="wiki-h3" style="width: 15%;">' + altElements + '</td>';
                html += '<td>' + TermRenderer.render(alt.reason_excluded || '') + '</td>';
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }

        // 被抛弃题目分析
        if (aiAnalysis.skippedQuestionsAnalysis) {
            html += '<div class="obc-tmpl-part">';
            html += '<h2 class="wiki-h2">跳过题目分析</h2>';
            html += '<table><tbody>';
            html += '<tr><td colspan="2" style="color: #5c4d3d; line-height: 1.6;">' + TermRenderer.render(aiAnalysis.skippedQuestionsAnalysis) + '</td></tr>';
            html += '</tbody></table></div>';
        }

        // 分析说明（免责声明样式）
        if (aiAnalysis.caveats) {
            html += '<div class="career-disclaimer">' + TermRenderer.render(aiAnalysis.caveats) + '</div>';
        }

        container.innerHTML = html;
    },

    /**
     * 从API数据渲染气质类型信息
     * 
     * @param {Object} temperamentInfo - 气质类型信息
     * @param {Object} characterFull - 角色完整信息
     */
    renderTemperamentInfoFromData: function (temperamentInfo, characterFull) {
        const container = document.getElementById('character-match');
        if (!container || !temperamentInfo) return;

        let temperamentName = temperamentInfo.name || '';
        if (temperamentName.endsWith('本命')) {
            temperamentName = temperamentName.slice(0, -2) + '型';
        }

        const constellation = characterFull?.constellation || '未知';

        let html = '<div class="obc-tmpl-part">';
        html += '<h2 class="wiki-h2">命之座</h2>';
        html += '<table><tbody>';
        html += '<tr>';
        html += '<td class="wiki-h3">命之座</td>';
        html += `<td><span class="temperament-badge-inline">${constellation}</span></td>`;
        html += '</tr>';
        html += '<tr>';
        html += '<td class="wiki-h3">气质类型</td>';
        html += `<td><span class="temperament-badge-inline">${temperamentName}</span></td>`;
        html += '</tr>';
        html += '<tr>';
        html += '<td class="wiki-h3">气质描述</td>';
        html += `<td>${temperamentInfo.description || ''}</td>`;
        html += '</tr>';
        html += '</tbody></table></div>';

        container.innerHTML = html;
    },

    /**
     * 渲染气质类型信息
     * 
     * @param {string} mbtiType - MBTI类型
     */
    renderTemperamentInfo: function (mbtiType) {
        const container = document.getElementById('character-match');
        if (!container || !this.elementTemperamentMapping) return;

        const temperamentCode = this.elementTemperamentMapping.type_mapping[mbtiType];
        if (!temperamentCode) return;

        const temperamentInfo = this.elementTemperamentMapping.temperaments[temperamentCode];
        if (!temperamentInfo) return;

        let temperamentName = temperamentInfo.name || '';
        if (temperamentName.endsWith('本命')) {
            temperamentName = temperamentName.slice(0, -2) + '型';
        }

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
     * 初始化悬浮工具栏
     */
    initFloatToolbar: function () {
        const toolbar = document.getElementById('float-toolbar');
        if (!toolbar) return;

        const checkToolbarVisibility = () => {
            // 如果当前页面不是结果页面，隐藏悬浮工具栏
            if (this.currentPage !== 'result') {
                toolbar.classList.remove('show');
                return;
            }

            const firstScreen = document.getElementById('result-hero-screen');
            const temperamentSection = document.getElementById('character-match');
            const windowHeight = window.innerHeight;

            let firstScreenVisible = false;
            let temperamentVisible = false;

            if (firstScreen) {
                const rect = firstScreen.getBoundingClientRect();
                firstScreenVisible = rect.bottom > 0 && rect.top < windowHeight;
            }

            if (temperamentSection) {
                const rect = temperamentSection.getBoundingClientRect();
                temperamentVisible = rect.bottom > 0 && rect.top < windowHeight;
            }

            if (firstScreenVisible && !temperamentVisible) {
                toolbar.classList.remove('show');
            } else {
                toolbar.classList.add('show');
            }
        };

        window.addEventListener('scroll', checkToolbarVisibility);
        checkToolbarVisibility();

        const btnTop = document.getElementById('toolbar-top');
        const btnToc = document.getElementById('toolbar-toc');
        const tocPanel = document.getElementById('toc-panel');
        const btnAnnotation = document.getElementById('toolbar-annotation');
        const btnBottom = document.getElementById('toolbar-bottom');

        if (btnTop) {
            btnTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (btnToc && tocPanel) {
            btnToc.addEventListener('click', () => {
                tocPanel.classList.toggle('show');
            });

            tocPanel.querySelectorAll('.toc-item').forEach(item => {
                item.addEventListener('click', () => {
                    const target = document.getElementById(item.dataset.target);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        tocPanel.classList.remove('show');
                    }
                });
            });

            document.addEventListener('click', (e) => {
                if (!btnToc.contains(e.target) && !tocPanel.contains(e.target)) {
                    tocPanel.classList.remove('show');
                }
            });
        }

        if (btnAnnotation) {
            // 初始化全局标注状态
            window.annotationVisible = true;

            // 初始化按钮状态：显示标注时高亮
            btnAnnotation.classList.add('active');

            btnAnnotation.addEventListener('click', () => {
                window.annotationVisible = !window.annotationVisible;

                // 更新按钮状态：显示标注时高亮
                if (window.annotationVisible) {
                    btnAnnotation.classList.add('active');
                } else {
                    btnAnnotation.classList.remove('active');
                }

                // 切换注释：annotationVisible=true 时显示注释（hide=false）
                this.toggleAnnotations(!window.annotationVisible);
            });
        }

        if (btnBottom) {
            btnBottom.addEventListener('click', () => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            });
        }

        const btnMapping = document.getElementById('toolbar-mapping');
        if (btnMapping) {
            btnMapping.addEventListener('click', () => {
                this.showMappingModal();
            });
        }

        const mappingModal = document.getElementById('mapping-modal');
        const mappingModalClose = document.getElementById('mapping-modal-close');

        if (mappingModal && mappingModalClose) {
            mappingModalClose.addEventListener('click', () => {
                this.hideMappingModal();
            });

            mappingModal.addEventListener('click', (e) => {
                if (e.target === mappingModal) {
                    this.hideMappingModal();
                }
            });
        }
    },

    /**
     * 显示MBTI元素对应表弹窗
     */
    showMappingModal: function () {
        const modal = document.getElementById('mapping-modal');
        const body = document.getElementById('mapping-modal-body');

        if (!modal || !body) return;

        body.innerHTML = `
            <div class="mapping-section">
                <div class="mapping-section-title">维度对应</div>
                <table class="mapping-table">
                    <thead>
                        <tr>
                            <th>MBTI维度</th>
                            <th>原神元素</th>
                            <th>含义</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>E</strong> 外倾</td>
                            <td><span class="mapping-element anemo">风</span></td>
                            <td>从外部世界获取能量</td>
                        </tr>
                        <tr>
                            <td><strong>I</strong> 内倾</td>
                            <td><span class="mapping-element hydro">水</span></td>
                            <td>从内心世界获取能量</td>
                        </tr>
                        <tr>
                            <td><strong>S</strong> 感觉</td>
                            <td><span class="mapping-element pyro">火</span></td>
                            <td>关注当下的现实信息</td>
                        </tr>
                        <tr>
                            <td><strong>N</strong> 直觉</td>
                            <td><span class="mapping-element geo">岩</span></td>
                            <td>关注未来的可能性</td>
                        </tr>
                        <tr>
                            <td><strong>T</strong> 思考</td>
                            <td><span class="mapping-element electro">雷</span></td>
                            <td>基于逻辑做决定</td>
                        </tr>
                        <tr>
                            <td><strong>F</strong> 情感</td>
                            <td><span class="mapping-element dendro">草</span></td>
                            <td>基于价值观做决定</td>
                        </tr>
                        <tr>
                            <td><strong>J</strong> 判断</td>
                            <td><span class="mapping-element cryo">冰</span></td>
                            <td>喜欢有计划的生活方式</td>
                        </tr>
                        <tr>
                            <td><strong>P</strong> 感知</td>
                            <td><span class="mapping-element physical">原</span></td>
                            <td>喜欢灵活随性的生活方式</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="mapping-section">
                <div class="mapping-section-title">气质类型对应</div>
                <table class="mapping-table">
                    <thead>
                        <tr>
                            <th>气质类型</th>
                            <th>元素组合</th>
                            <th>包含类型</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>NT</strong> 岩雷本命</td>
                            <td><span class="mapping-element geo">岩</span> + <span class="mapping-element electro">雷</span></td>
                            <td>INTJ, INTP, ENTJ, ENTP</td>
                        </tr>
                        <tr>
                            <td><strong>NF</strong> 岩草本命</td>
                            <td><span class="mapping-element geo">岩</span> + <span class="mapping-element dendro">草</span></td>
                            <td>INFJ, INFP, ENFJ, ENFP</td>
                        </tr>
                        <tr>
                            <td><strong>SJ</strong> 火冰本命</td>
                            <td><span class="mapping-element pyro">火</span> + <span class="mapping-element cryo">冰</span></td>
                            <td>ISTJ, ISFJ, ESTJ, ESFJ</td>
                        </tr>
                        <tr>
                            <td><strong>SP</strong> 火原本命</td>
                            <td><span class="mapping-element pyro">火</span> + <span class="mapping-element physical">原</span></td>
                            <td>ISTP, ISFP, ESTP, ESFP</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="mapping-section">
                <div class="mapping-section-title">16型人格元素组合</div>
                <table class="mapping-table">
                    <thead>
                        <tr>
                            <th>MBTI</th>
                            <th>元素组合</th>
                            <th>MBTI</th>
                            <th>元素组合</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>INTJ</td>
                            <td><span class="mapping-element hydro">水</span><span class="mapping-element geo">岩</span><span class="mapping-element electro">雷</span><span class="mapping-element cryo">冰</span></td>
                            <td>INFJ</td>
                            <td><span class="mapping-element hydro">水</span><span class="mapping-element geo">岩</span><span class="mapping-element dendro">草</span><span class="mapping-element cryo">冰</span></td>
                        </tr>
                        <tr>
                            <td>INTP</td>
                            <td><span class="mapping-element hydro">水</span><span class="mapping-element geo">岩</span><span class="mapping-element electro">雷</span><span class="mapping-element physical">原</span></td>
                            <td>INFP</td>
                            <td><span class="mapping-element hydro">水</span><span class="mapping-element geo">岩</span><span class="mapping-element dendro">草</span><span class="mapping-element physical">原</span></td>
                        </tr>
                        <tr>
                            <td>ENTJ</td>
                            <td><span class="mapping-element anemo">风</span><span class="mapping-element geo">岩</span><span class="mapping-element electro">雷</span><span class="mapping-element cryo">冰</span></td>
                            <td>ENFJ</td>
                            <td><span class="mapping-element anemo">风</span><span class="mapping-element geo">岩</span><span class="mapping-element dendro">草</span><span class="mapping-element cryo">冰</span></td>
                        </tr>
                        <tr>
                            <td>ENTP</td>
                            <td><span class="mapping-element anemo">风</span><span class="mapping-element geo">岩</span><span class="mapping-element electro">雷</span><span class="mapping-element physical">原</span></td>
                            <td>ENFP</td>
                            <td><span class="mapping-element anemo">风</span><span class="mapping-element geo">岩</span><span class="mapping-element dendro">草</span><span class="mapping-element physical">原</span></td>
                        </tr>
                        <tr>
                            <td>ISTJ</td>
                            <td><span class="mapping-element hydro">水</span><span class="mapping-element pyro">火</span><span class="mapping-element electro">雷</span><span class="mapping-element cryo">冰</span></td>
                            <td>ISFJ</td>
                            <td><span class="mapping-element hydro">水</span><span class="mapping-element pyro">火</span><span class="mapping-element dendro">草</span><span class="mapping-element cryo">冰</span></td>
                        </tr>
                        <tr>
                            <td>ISTP</td>
                            <td><span class="mapping-element hydro">水</span><span class="mapping-element pyro">火</span><span class="mapping-element electro">雷</span><span class="mapping-element physical">原</span></td>
                            <td>ISFP</td>
                            <td><span class="mapping-element hydro">水</span><span class="mapping-element pyro">火</span><span class="mapping-element dendro">草</span><span class="mapping-element physical">原</span></td>
                        </tr>
                        <tr>
                            <td>ESTJ</td>
                            <td><span class="mapping-element anemo">风</span><span class="mapping-element pyro">火</span><span class="mapping-element electro">雷</span><span class="mapping-element cryo">冰</span></td>
                            <td>ESFJ</td>
                            <td><span class="mapping-element anemo">风</span><span class="mapping-element pyro">火</span><span class="mapping-element dendro">草</span><span class="mapping-element cryo">冰</span></td>
                        </tr>
                        <tr>
                            <td>ESTP</td>
                            <td><span class="mapping-element anemo">风</span><span class="mapping-element pyro">火</span><span class="mapping-element electro">雷</span><span class="mapping-element physical">原</span></td>
                            <td>ESFP</td>
                            <td><span class="mapping-element anemo">风</span><span class="mapping-element pyro">火</span><span class="mapping-element dendro">草</span><span class="mapping-element physical">原</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        modal.classList.add('show');
    },

    /**
     * 隐藏MBTI元素对应表弹窗
     */
    hideMappingModal: function () {
        const modal = document.getElementById('mapping-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * 显示目录弹窗
     */
    showTocModal: function () {
    },

    /**
     * 初始化角色注释切换按钮
     */
    initAnnotationToggle: function () {
    },

    /**
     * 切换角色注释显示
     * 
     * @param {boolean} hide - 是否隐藏
     */
    toggleAnnotations: function (hide) {
        const selectors = [
            '.result-description',
            '.result-details',
            '.compatibility-analysis',
            '.compatibility-advice-content',
            '.friendship-content',
            '#relationship-section td',
            '#relationship-section p',
            '#relationship-section .obc-tmpl__rich-text',
            '#relationship-section .obc-tmpl__list p',
            '#career-section td',
            '#career-section p',
            '#career-section .obc-tmpl__rich-text',
            '#career-section .obc-tmpl__list p',
            '#career-section .wiki-tag',
            '#career-section .wiki-h3',
            '#career-section th',
            '#social-style-section td',
            '#social-style-section p',
            '#social-style-section .obc-tmpl__rich-text',
            '#social-style-section .obc-tmpl__list p',
            '#family-section td',
            '#family-section p',
            '#family-section .obc-tmpl__rich-text',
            '#family-section .obc-tmpl__list p',
            '#personal-growth-section td',
            '#personal-growth-section p',
            '#personal-growth-section .obc-tmpl__rich-text',
            '#personal-growth-section .obc-tmpl__list p',
            '#personal-growth-section .wiki-tag',
            '#ai-analysis-section td',
            '#ai-analysis-section p',
            '#ai-analysis-section .obc-tmpl__rich-text',
            '#ai-analysis-section .obc-tmpl__list p',
            '#ai-analysis-section .wiki-tag'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (hide) {
                    if (!el.dataset.original) {
                        el.dataset.original = el.innerHTML;
                    }
                    el.innerHTML = el.innerHTML.replace(/（[^）]+(?:\/[^）]+)?）/g, '');
                } else {
                    if (el.dataset.original) {
                        el.innerHTML = el.dataset.original;
                    }
                }
            });
        });
    },

    /**
     * 渲染角色基本信息卡片
     * 
     * @param {Object} result - 计算结果对象
     */
    renderCharacterInfoCard: function (result) {
        const character = result?.characterFull;
        if (!character) return;

        // PC端卡片
        const nameEl = document.getElementById('character-name');
        if (nameEl) {
            nameEl.textContent = character.name || '-';
        }

        const starsEl = document.getElementById('character-stars');
        if (starsEl) {
            const rarity = character.rarity || '5星';
            const starCount = parseInt(rarity) || 5;
            let starsHtml = '';
            for (let i = 0; i < starCount; i++) {
                starsHtml += '<div class="character-info-star"></div>';
            }
            starsEl.innerHTML = starsHtml;
        }

        const avatarImg = document.getElementById('character-info-avatar-img');
        if (avatarImg && character.assets?.avatar) {
            avatarImg.src = character.assets.avatar;
        }

        const bgImg = document.getElementById('character-info-bg-img');
        if (bgImg && character.card) {
            bgImg.src = character.card;
        }

        const birthdayEl = document.getElementById('character-birthday');
        if (birthdayEl) {
            birthdayEl.textContent = character.birthday || '-';
        }

        const affiliationEl = document.getElementById('character-affiliation');
        if (affiliationEl) {
            affiliationEl.textContent = character.affiliation || '-';
        }

        const visionEl = document.getElementById('character-vision');
        if (visionEl) {
            visionEl.textContent = character.vision_cn || '-';
        }

        const weaponEl = document.getElementById('character-weapon');
        if (weaponEl) {
            weaponEl.textContent = character.weapon_type || '-';
        }

        const constellationEl = document.getElementById('character-constellation');
        if (constellationEl) {
            constellationEl.textContent = character.constellation || '-';
        }

        const titleEl = document.getElementById('character-title');
        if (titleEl) {
            titleEl.textContent = character.title || '-';
        }

        // 移动端卡片
        const mobileNameEl = document.getElementById('character-mobile-name');
        if (mobileNameEl) {
            mobileNameEl.textContent = character.name || '-';
        }

        const mobileStarsEl = document.getElementById('character-mobile-stars');
        if (mobileStarsEl) {
            const rarity = character.rarity || '5星';
            const starCount = parseInt(rarity) || 5;
            let starsHtml = '';
            for (let i = 0; i < starCount; i++) {
                starsHtml += '<div class="star-icon"></div>';
            }
            mobileStarsEl.innerHTML = starsHtml;
        }

        const mobileAvatarEl = document.getElementById('character-mobile-avatar');
        if (mobileAvatarEl && character.assets?.avatar) {
            mobileAvatarEl.style.backgroundImage = `url(${character.assets.avatar})`;
        }

        // 移动端卡片背景 - 使用mobile_card图片
        const mobileBoxEl = document.getElementById('character-mobile-box');
        if (mobileBoxEl) {
            const mobileCardUrl = character.mobile_card || character.card;
            if (mobileCardUrl) {
                mobileBoxEl.style.backgroundImage = `url(${mobileCardUrl})`;
            }
        }

        // 移动端属性值
        const mobileBirthdayEl = document.getElementById('character-mobile-birthday');
        if (mobileBirthdayEl) {
            mobileBirthdayEl.textContent = character.birthday || '-';
        }

        const mobileAffiliationEl = document.getElementById('character-mobile-affiliation');
        if (mobileAffiliationEl) {
            mobileAffiliationEl.textContent = character.affiliation || '-';
        }

        const mobileVisionEl = document.getElementById('character-mobile-vision');
        if (mobileVisionEl) {
            mobileVisionEl.textContent = character.vision_cn || '-';
        }

        const mobileWeaponEl = document.getElementById('character-mobile-weapon');
        if (mobileWeaponEl) {
            mobileWeaponEl.textContent = character.weapon_type || '-';
        }

        const mobileConstellationEl = document.getElementById('character-mobile-constellation');
        if (mobileConstellationEl) {
            mobileConstellationEl.textContent = character.constellation || '-';
        }

        const mobileTitleEl = document.getElementById('character-mobile-title');
        if (mobileTitleEl) {
            mobileTitleEl.textContent = character.title || '-';
        }

        // 移动端属性键颜色 - 所有key都使用类型色（temperament color）
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        const typeColor = computedStyle.getPropertyValue('--temperament-primary').trim() || '#4cb4e7';

        // 判断颜色深浅，决定文字颜色
        const isColorDark = function (hexColor) {
            let hex = hexColor.replace('#', '');
            if (hex.startsWith('rgb')) {
                const match = hex.match(/\d+/g);
                if (match && match.length >= 3) {
                    const r = parseInt(match[0]);
                    const g = parseInt(match[1]);
                    const b = parseInt(match[2]);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    return luminance < 0.5;
                }
            }
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5;
        };

        const textColor = isColorDark(typeColor) ? '#ffffff' : '#333333';

        for (let i = 0; i <= 5; i++) {
            const keyEl = document.getElementById(`character-mobile-key-${i}`);
            if (keyEl) {
                keyEl.style.background = typeColor;
                keyEl.style.color = textColor;
            }
        }
    },

    /**
     * 根据MBTI类型获取角色名称
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {string} 角色名称
     */
    getCharacterNameByMbti: function (mbtiType) {
        if (!mbtiType || !this.mbtiMapping || !this.charactersData) return mbtiType;

        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return mbtiType;

        const gender = GenshinMBTI?.state?.gender || 'female';
        const characterId = mapping[`primary_${gender}`] || mapping.primary_male || mapping.primary_female;

        if (!characterId || !this.charactersData[characterId]) return mbtiType;

        return this.charactersData[characterId].name || mbtiType;
    },

    /**
     * 动态生成描述文本
     * 
     * @param {string} descTemplate - 描述模板
     * @param {string} characterName - 角色名称
     * @returns {string|null} 动态生成的描述
     */
    generateDynamicDescription: function (descTemplate, characterName) {
        if (!descTemplate) return null;
        if (!characterName) return descTemplate;
        return descTemplate.replace(/{character}/g, characterName);
    },

    /**
     * 渲染MBTI结果区域的角色立绘
     * 
     * @param {Object} result - 计算结果对象
     */
    renderMbtiPortrait: function (result) {
        const character = result?.characterFull;
        if (!character) return;

        const portraitImg = document.getElementById('result-portrait-img');
        const portraitContainer = document.querySelector('.result-mbti-portrait');
        const sectionContainer = document.querySelector('.result-mbti-section');

        if (portraitImg && character.showcase) {
            portraitImg.src = character.showcase;
            portraitImg.onload = function () {
                const imgWidth = portraitImg.naturalWidth;
                const imgHeight = portraitImg.naturalHeight;
                const containerWidth = 340;
                const calculatedHeight = (containerWidth / imgWidth) * imgHeight;

                if (portraitContainer) {
                    portraitContainer.style.height = calculatedHeight + 'px';
                }
                if (sectionContainer) {
                    sectionContainer.style.height = calculatedHeight + 'px';
                }
            };
        }

        const detailsContainer = document.getElementById('result-details');
        if (detailsContainer && character.details) {
            detailsContainer.innerHTML = `<div class="result-details-title">角色详情</div>${character.details}`;
        }

        const storiesContainer = document.getElementById('result-stories');
        if (storiesContainer && character.stories && character.stories.length > 0) {
            storiesContainer.innerHTML = character.stories.map(story => `
                <div class="story-item">
                    <div class="story-title">${story.title}</div>
                    <div class="story-content">${story.content}</div>
                </div>
            `).join('');
        }
    },

    /**
     * 获取MBTI类型详细信息
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object|null} 类型信息对象
     */
    getTypeInfo: function (mbtiType) {
        if (!mbtiType || !this.mbtiOverview || !this.elementTemperamentMapping || !this.mbtiMapping) return null;

        const overview = this.mbtiOverview.mbti_types_overview;
        const temperamentMapping = this.elementTemperamentMapping;
        const mbtiMapping = this.mbtiMapping;
        if (!overview || !temperamentMapping || !mbtiMapping) return null;

        const temperamentCode = temperamentMapping.type_mapping[mbtiType];
        if (!temperamentCode) return null;

        const temperamentInfo = temperamentMapping.temperaments[temperamentCode];
        if (!temperamentInfo) return null;

        const mbtiTypeInfo = mbtiMapping[mbtiType];
        const fullDescription = mbtiTypeInfo?.full_description || '';

        for (const [key, category] of Object.entries(overview)) {
            if (key === 'meta') continue;

            const typeData = category.types?.find(t => t.code === mbtiType);
            if (typeData) {
                return {
                    temperamentName: temperamentInfo.name,
                    badgeColor: temperamentInfo.badge_color,
                    nickname: typeData.nickname,
                    role: typeData.role,
                    description: typeData.short_desc,
                    fullDescription: fullDescription,
                    traits: typeData.traits
                };
            }
        }

        return null;
    },

    /**
     * 显示效度警告
     * 
     * @param {string} message - 警告信息
     */
    showValidityWarning: function (message) {
        const container = document.getElementById('validity-warning');
        if (container) {
            container.innerHTML = `
                <div class="warning-box">
                    <span class="warning-icon">[!]</span>
                    <span class="warning-text">${message}</span>
                </div>
            `;
            container.style.display = 'block';
        }
    },

    /**
     * 获取元素字母
     * 
     * @param {string} element - 元素名称
     * @returns {string} 元素对应字母
     */
    getElementLetter: function (element) {
        const names = TermRenderer.getCodeToNameMap();
        return names[element] || '?';
    },

    /**
     * 获取元素名称
     * 
     * @param {string} element - 元素代码
     * @returns {string} 元素中文名称
     */
    getElementName: function (element) {
        const names = TermRenderer.getCodeToNameMap();
        return names[element] || '未知';
    },

    /**
     * 获取元素图标SVG
     * 
     * @param {string} element - 元素代码
     * @returns {string} SVG图标HTML
     */
    getElementIcon: function (element) {
        return `<div class="element-icon ${element}"></div>`;
    },

    /**
     * 保存进度到服务器
     * 
     * @param {boolean} immediate - 是否立即保存（跳过防抖）
     */
    saveProgress: async function (immediate = false) {
        const progress = {
            currentIndex: this.currentQuestionIndex,
            answers: this.answers,
            timestamp: Date.now(),
            questionVersion: GenshinMBTI?.state?.questionVersion || '200',
            gender: GenshinMBTI?.state?.gender || 'female'
        };

        // 同时保存到本地存储（作为备份）
        localStorage.setItem('genshin_mbti_progress', JSON.stringify(progress));

        // 如果已登录，保存到服务器
        if (this.isLoggedIn) {
            if (immediate) {
                await this._saveProgressToServer(progress);
            } else {
                // 防抖保存
                this._debounceSaveProgress(progress);
            }
        }
    },

    /**
     * 防抖保存进度到服务器
     * 
     * @param {Object} progress - 进度数据
     */
    _debounceSaveProgress: function (progress) {
        if (this._saveProgressTimer) {
            clearTimeout(this._saveProgressTimer);
        }
        this._saveProgressTimer = setTimeout(async () => {
            await this._saveProgressToServer(progress);
        }, 1500);
    },

    /**
     * 保存进度到服务器
     * 
     * @param {Object} progress - 进度数据
     */
    _saveProgressToServer: async function (progress) {
        try {
            const response = await fetch('/api/user/progress/normal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(progress)
            });
            const data = await response.json();
            if (data.success) {
                console.log('[进度保存] 保存成功');
            } else {
                console.error('[进度保存] 保存失败:', data.error);
            }
        } catch (error) {
            console.error('[进度保存] 网络错误:', error);
        }
    },

    /**
     * 从服务器加载进度（静默恢复，无弹窗）
     * 
     * @returns {Promise<boolean>} 是否成功加载进度
     */
    loadProgress: async function () {
        // 如果已登录，优先从服务器加载
        if (this.isLoggedIn) {
            try {
                const response = await fetch('/api/user/progress/normal');
                const data = await response.json();

                if (data.success && data.hasProgress && data.data) {
                    const progress = data.data;

                    if (progress.answers) {
                        this.answers = progress.answers;
                        this.currentQuestionIndex = progress.currentIndex || 0;
                        console.log('[进度加载] 从服务器恢复成功');
                        return true;
                    }
                }
            } catch (error) {
                console.error('[进度加载] 从服务器加载失败:', error);
            }
        }

        // 如果服务器加载失败或未登录，尝试从本地加载
        const saved = localStorage.getItem('genshin_mbti_progress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);

                if (progress.answers) {
                    this.answers = progress.answers;
                    this.currentQuestionIndex = progress.currentIndex || 0;
                    console.log('[进度加载] 从本地恢复成功');
                    return true;
                }
            } catch (e) {
                console.error('加载进度失败:', e);
            }
        }
        return false;
    },

    /**
     * 显示确认弹窗
     * 
     * @param {string} message - 确认消息
     * @param {Function} onConfirm - 确认回调
     * @param {Function} onCancel - 取消回调（可选）
     */
    showConfirmModal: function (message, onConfirm, onCancel) {
        const overlay = document.getElementById('confirm-modal-overlay');
        const messageEl = document.getElementById('confirm-modal-message');
        const confirmBtn = document.getElementById('confirm-modal-confirm');
        const cancelBtn = document.getElementById('confirm-modal-cancel');

        if (!overlay || !messageEl || !confirmBtn || !cancelBtn) {
            // 如果弹窗元素不存在，使用默认确认框
            if (confirm(message)) {
                onConfirm && onConfirm();
            } else {
                onCancel && onCancel();
            }
            return;
        }

        messageEl.textContent = message;
        overlay.classList.add('show');

        const handleConfirm = () => {
            overlay.classList.remove('show');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            onConfirm && onConfirm();
        };

        const handleCancel = () => {
            overlay.classList.remove('show');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            onCancel && onCancel();
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    },

    /**
     * 清除保存的进度
     */
    clearProgress: function () {
        localStorage.removeItem('genshin_mbti_progress');
        localStorage.removeItem('mbti_progress');
    },

    /**
     * 保存结果到本地存储
     * 
     * @param {Object} result - 测试结果对象
     */
    saveResult: function (result) {
        // 如果是直接查看结果，不保存到历史记录
        if (result.isDirectView) {
            return;
        }

        // 保存完整结果（包括答案和题目版本）
        const fullResult = {
            ...result,
            savedAnswers: [...this.answers],
            questionVersion: GenshinMBTI?.state?.questionVersion || '200',
            savedAt: Date.now()
        };

        const history = JSON.parse(localStorage.getItem('genshin_mbti_history') || '[]');
        history.unshift(fullResult);
        if (history.length > 10) history.pop();
        localStorage.setItem('genshin_mbti_history', JSON.stringify(history));
    },

    /**
     * 重新开始
     */
    restart: function () {
        this.showConfirmModal('确定要重新开始测试吗？当前结果将被清除。', () => {
            this.answers = new Array(this.questions.length).fill(null);
            this.currentQuestionIndex = 0;
            this.clearProgress();
            // 清除快速测试标志
            if (typeof GenshinMBTI !== 'undefined') {
                GenshinMBTI.state.isQuickTest = false;
            }
            // 隐藏悬浮工具栏
            const toolbar = document.getElementById('float-toolbar');
            if (toolbar) {
                toolbar.classList.remove('show');
            }
            this.showPage('welcome');
        });
    },

    /**
     * 返回首页
     */
    goHome: function () {
        this.answers = [];
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.clearProgress();
        // 清除快速测试标志
        if (typeof GenshinMBTI !== 'undefined') {
            GenshinMBTI.state.isQuickTest = false;
        }
        // 隐藏悬浮工具栏
        const toolbar = document.getElementById('float-toolbar');
        if (toolbar) {
            toolbar.classList.remove('show');
        }
        this.showPage('welcome');
    },

    /**
     * 显示特质说明弹窗
     * 
     * @param {HTMLElement} element - 元素卡片元素
     */
    showTraitModal: function (element) {
        const trait = element.dataset.trait;
        const desc = element.dataset.desc;
        const elementKey = element.dataset.element;
        const elementName = element.querySelector('.element-name').textContent;

        const modal = document.getElementById('trait-modal');
        const content = document.getElementById('trait-modal-content');
        const iconEl = document.getElementById('trait-modal-icon');
        const titleEl = document.getElementById('trait-modal-title');
        const descEl = document.getElementById('trait-modal-desc');

        if (modal && content && iconEl && titleEl && descEl) {
            content.setAttribute('data-element', elementKey);

            iconEl.innerHTML = `<img src="assets/images/elements/${elementKey}.png" alt="${elementName}元素">`;

            if (elementKey === 'physical') {
                iconEl.querySelector('img').style.filter = 'drop-shadow(0 0 8px rgba(200, 200, 200, 0.9))';
            }

            titleEl.textContent = `${elementName} · ${trait}`;
            descEl.textContent = desc;
            modal.classList.add('show');
        }
    },

    /**
     * 隐藏特质说明弹窗
     */
    hideTraitModal: function () {
        const modal = document.getElementById('trait-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * 分享结果 - 显示分享卡片弹窗
     */
    shareResult: function () {
        const result = this.currentResult;
        if (!result) {
            alert('没有可分享的结果');
            return;
        }

        this.showShareModal(result);
    },

    /**
     * 显示分享卡片弹窗
     * 
     * @param {Object} result - 测试结果对象
     */
    showShareModal: function (result) {
        const modal = document.getElementById('share-modal');
        if (!modal) return;

        this.populateShareCard(result);

        modal.classList.add('show');

        this.initShareModalEvents();
    },

    /**
     * 填充分享卡片内容
     * 
     * @param {Object} result - 测试结果对象
     */
    populateShareCard: function (result) {
        const labelEl = document.getElementById('share-label');
        const subtitleEl = document.getElementById('share-subtitle');
        const descriptionEl = document.getElementById('share-description');
        const characterIntroEl = document.getElementById('share-character-intro');
        const dimensionsEl = document.getElementById('share-dimensions');
        const cardHeader = document.querySelector('.share-card-header');
        const cardTextBox = document.querySelector('.share-card-text-box');
        const cardFooter = document.querySelector('.share-card-footer');

        // 检测是否是移动端
        const isMobile = window.innerWidth <= 768 || document.body.classList.contains('mobile-device');

        // 设置背景图片（移动端使用 mobile_card，PC端使用 portrait）
        const bgImg = document.getElementById('share-bg-img');
        if (bgImg) {
            const characterFull = result?.characterFull;
            let portraitUrl = null;
            let showcaseUrl = null;
            let mobileCardUrl = null;

            // 获取 mobile_card 图片
            if (characterFull && characterFull.mobile_card) {
                mobileCardUrl = characterFull.mobile_card;
            } else if (characterFull && characterFull.assets && characterFull.assets.mobile_card) {
                mobileCardUrl = characterFull.assets.mobile_card;
            } else {
                const character = this.getCharacterByMbti(result.type);
                if (character && character.mobile_card) {
                    mobileCardUrl = character.mobile_card;
                } else if (character && character.assets && character.assets.mobile_card) {
                    mobileCardUrl = character.assets.mobile_card;
                }
            }

            // 优先从 characterFull 获取 portrait
            if (characterFull && characterFull.portrait) {
                portraitUrl = characterFull.portrait;
            } else if (characterFull && characterFull.assets && characterFull.assets.portrait) {
                portraitUrl = characterFull.assets.portrait;
            } else {
                // 从默认角色数据获取
                const character = this.getCharacterByMbti(result.type);
                if (character && character.portrait) {
                    portraitUrl = character.portrait;
                } else if (character && character.assets && character.assets.portrait) {
                    portraitUrl = character.assets.portrait;
                }
            }

            // 获取 showcase 图片用于提取颜色
            if (characterFull && characterFull.showcase) {
                showcaseUrl = characterFull.showcase;
            } else if (characterFull && characterFull.assets && characterFull.assets.showcase) {
                showcaseUrl = characterFull.assets.showcase;
            } else {
                const character = this.getCharacterByMbti(result.type);
                if (character && character.showcase) {
                    showcaseUrl = character.showcase;
                } else if (character && character.assets && character.assets.showcase) {
                    showcaseUrl = character.assets.showcase;
                }
            }

            // PC端和移动端都使用 mobile_card
            if (mobileCardUrl) {
                bgImg.src = mobileCardUrl;
            } else if (portraitUrl) {
                bgImg.src = portraitUrl;
            }

            // 获取气质类型代码
            let temperamentCode = '';
            if (this.elementTemperamentMapping && result.type) {
                temperamentCode = this.elementTemperamentMapping.type_mapping[result.type] || '';
            }

            // 气质类型专属颜色
            const temperamentColors = {
                'NT': '#C084FC',
                'NF': '#6EE7B3',
                'ST': '#60A5FA',
                'SF': '#FBBF24'
            };

            // 使用 showcase 图片提取颜色和亮度
            if (showcaseUrl) {
                this.extractImageColorExcludingTransparent(showcaseUrl, function (color, brightness) {
                    // 设置渐变背景
                    const gradientEl = document.getElementById('share-bg-gradient');
                    if (gradientEl) {
                        gradientEl.style.background = `linear-gradient(to bottom, #ffffff 0%, #ffffff 10%, ${color} 50%, ${color} 100%)`;
                    }

                    // 获取气质类型基础颜色
                    const baseColor = temperamentColors[temperamentCode] || '#C084FC';

                    // 根据背景亮度调整气质颜色明暗
                    let textColor;
                    if (brightness < 128) {
                        // 背景暗，用更亮的气质颜色
                        textColor = adjustBrightness(baseColor, 1.4);
                    } else {
                        // 背景亮，用更暗的气质颜色
                        textColor = adjustBrightness(baseColor, 0.7);
                    }

                    // 其他文字颜色
                    const descColor = brightness > 128 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)';
                    const labelColor = brightness > 128 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.6)';
                    const bgColor = brightness > 128 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)';

                    // 主标题背景
                    if (cardHeader) {
                        cardHeader.style.background = bgColor;
                        const labelNameEl = cardHeader.querySelector('.share-card-label-name');
                        if (labelNameEl) labelNameEl.style.color = textColor;
                    }
                    // 副标题背景
                    if (subtitleEl) {
                        subtitleEl.style.background = bgColor;
                        const nameEl = subtitleEl.querySelector('.subtitle-name');
                        const suffixEl = subtitleEl.querySelector('.subtitle-suffix');
                        if (nameEl) nameEl.style.color = textColor;
                        if (suffixEl) suffixEl.style.color = labelColor;
                        // 命座颜色也用气质类型颜色
                        const rightEl = subtitleEl.querySelector('.subtitle-right');
                        if (rightEl) rightEl.style.color = textColor;
                    }
                    // 详细文本背景
                    if (cardTextBox) {
                        cardTextBox.style.background = bgColor;
                        const descEl = cardTextBox.querySelector('.share-card-description');
                        const introEl = cardTextBox.querySelector('.share-card-character-intro');
                        if (descEl) descEl.style.color = descColor;
                        if (introEl) introEl.style.color = labelColor;
                    }
                });
            }

            /**
             * 调整颜色亮度
             * @param {string} hexColor - 十六进制颜色
             * @param {number} factor - 亮度因子（>1调亮，<1调暗）
             * @returns {string} 调整后的十六进制颜色
             */
            function adjustBrightness(hexColor, factor) {
                const hex = hexColor.replace('#', '');
                const r = Math.min(255, Math.max(0, Math.round(parseInt(hex.substr(0, 2), 16) * factor)));
                const g = Math.min(255, Math.max(0, Math.round(parseInt(hex.substr(2, 2), 16) * factor)));
                const b = Math.min(255, Math.max(0, Math.round(parseInt(hex.substr(4, 2), 16) * factor)));
                return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
            }
        }

        // 设置元素组合（不过滤 physical 元素）
        if (labelEl) {
            const elements = result.elements || [];
            const elementNames = elements.map(el => this.getElementName(el)).join('');
            labelEl.textContent = elementNames || '-';
        }

        // 设置副标题（角色名称 + 气质类型）
        if (subtitleEl) {
            const characterFull = result?.characterFull;
            const characterName = characterFull?.name || this.getCharacterNameByMbti(result.type);

            // 获取气质类型名称（直接使用 elementTemperamentMapping）
            let temperamentName = '';
            if (this.elementTemperamentMapping && result.type) {
                const temperamentCode = this.elementTemperamentMapping.type_mapping[result.type];
                if (temperamentCode && this.elementTemperamentMapping.temperaments[temperamentCode]) {
                    temperamentName = this.elementTemperamentMapping.temperaments[temperamentCode].name;
                }
            }

            // 更新左侧角色名称
            const subtitleNameEl = subtitleEl.querySelector('.subtitle-name');
            if (subtitleNameEl) {
                subtitleNameEl.textContent = characterName || '-';
            }

            // 更新右侧命座
            const subtitleRightEl = document.getElementById('share-subtitle-right');
            if (subtitleRightEl) {
                // 获取角色命座
                const characterFull = result?.characterFull;
                let constellationName = '';
                if (characterFull && characterFull.constellation) {
                    constellationName = characterFull.constellation;
                } else {
                    const character = this.getCharacterByMbti(result.type);
                    if (character && character.constellation) {
                        constellationName = character.constellation;
                    }
                }
                subtitleRightEl.textContent = constellationName || temperamentName || '-';
            }
        }

        // 设置维度圆形
        if (dimensionsEl && result.dimensionScores) {
            this.renderShareDimensions(result.dimensionScores, dimensionsEl, result.type);
        }

        // 设置性格简介（包含适合领域、沟通风格等）
        if (descriptionEl) {
            this.populateDescription(result, descriptionEl);
        }

        // 设置角色简介（角色背景故事）
        if (characterIntroEl) {
            const characterFull = result?.characterFull;
            let characterDesc = null;

            if (characterFull && characterFull.description) {
                characterDesc = characterFull.description;
            } else {
                const character = this.getCharacterByMbti(result.type);
                if (character && character.description) {
                    characterDesc = character.description;
                }
            }

            if (characterDesc) {
                // 截取前100个字符
                characterIntroEl.textContent = characterDesc.length > 100 ? characterDesc.substring(0, 100) + '...' : characterDesc;
            } else {
                characterIntroEl.textContent = '-';
            }
        }

        // 生成当前网址的二维码
        this.generateShareQRCode();
    },

    /**
     * 预生成二维码（在计算等待期间调用）
     * 将二维码存储为 data URL，供后续分享使用
     */
    preGenerateQRCode: function () {
        const currentUrl = window.location.href;

        if (typeof QRCode !== 'undefined') {
            try {
                // 创建离屏 canvas 生成二维码
                const canvas = document.createElement('canvas');
                QRCode.toCanvas(canvas, currentUrl, {
                    width: 50,
                    margin: 1,
                    color: {
                        dark: '#333333',
                        light: '#ffffff'
                    },
                    errorCorrectionLevel: 'M'
                });

                // 将二维码存储为 data URL
                this._preGeneratedQRCode = canvas.toDataURL('image/png');
            } catch (error) {
                console.error('预生成二维码失败:', error);
                this._preGeneratedQRCode = null;
            }
        } else {
            this._preGeneratedQRCode = null;
        }
    },

    /**
     * 生成分享卡片的二维码
     * 如果已有预生成的二维码则直接使用，否则实时生成
     */
    generateShareQRCode: function () {
        const qrcodeContainer = document.getElementById('share-qrcode');
        if (!qrcodeContainer) return;

        // 清空现有内容
        qrcodeContainer.innerHTML = '';

        // 如果有预生成的二维码，直接使用
        if (this._preGeneratedQRCode) {
            const img = document.createElement('img');
            img.src = this._preGeneratedQRCode;
            img.style.width = '50px';
            img.style.height = '50px';
            img.style.borderRadius = '6px';
            qrcodeContainer.appendChild(img);
            return;
        }

        // 否则实时生成
        const currentUrl = window.location.href;

        if (typeof QRCode !== 'undefined') {
            try {
                const canvas = document.createElement('canvas');
                qrcodeContainer.appendChild(canvas);

                QRCode.toCanvas(canvas, currentUrl, {
                    width: 50,
                    margin: 1,
                    color: {
                        dark: '#333333',
                        light: '#ffffff'
                    },
                    errorCorrectionLevel: 'M'
                });

                canvas.style.width = '50px';
                canvas.style.height = '50px';
            } catch (error) {
                console.error('二维码生成失败:', error);
                qrcodeContainer.innerHTML = '<div class="qrcode-placeholder">扫码测试</div>';
            }
        } else {
            qrcodeContainer.innerHTML = '<div class="qrcode-placeholder">扫码测试</div>';
        }
    },

    /**
     * 填充性格描述（使用分享卡片简介数据）
     * 
     * @param {Object} result - 测试结果对象
     * @param {HTMLElement} descEl - 描述元素
     */
    populateDescription: function (result, descEl) {
        console.log('========== [populateDescription] 开始 ==========');
        if (!result?.type) {
            descEl.textContent = '-';
            return;
        }

        // 获取元素组合
        const elements = result.elements || [];
        const filteredElements = elements.filter(el => el !== 'physical');
        const elementNames = filteredElements.map(el => this.getElementName(el)).join('');

        // 获取角色名称
        const characterFull = result?.characterFull;
        const characterName = characterFull?.name || this.getCharacterNameByMbti(result.type);

        // 构建测试结果描述
        let introText = '';
        if (elementNames && characterName) {
            introText = `根据测试结果显示，您的性格元素是${elementNames}，也就是「${characterName}型人格」。`;
        } else if (characterName) {
            introText = `测试结果显示，我的人格类型对应原神里的「${characterName}」。`;
        }

        // 获取性格分析文本 - 优先使用后端返回的 cardSummary
        let analysisText = '';

        // 1. 优先使用后端返回的 cardSummary 字符串
        if (result.cardSummary) {
            console.log('[populateDescription] 使用后端返回的 cardSummary');
            analysisText = TermRenderer.render(result.cardSummary);
        }
        // 2. 其次使用本地 mbtiCardSummaries 数据
        else if (this.mbtiCardSummaries && this.mbtiCardSummaries[result.type]) {
            console.log('[populateDescription] 使用本地 mbtiCardSummaries');
            const cardSummary = this.mbtiCardSummaries[result.type];
            if (cardSummary.summary) {
                analysisText = TermRenderer.render(cardSummary.summary);
            }
        } else {
            console.log('[populateDescription] 没有 cardSummary 数据');
        }

        console.log('[populateDescription] introText:', introText);
        console.log('[populateDescription] analysisText:', analysisText ? analysisText.substring(0, 50) + '...' : '(空)');

        // 组合文本
        if (introText && analysisText) {
            descEl.textContent = introText + ' ' + analysisText;
        } else if (analysisText) {
            descEl.textContent = analysisText;
        } else if (introText) {
            descEl.textContent = introText;
        } else {
            descEl.textContent = result.description || '-';
        }

        console.log('========== [populateDescription] 完成 ==========');
    },

    /**
     * 提取图片的主要颜色（排除透明像素）
     * 
     * @param {string} imageUrl - 图片URL
     * @param {Function} callback - 回调函数，返回颜色值和亮度
     */
    extractImageColorExcludingTransparent: function (imageUrl, callback) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // 收集所有非透明像素的颜色
            const colorBuckets = {};

            // 采样图片的主要区域（上部裁去10%，下部裁去30%）
            const totalRows = canvas.height;
            const startY = Math.floor(totalRows * 0.1);
            const endY = Math.floor(totalRows * 0.7);

            for (let y = startY; y < endY; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    const alpha = data[i + 3];

                    // 排除透明像素（alpha < 128 视为透明）
                    if (alpha >= 128) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];

                        // 转换为 HSL 获取色调
                        const hsl = UI.rgbToHsl(r, g, b);
                        const hue = hsl.h;

                        // 按彩虹顺序分组（红橙黄绿青蓝紫）
                        let hueGroup;
                        if (hue < 15 || hue >= 345) {
                            hueGroup = 0; // 红色
                        } else if (hue < 45) {
                            hueGroup = 1; // 橙色
                        } else if (hue < 75) {
                            hueGroup = 2; // 黄色
                        } else if (hue < 150) {
                            hueGroup = 3; // 绿色
                        } else if (hue < 195) {
                            hueGroup = 4; // 青色
                        } else if (hue < 255) {
                            hueGroup = 5; // 蓝色
                        } else if (hue < 345) {
                            hueGroup = 6; // 紫色
                        }

                        if (!colorBuckets[hueGroup]) {
                            colorBuckets[hueGroup] = { r: 0, g: 0, b: 0, count: 0 };
                        }
                        colorBuckets[hueGroup].r += r;
                        colorBuckets[hueGroup].g += g;
                        colorBuckets[hueGroup].b += b;
                        colorBuckets[hueGroup].count++;
                    }
                }
            }

            // 找到像素最多的色调组
            let maxCount = 0;
            let dominantGroup = 0;
            for (const group in colorBuckets) {
                if (colorBuckets[group].count > maxCount) {
                    maxCount = colorBuckets[group].count;
                    dominantGroup = parseInt(group);
                }
            }

            if (maxCount === 0) {
                callback('rgba(100, 100, 100, 0.5)', 128);
                return;
            }

            // 计算该组的平均颜色
            const bucket = colorBuckets[dominantGroup];
            const r = Math.floor(bucket.r / bucket.count);
            const g = Math.floor(bucket.g / bucket.count);
            const b = Math.floor(bucket.b / bucket.count);

            // 计算亮度
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            // 返回颜色和亮度
            callback(`rgba(${r}, ${g}, ${b}, 0.5)`, brightness);
        };

        img.onerror = function () {
            callback('rgba(100, 100, 100, 0.5)', 128);
        };

        img.src = imageUrl;
    },

    /**
     * RGB 转 HSL
     */
    rgbToHsl: function (r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    },

    /**
     * 提取图片的主要颜色
     * 
     * @param {string} imageUrl - 图片URL
     * @param {Function} callback - 回调函数，返回颜色值和亮度
     */
    extractImageColor: function (imageUrl, callback) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let r = 0, g = 0, b = 0, count = 0;

            // 采样图片的主要区域（上部裁去10%，下部裁去30%）
            const startY = Math.floor(data.length * 0.1);
            const endY = Math.floor(data.length * 0.7);

            for (let i = startY; i < endY; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            // 计算亮度
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            // 返回半透明颜色和亮度
            callback(`rgba(${r}, ${g}, ${b}, 0.5)`, brightness);
        };

        img.onerror = function () {
            callback('rgba(0, 0, 0, 0.5)', 0);
        };

        img.src = imageUrl;
    },

    /**
     * 提取图片下方的颜色
     * 
     * @param {string} imageUrl - 图片URL
     * @param {Function} callback - 回调函数，返回颜色值和亮度
     */
    extractBottomColor: function (imageUrl, callback) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let r = 0, g = 0, b = 0, count = 0;

            // 采样图片下方30%的区域
            const startY = Math.floor(data.length * 0.7);
            const endY = data.length;

            for (let i = startY; i < endY; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            // 计算亮度
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            // 返回颜色和亮度
            callback(`rgba(${r}, ${g}, ${b}, 0.5)`, brightness);
        };

        img.onerror = function () {
            callback('rgba(0, 0, 0, 0.5)', 0);
        };

        img.src = imageUrl;
    },

    /**
     * 渲染分享卡片的维度圆形
     * 
     * @param {Object} dimensionScores - 维度得分
     * @param {HTMLElement} container - 容器元素
     * @param {string} mbtiType - MBTI类型
     */
    renderShareDimensions: function (dimensionScores, container, mbtiType) {
        const elementColors = {
            'anemo': '#74c2a8',
            'hydro': '#4cc2f1',
            'pyro': '#ef7938',
            'geo': '#f0b232',
            'electro': '#b08fc2',
            'dendro': '#a5c83b',
            'cryo': '#9fd6e3',
            'physical': '#999999'
        };

        const letterToElement = {
            'E': 'anemo',
            'I': 'hydro',
            'S': 'pyro',
            'N': 'geo',
            'T': 'electro',
            'F': 'dendro',
            'J': 'cryo',
            'P': 'physical'
        };

        const dimensionMap = {
            'E': 'EI',
            'I': 'EI',
            'S': 'SN',
            'N': 'SN',
            'T': 'TF',
            'F': 'TF',
            'J': 'JP',
            'P': 'JP'
        };

        const letterIsLeft = {
            'I': true,
            'E': false,
            'S': true,
            'N': false,
            'T': true,
            'F': false,
            'J': true,
            'P': false
        };

        let html = '';
        const letters = mbtiType ? mbtiType.split('') : [];

        letters.forEach(letter => {
            const element = letterToElement[letter];
            const dimKey = dimensionMap[letter];
            const score = dimensionScores[dimKey];

            if (element && elementColors[element] && score) {
                const color = elementColors[element];
                let percentage;

                if (score.leftScore !== undefined && score.rightScore !== undefined) {
                    percentage = letterIsLeft[letter] ? score.leftScore : score.rightScore;
                } else {
                    percentage = Math.round(score.percentage || 50);
                    if (!letterIsLeft[letter]) {
                        percentage = 100 - percentage;
                    }
                }

                html += `
                    <div class="share-card-dimension">
                        <div class="share-card-dimension-circle" style="background: ${color};">
                            ${percentage}
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    },

    /**
     * 填充分享卡片摘要
     * 
     * @param {Object} result - 测试结果对象
     * @param {HTMLElement} summaryEl - 摘要元素
     */
    populateShareSummary: function (result, summaryEl) {
        if (!result?.type || !this.mbtiMapping) return;

        const mapping = this.mbtiMapping[result.type];
        if (!mapping) return;

        let summaryParts = [];

        // 适合领域 - 随机取最多3个
        const fields = mapping.suitable_careers?.suitable_fields;
        if (fields && fields.length > 0) {
            const shuffled = [...fields].sort(() => Math.random() - 0.5);
            const selectedFields = shuffled.slice(0, Math.min(3, fields.length));
            const fieldNames = selectedFields.map(f => f.category).join('、');
            summaryParts.push(`适合领域：${fieldNames}`);
        }

        // 最适配性格 - 找最高级别，列出全部
        const relationshipAdvice = mapping.relationship_advice;
        if (relationshipAdvice && relationshipAdvice.length > 0) {
            let maxLevel = 0;
            relationshipAdvice.forEach(r => {
                if (r.level > maxLevel) maxLevel = r.level;
            });

            const bestMatches = relationshipAdvice.filter(r => r.level === maxLevel);
            if (bestMatches.length > 0) {
                const matchElements = bestMatches.map(m => TermRenderer.getElements(m.other_type)).join('、');
                summaryParts.push(`最适配性格：${matchElements}`);
            }
        }

        // 沟通风格
        const communicationStyle = mapping.social_style?.communication_style;
        if (communicationStyle) {
            summaryParts.push(`沟通风格：${TermRenderer.render(communicationStyle)}`);
        }

        // 家庭角色
        const familyRole = mapping.family_style?.family_role;
        if (familyRole) {
            summaryParts.push(`在家庭中，您是${TermRenderer.render(familyRole)}`);
        }

        summaryEl.textContent = summaryParts.join('。') + '。';
    },

    /**
     * 根据MBTI类型获取角色信息
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object|null} 角色信息对象
     */
    getCharacterByMbti: function (mbtiType) {
        if (!mbtiType || !this.mbtiMapping || !this.charactersData) return null;

        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return null;

        const gender = GenshinMBTI?.state?.gender || 'female';
        const characterId = mapping[`primary_${gender}`] || mapping.primary_male || mapping.primary_female;

        if (characterId && this.charactersData[characterId]) {
            return this.charactersData[characterId];
        }

        return null;
    },

    /**
     * 初始化分享弹窗事件
     */
    initShareModalEvents: function () {
        const modal = document.getElementById('share-modal');
        const closeBtn = document.getElementById('share-modal-close');
        const downloadBtn = document.getElementById('share-download-btn');

        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.remove('show');
            };
        }

        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            };
        }

        if (downloadBtn) {
            downloadBtn.onclick = () => {
                this.downloadShareCard();
            };
        }

        const copyBtn = document.getElementById('share-copy-btn');
        if (copyBtn) {
            copyBtn.onclick = () => {
                this.copyShareCard();
            };
        }
    },

    /**
     * 下载分享卡片图片
     */
    downloadShareCard: async function () {
        const card = document.getElementById('share-card');
        if (!card) {
            alert('分享卡片未找到');
            return;
        }

        const downloadBtn = document.getElementById('share-download-btn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<span>生成中...</span>';
        downloadBtn.disabled = true;

        try {
            // 使用 domtoimage 库，支持更多 CSS 效果
            const dataUrl = await domtoimage.toPng(card, {
                quality: 1,
                scale: 2,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });

            const link = document.createElement('a');
            const result = this.currentResult;
            const filename = result ? `原神MBTI_${result.type}.png` : '原神MBTI_分享卡片.png';

            link.download = filename;
            link.href = dataUrl;
            link.click();

            downloadBtn.innerHTML = '<span>下载成功！</span>';
            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('生成图片失败:', error);
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
            alert('生成图片失败，请重试');
        }
    },

    /**
     * 复制分享卡片到剪贴板
     */
    copyShareCard: async function () {
        const card = document.getElementById('share-card');
        const copyBtn = document.getElementById('share-copy-btn');

        if (!card) {
            alert('分享卡片未找到');
            return;
        }

        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>复制中...</span>';
        copyBtn.disabled = true;

        try {
            // 使用 domtoimage 库，支持更多 CSS 效果
            const blob = await domtoimage.toBlob(card, {
                quality: 1,
                scale: 2,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });

            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);

            copyBtn.innerHTML = '<span>复制成功！</span>';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('复制图片失败:', error);
            copyBtn.innerHTML = originalText;
            copyBtn.disabled = false;
            alert('复制图片失败，请重试');
        }
    },

    /**
     * 隐藏分享弹窗
     */
    hideShareModal: function () {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * 快速测试 - 调用主程序显示性别选择弹窗
     */
    quickTest: function () {
        GenshinMBTI.quickTest();
    },

    fullFlowTest: function () {
        GenshinMBTI.fullFlowTest();
    },

    /**
     * 快速测试（已选择性别） - 生成模拟答案并直接跳到结果页
     * 
     * @param {string} gender - 性别 ('male' 或 'female')
     */
    quickTestWithGender: function (gender) {
        this.showQuickTestCalculatingPage(gender);
    },

    /**
     * 显示快速测试的计算中页面
     * 
     * @param {string} gender - 性别 ('male' 或 'female')
     */
    showQuickTestCalculatingPage: function (gender) {
        GenshinMBTI.state.gender = gender;

        // 隐藏所有页面元素
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        let container = document.getElementById('calculating-page-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'calculating-page-container';
            document.body.appendChild(container);
        }

        // 保持视频背景可见，计算页面使用透明背景
        const videoBg = document.getElementById('video-background');
        if (videoBg) {
            videoBg.style.display = 'block';
            videoBg.style.zIndex = '0';
        }

        container.innerHTML = `
            <div class="calculating-page">
                <div class="calculating-card">
                    <div class="mhy-login-platform__loading--rotation">
                        <div></div>
                    </div>
                    <div class="calculating-message" id="quick-calculating-message">${LOADING_MESSAGES[0]}</div>
                </div>
            </div>
        `;

        const messageEl = document.getElementById('quick-calculating-message');

        const startTime = Date.now();
        const minDuration = 3000;

        let result = null;
        let audioPlayed = false;

        const calculateResult = () => {
            const testData = QuickTest.execute(gender, GenshinMBTI.state.questions);
            result = testData.result;
        };

        const showResult = () => {
            if (result) {
                this.displayResult(result);
            }
        };

        const playAudioAndShowResult = () => {
            if (audioPlayed) return;
            audioPlayed = true;
            this.playEntranceAudio(result);
            setTimeout(showResult, 500);
        };

        const usedMessages = new Set();
        const getRandomMessage = () => {
            const available = LOADING_MESSAGES.filter((_, i) => !usedMessages.has(i));
            if (available.length === 0) {
                usedMessages.clear();
                return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
            }
            const randomIndex = Math.floor(Math.random() * available.length);
            const originalIndex = LOADING_MESSAGES.indexOf(available[randomIndex]);
            usedMessages.add(originalIndex);
            return available[randomIndex];
        };

        let currentMessage = LOADING_MESSAGES[0];
        let dots = 0;
        let lastDotTime = Date.now();
        const dotInterval = 400;

        const updateUI = () => {
            const elapsed = Date.now() - startTime;
            const now = Date.now();

            if (now - lastDotTime >= dotInterval) {
                dots++;
                if (dots > 3) {
                    dots = 0;
                    currentMessage = getRandomMessage();
                }
                lastDotTime = now;
            }

            const dotsStr = '.'.repeat(dots);

            if (messageEl) {
                messageEl.textContent = currentMessage + dotsStr;
            }

            if (result && elapsed >= minDuration && !audioPlayed) {
                playAudioAndShowResult();
                return;
            }

            if (!result || elapsed < minDuration) {
                requestAnimationFrame(updateUI);
            }
        };

        setTimeout(calculateResult, 0);
        requestAnimationFrame(updateUI);
    },

    /**
     * 显示直接查看结果弹窗
     */
    showDirectResultModal: function () {
        const modal = document.getElementById('direct-result-modal');
        if (modal) {
            modal.classList.add('show');
            // 重置选择
            const select = document.getElementById('mbti-type-select');
            if (select) select.value = '';
        }
    },

    /**
     * 隐藏直接查看结果弹窗
     */
    hideDirectResultModal: function () {
        const modal = document.getElementById('direct-result-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * 显示调试测试弹窗
     */
    showDebugModal: function () {
        const modal = document.getElementById('debug-modal');
        if (modal) {
            modal.classList.add('show');
        }
    },

    /**
     * 隐藏调试测试弹窗
     */
    hideDebugModal: function () {
        const modal = document.getElementById('debug-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * 处理调试测试确认
     */
    handleDebugConfirm: function () {
        const input = document.getElementById('debug-json-input');
        if (!input) return;

        const jsonText = input.value.trim();
        if (!jsonText) {
            alert('请输入JSON数据');
            return;
        }

        try {
            const data = JSON.parse(jsonText);
            console.log('[调试测试] 解析成功:', data);

            this.hideDebugModal();

            // 复用 displayResult 函数显示结果
            this.displayResult(data);

        } catch (error) {
            console.error('[调试测试] JSON解析失败:', error);
            alert('JSON格式错误: ' + error.message);
        }
    },

    /**
     * 初始化AI答题须知滚动检测
     * 检测用户是否滚动到底部，只有滚动到底部才能选择性别开始答题
     */
    initAITipsScrollCheck: function () {
        const tipWrapper = document.querySelector('#ai-test-tips .tip-content-wrapper');
        const genderSection = document.getElementById('ai-gender-select-section');
        const scrollHint = document.getElementById('tip-scroll-hint');

        if (!tipWrapper || !genderSection) {
            console.log('[滚动检测] 未找到必要元素');
            return;
        }

        genderSection.classList.add('disabled');
        const options = genderSection.querySelectorAll('.gender-modal-option');
        options.forEach(opt => opt.classList.add('disabled'));

        const checkScroll = () => {
            const scrollTop = tipWrapper.scrollTop;
            const scrollHeight = tipWrapper.scrollHeight;
            const clientHeight = tipWrapper.clientHeight;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

            if (isAtBottom) {
                genderSection.classList.remove('disabled');
                options.forEach(opt => opt.classList.remove('disabled'));
                if (scrollHint) {
                    scrollHint.classList.add('hidden');
                }
                console.log('[滚动检测] 已滚动到底部，启用性别选择');
            }
        };

        tipWrapper.removeEventListener('scroll', checkScroll);
        tipWrapper.addEventListener('scroll', checkScroll);

        setTimeout(checkScroll, 100);
    },

    /**
     * 重置AI答题须知滚动检测状态
     * 用于关闭弹窗后重置状态
     */
    resetAITipsScrollCheck: function () {
        const tipWrapper = document.querySelector('#ai-test-tips .tip-content-wrapper');
        const genderSection = document.getElementById('ai-gender-select-section');
        const scrollHint = document.getElementById('tip-scroll-hint');

        if (tipWrapper) {
            tipWrapper.scrollTop = 0;
        }
        if (genderSection) {
            genderSection.classList.add('disabled');
            const options = genderSection.querySelectorAll('.gender-modal-option');
            options.forEach(opt => opt.classList.add('disabled'));
        }
        if (scrollHint) {
            scrollHint.classList.remove('hidden');
        }
    },

    /**
     * 检查AI答题是否有保存的进度
     * 
     * @returns {Object|null} 进度数据或null
     */
    checkAIProgress: function () {
        try {
            const saved = localStorage.getItem('ai_analysis_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                // 检查是否有有效答案
                const hasAnswers = progress.answers && Object.keys(progress.answers).length > 0;
                if (hasAnswers && progress.questions && progress.questions.length > 0) {
                    return progress;
                }
            }
        } catch (e) {
            console.error('检查AI进度失败:', e);
        }
        return null;
    },

    /**
     * 开始大模型深度分析测试
     */
    startAITest: function () {
        this.resetAITipsScrollCheck();

        // 检查是否有保存的进度
        const progress = this.checkAIProgress();
        if (progress) {
            // 显示断点续答提示
            this.showProgressPrompt(progress, 'ai');
        } else {
            this.showGenderModalForAI();
        }
    },

    /**
     * 性别选择后开始大模型测试（显示模式选择）
     */
    startAITestAfterGender: function () {
        if (window.AIAnalysis && window.AIAnalysis.showModeSelectModal) {
            window.AIAnalysis.showModeSelectModal();
        }
    },

    /**
     * 直接开始指定题目数量的大模型测试
     * 
     * @param {number} count - 题目数量（10或25）
     */
    startAITestQuick: function (count) {
        this.resetAITipsScrollCheck();

        // 检查是否有保存的进度
        const progress = this.checkAIProgress();
        if (progress) {
            // 显示断点续答提示
            this.showProgressPrompt(progress, 'ai');
        } else {
            this.showGenderModalForAIQuick(count);
        }
    },

    /**
     * 显示性别选择弹窗（用于大模型快速测试）
     * 
     * @param {number} count - 题目数量
     */
    showGenderModalForAIQuick: function (count) {
        const modal = document.getElementById('gender-modal');
        if (modal) {
            modal.classList.add('show');
            modal.dataset.mode = 'ai-quick';
            modal.dataset.count = count;
            const title = modal.querySelector('.gender-modal-title');
            if (title) {
                if (count === 5) {
                    title.textContent = '快速人格解析';
                } else if (count === 10) {
                    title.textContent = '基础人格解析';
                } else if (count === 25) {
                    title.textContent = '完整人格解析';
                } else {
                    title.textContent = '人格解析';
                }
            }
            const versionDiv = document.getElementById('gender-modal-version');
            if (versionDiv) {
                versionDiv.style.display = 'none';
            }
            const normalTips = document.getElementById('normal-test-tips');
            const aiTips = document.getElementById('ai-test-tips');
            if (normalTips) normalTips.style.display = 'none';
            if (aiTips) aiTips.style.display = 'block';

            this.initAITipsScrollCheck();
        }
    },

    /**
     * 启动AI固定题测试
     * 显示性别选择弹窗，选择后跳转到AI答题页面并自动填充固定题目和答案
     */
    startAIFixedTest: function () {
        console.log('========== [AI固定题测试] 显示性别选择弹窗 ==========');
        this.resetAITipsScrollCheck();
        this.showGenderModalForAIFixedTest();
    },

    /**
     * 显示性别选择弹窗（用于AI固定题测试）
     */
    showGenderModalForAIFixedTest: function () {
        const modal = document.getElementById('gender-modal');
        if (modal) {
            modal.classList.add('show');
            modal.dataset.mode = 'ai-fixed';
            const title = modal.querySelector('.gender-modal-title');
            if (title) {
                title.textContent = 'AI固定题测试';
            }
            const versionDiv = document.getElementById('gender-modal-version');
            if (versionDiv) {
                versionDiv.style.display = 'none';
            }
            const normalTips = document.getElementById('normal-test-tips');
            const aiTips = document.getElementById('ai-test-tips');
            if (normalTips) normalTips.style.display = 'none';
            if (aiTips) aiTips.style.display = 'block';

            this.initAITipsScrollCheck();
        }
    },

    /**
     * AI固定题测试 - 选择性别后开始
     * 
     * @param {string} gender - 性别 ('male' 或 'female')
     */
    startAIFixedTestWithGender: function (gender) {
        console.log('========== [AI固定题测试] 开始，性别:', gender, '==========');

        // 固定的测试数据
        const fixedQuestions = [
            {
                id: 'fixed_1',
                scene: '春天的郊外，你和几个人一起外出放松，周围有自然的景色和轻松的氛围。',
                question: '你会更倾向于参与哪些活动，注意力会放在身边的哪些事物上？',
                hint: '观察你对环境的关注点和活动偏好',
                dimensions: ['S/N', 'E/I'],
                creator: '测试'
            },
            {
                id: 'fixed_2',
                scene: '假如你在学习一项新技能（比如弹吉他、做菜或编程），练了一段时间后遇到了瓶颈，进步很慢。',
                question: '请描述你接下来会怎么做，比如你会如何分析问题、会不会请教他人，以及你的情绪变化。',
                hint: '观察你的学习方式和问题解决策略',
                dimensions: ['T/F', 'J/P'],
                creator: '测试'
            },
            {
                id: 'fixed_3',
                scene: '朋友向你倾诉一件让他纠结很久的烦心事，情绪比较低落。',
                question: '你会如何回应对方，心里会产生哪些感受和想法？',
                hint: '观察你的情感表达和人际互动方式',
                dimensions: ['T/F', 'E/I'],
                creator: '测试'
            },
            {
                id: 'fixed_4',
                scene: '你正在享受一段难得的独处时光，比如在傍晚时分泡了一杯热茶，准备看一本新买的书。',
                question: '如果此时家人或朋友突然提议一起出门，你会怎么想？请描述你对这种计划外变化的接受程度和应对方式。',
                hint: '观察你对计划变化的态度',
                dimensions: ['J/P', 'E/I'],
                creator: '测试'
            },
            {
                id: 'fixed_5',
                scene: '午休时，一位同事向你倾诉他对公司现状的不满，情绪有些激动，而周围还有其他人在。',
                question: '听着他的讲述，你心里在想什么，又会做出什么反应？',
                hint: '观察你在社交场合的反应',
                dimensions: ['T/F', 'E/I'],
                creator: '测试'
            }
        ];

        const fixedAnswers = {
            0: '郊外的话当然是远处的风景啊，青山绿水，或者路边的野花，那些鲜艳的颜色或者规律的形状，还有那些长相奇特可爱的石头，溪水里的鱼虾，清澈的泉水',
            1: '很少请教他人，一般都是自己琢磨，如果是很喜欢的事，可能会暂时放下来，放松一下心情，到合间精力投入进去，吃饭睡觉可能都在想这些事情，心情也会逐渐变得焦躁，并对自己的能力产生质疑。',
            2: '我还是会去安慰一下他，说一些，这不是你的错，你其实很好之类的话，但是慰能够让他的心情好起来，我甚至会有一些自豪、荣誉，或者说获得感。',
            3: '其实我不爱看书，但如果我这个时候正打算看书，可能我会想想办法推辞。或以带来比这本书更多的生活趣味，我或许自己玩一玩喜欢的东西。',
            4: '这得看情况，如果我也觉得公司不行，当然这只是在他太过聒噪的情况下才会发生的事。'
        };

        // 设置性别并保存到 localStorage
        GenshinMBTI.state.gender = gender;
        localStorage.setItem('genshin_mbti_progress', JSON.stringify({ gender: gender }));

        // 跳转到AI答题页面
        this.showPage('ai-analysis');

        // 等待页面渲染后填充数据
        setTimeout(async () => {
            if (window.AIAnalysis) {
                // 设置固定题目
                window.AIAnalysis.questions = fixedQuestions;
                // 设置固定答案
                window.AIAnalysis.answers = fixedAnswers;
                // 设置性别
                window.AIAnalysis.gender = gender;

                console.log('[AI固定题测试] 已设置固定题目和答案');
                console.log('[AI固定题测试] 题目:', fixedQuestions);
                console.log('[AI固定题测试] 答案:', fixedAnswers);

                // 加载模型列表
                await window.AIAnalysis.loadModels();

                // 渲染题目
                window.AIAnalysis.renderQuestions();

                // 绑定事件（重要！否则提交按钮不会工作）
                window.AIAnalysis.bindEvents();

                // 标记已初始化
                window.AIAnalysis.initialized = true;

                // 填充答案到输入框
                setTimeout(() => {
                    Object.keys(fixedAnswers).forEach(index => {
                        const textarea = document.querySelector(`textarea[data-index="${index}"]`);
                        if (textarea) {
                            textarea.value = fixedAnswers[index];
                            console.log(`[AI固定题测试] 已填充第 ${parseInt(index) + 1} 题答案`);
                        }
                    });
                }, 100);
            }
        }, 500);

        console.log('========== [AI固定题测试] 跳转完成 ==========');
    },

    /**
     * 显示性别选择弹窗（用于大模型测试）
     */
    showGenderModalForAI: function () {
        const modal = document.getElementById('gender-modal');
        if (modal) {
            modal.classList.add('show');
            modal.dataset.mode = 'ai';
            const title = modal.querySelector('.gender-modal-title');
            if (title) {
                title.textContent = '大模型深度分析';
            }
            const versionDiv = document.getElementById('gender-modal-version');
            if (versionDiv) {
                versionDiv.style.display = 'none';
            }
            const normalTips = document.getElementById('normal-test-tips');
            const aiTips = document.getElementById('ai-test-tips');
            if (normalTips) normalTips.style.display = 'none';
            if (aiTips) aiTips.style.display = 'block';

            this.initAITipsScrollCheck();
        }
    },

    /**
     * 生成指定MBTI类型的结果对象
     * 
     * @param {string} mbtiType - MBTI类型
     * @param {string} gender - 性别 ('male' 或 'female')
     * @returns {Object} 结果对象
     */
    generateResultForType: function (mbtiType, gender) {
        // 获取元素组合
        const elements = Calculator.getMBTIElements(mbtiType);

        // 获取认知功能堆叠
        const functionStack = Calculator.calculateFunctionStack(mbtiType);

        // 生成维度得分（默认50%）
        const dimensionScores = {
            EI: {
                leftScore: 50, rightScore: 50, total: 100,
                letter: mbtiType[0],
                percentage: mbtiType[0] === 'E' ? 55 : 45,
                leftElement: 'anemo', rightElement: 'hydro'
            },
            SN: {
                leftScore: 50, rightScore: 50, total: 100,
                letter: mbtiType[1],
                percentage: mbtiType[1] === 'S' ? 55 : 45,
                leftElement: 'pyro', rightElement: 'geo'
            },
            TF: {
                leftScore: 50, rightScore: 50, total: 100,
                letter: mbtiType[2],
                percentage: mbtiType[2] === 'T' ? 55 : 45,
                leftElement: 'electro', rightElement: 'dendro'
            },
            JP: {
                leftScore: 50, rightScore: 50, total: 100,
                letter: mbtiType[3],
                percentage: mbtiType[3] === 'J' ? 55 : 45,
                leftElement: 'cryo', rightElement: 'physical'
            }
        };

        // 根据MBTI类型调整维度得分
        if (mbtiType[0] === 'E') {
            dimensionScores.EI.leftScore = 65;
            dimensionScores.EI.rightScore = 35;
            dimensionScores.EI.percentage = 65;
        } else {
            dimensionScores.EI.leftScore = 35;
            dimensionScores.EI.rightScore = 65;
            dimensionScores.EI.percentage = 35;
        }

        if (mbtiType[1] === 'S') {
            dimensionScores.SN.leftScore = 65;
            dimensionScores.SN.rightScore = 35;
            dimensionScores.SN.percentage = 65;
        } else {
            dimensionScores.SN.leftScore = 35;
            dimensionScores.SN.rightScore = 65;
            dimensionScores.SN.percentage = 35;
        }

        if (mbtiType[2] === 'T') {
            dimensionScores.TF.leftScore = 65;
            dimensionScores.TF.rightScore = 35;
            dimensionScores.TF.percentage = 65;
        } else {
            dimensionScores.TF.leftScore = 35;
            dimensionScores.TF.rightScore = 65;
            dimensionScores.TF.percentage = 35;
        }

        if (mbtiType[3] === 'J') {
            dimensionScores.JP.leftScore = 65;
            dimensionScores.JP.rightScore = 35;
            dimensionScores.JP.percentage = 65;
        } else {
            dimensionScores.JP.leftScore = 35;
            dimensionScores.JP.rightScore = 65;
            dimensionScores.JP.percentage = 35;
        }

        return {
            type: mbtiType,
            label: mbtiType,
            description: '',
            elements: elements,
            dimensionScores: dimensionScores,
            functionStack: functionStack,
            character: null,
            answerCount: 0,
            gender: gender,
            timestamp: new Date().toISOString(),
            validity: {
                isValid: true
            },
            isDirectView: true
        };
    },

    /**
     * 确认直接查看结果
     */
    confirmDirectResult: async function () {
        const select = document.getElementById('mbti-type-select');
        const genderRadio = document.querySelector('input[name="direct-result-gender"]:checked');

        if (!select || !select.value) {
            alert('请选择性格类型');
            return;
        }

        const mbtiType = select.value;
        const gender = genderRadio ? genderRadio.value : 'female';

        this.hideDirectResultModal();
        GenshinMBTI.state.gender = gender;

        this.showDirectViewCalculatingPage(mbtiType, gender);
    },

    /**
     * 显示直接查看的等待页面
     * 
     * @param {string} mbtiType - MBTI类型
     * @param {string} gender - 性别
     */
    showDirectViewCalculatingPage: async function (mbtiType, gender) {
        console.log('========== [showDirectViewCalculatingPage] 开始 ==========');
        console.log('[showDirectViewCalculatingPage] mbtiType:', mbtiType, 'gender:', gender);

        // 隐藏所有页面元素
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        let container = document.getElementById('calculating-page-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'calculating-page-container';
            document.body.appendChild(container);
        }

        // 保持视频背景可见，计算页面使用透明背景
        const videoBg = document.getElementById('video-background');
        if (videoBg) {
            videoBg.style.display = 'block';
            videoBg.style.zIndex = '0';
        }

        container.innerHTML = `
            <div class="calculating-page">
                <div class="calculating-card">
                    <div class="mhy-login-platform__loading--rotation">
                        <div></div>
                    </div>
                    <div class="calculating-message" id="calculating-message">${LOADING_MESSAGES[0]}</div>
                </div>
            </div>
        `;

        const startTime = Date.now();
        const minDuration = 3000;

        let result = null;
        let preloadedAssets = { images: [], audio: null, audioLoaded: false };

        const preloadAssets = async (characterData) => {
            if (!characterData) {
                console.log('[预加载] 没有角色数据');
                return;
            }

            console.log('[预加载] 开始加载角色素材:', characterData.name);
            const imagePromises = [];

            if (characterData.showcase) {
                console.log('[预加载] 加载 showcase:', characterData.showcase);
                const img = new Image();
                img.src = characterData.showcase;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('[预加载] showcase 加载完成'); resolve(); }; img.onerror = () => { console.log('[预加载] showcase 加载失败'); resolve(); }; }));
            }

            if (characterData.card) {
                console.log('[预加载] 加载 card:', characterData.card);
                const img = new Image();
                img.src = characterData.card;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('[预加载] card 加载完成'); resolve(); }; img.onerror = () => { console.log('[预加载] card 加载失败'); resolve(); }; }));
            }

            if (characterData.mobile_card) {
                console.log('[预加载] 加载 mobile_card:', characterData.mobile_card);
                const img = new Image();
                img.src = characterData.mobile_card;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('[预加载] mobile_card 加载完成'); resolve(); }; img.onerror = () => { console.log('[预加载] mobile_card 加载失败'); resolve(); }; }));
            }

            if (characterData.assets?.avatar) {
                console.log('[预加载] 加载 avatar:', characterData.assets.avatar);
                const img = new Image();
                img.src = characterData.assets.avatar;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('[预加载] avatar 加载完成'); resolve(); }; img.onerror = () => { console.log('[预加载] avatar 加载失败'); resolve(); }; }));
            }

            if (characterData.assets?.portrait) {
                console.log('[预加载] 加载 portrait:', characterData.assets.portrait);
                const img = new Image();
                img.src = characterData.assets.portrait;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('[预加载] portrait 加载完成'); resolve(); }; img.onerror = () => { console.log('[预加载] portrait 加载失败'); resolve(); }; }));
            }

            if (characterData.assets?.name_image) {
                console.log('[预加载] 加载 name_image:', characterData.assets.name_image);
                const img = new Image();
                img.src = characterData.assets.name_image;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('[预加载] name_image 加载完成'); resolve(); }; img.onerror = () => { console.log('[预加载] name_image 加载失败'); resolve(); }; }));
            }

            if (characterData.assets?.pattern) {
                console.log('[预加载] 加载 pattern:', characterData.assets.pattern);
                const img = new Image();
                img.src = characterData.assets.pattern;
                imagePromises.push(new Promise(resolve => { img.onload = () => { console.log('[预加载] pattern 加载完成'); resolve(); }; img.onerror = () => { console.log('[预加载] pattern 加载失败'); resolve(); }; }));
            }

            if (characterData.voice_lines && characterData.voice_lines.length > 0) {
                const audioSrc = characterData.voice_lines[0].audio;
                console.log('[预加载] 发现语音文件:', audioSrc);
                if (audioSrc) {
                    preloadedAssets.audio = new Audio(audioSrc);
                    preloadedAssets.audio.volume = 0.7;
                    preloadedAssets.audio.preload = 'auto';

                    const audioPromise = new Promise(resolve => {
                        preloadedAssets.audio.oncanplaythrough = () => {
                            preloadedAssets.audioLoaded = true;
                            console.log('[预加载] 语音加载完成');
                            resolve();
                        };
                        preloadedAssets.audio.onerror = (e) => {
                            console.log('[预加载] 语音加载失败:', e);
                            resolve();
                        };
                        preloadedAssets.audio.load();
                    });
                    imagePromises.push(audioPromise);
                }
            } else {
                console.log('[预加载] 没有语音文件');
            }

            await Promise.all(imagePromises);
            console.log('[预加载] 所有素材加载完成');
        };

        const messageEl = document.getElementById('calculating-message');

        try {
            console.log('[showDirectViewCalculatingPage] 发送请求到 /api/direct-view');
            const response = await fetch('/api/direct-view', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mbtiType: mbtiType,
                    gender: gender
                })
            });

            console.log('[showDirectViewCalculatingPage] 收到响应，解析JSON...');
            const data = await response.json();

            if (data.success && data.data) {
                result = data.data;
                console.log('[showDirectViewCalculatingPage] API返回成功');
                console.log('[showDirectViewCalculatingPage] characterFull:', result.characterFull);
                console.log('[showDirectViewCalculatingPage] voice_lines:', result.characterFull?.voice_lines);
            } else {
                console.error('[showDirectViewCalculatingPage] API返回错误:', data.error);
                result = this.generateResultForType(mbtiType, gender);
            }
        } catch (error) {
            console.error('[showDirectViewCalculatingPage] 处理失败:', error);
            result = this.generateResultForType(mbtiType, gender);
        }

        if (result?.characterFull) {
            console.log('[showDirectViewCalculatingPage] 开始预加载角色素材...');
            await preloadAssets(result.characterFull);
            console.log('[showDirectViewCalculatingPage] 预加载完成');
        }

        const showResult = () => {
            if (result) {
                this.displayResult(result);
            }
        };

        const playAudioAndShowResult = () => {
            console.log('[playAudioAndShowResult] 检查音频状态:', {
                hasAudio: !!preloadedAssets.audio,
                audioLoaded: preloadedAssets.audioLoaded
            });

            if (preloadedAssets.audio && preloadedAssets.audioLoaded) {
                console.log('[playAudioAndShowResult] 播放预加载的角色语音');
                preloadedAssets.audio.play().then(() => {
                    console.log('[playAudioAndShowResult] 语音播放成功，等待500ms后切换页面');
                    setTimeout(showResult, 500);
                }).catch(e => {
                    console.log('[playAudioAndShowResult] 角色语音播放失败:', e);
                    setTimeout(showResult, 300);
                });
            } else {
                console.log('[playAudioAndShowResult] 没有预加载的音频，直接显示结果');
                showResult();
            }
        };

        const usedMessages = new Set();
        const getRandomMessage = () => {
            const available = LOADING_MESSAGES.filter((_, i) => !usedMessages.has(i));
            if (available.length === 0) {
                usedMessages.clear();
                return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
            }
            const randomIndex = Math.floor(Math.random() * available.length);
            const originalIndex = LOADING_MESSAGES.indexOf(available[randomIndex]);
            usedMessages.add(originalIndex);
            return available[randomIndex];
        };

        let currentMessage = LOADING_MESSAGES[0];
        let dots = 0;
        let lastDotTime = Date.now();
        const dotInterval = 400;

        const updateUI = () => {
            const elapsed = Date.now() - startTime;
            const now = Date.now();

            if (now - lastDotTime >= dotInterval) {
                dots++;
                if (dots > 3) {
                    dots = 0;
                    currentMessage = getRandomMessage();
                    console.log('[DirectView动画] 切换消息:', currentMessage);
                }
                lastDotTime = now;
                console.log('[DirectView动画] 点数更新:', dots, '消息:', currentMessage + '.'.repeat(dots));
            }

            const dotsStr = '.'.repeat(dots);

            if (messageEl) {
                messageEl.textContent = currentMessage + dotsStr;
            }

            if (result && elapsed >= minDuration) {
                playAudioAndShowResult();
                return;
            }

            if (!result || elapsed < minDuration) {
                requestAnimationFrame(updateUI);
            }
        };

        requestAnimationFrame(updateUI);
        console.log('========== [showDirectViewCalculatingPage] 初始化完成 ==========');
    },

    /**
     * 为指定MBTI类型生成虚构答卷
     * 
     * @param {Array} questions - 题目数组
     * @param {string} mbtiType - 目标MBTI类型
     * @returns {Array} 虚构的答案数组
     */
    generateFakeAnswersForType: function (questions, mbtiType) {
        const answers = [];
        const typeLetters = mbtiType.split('');

        const letterPreferences = {
            'E': { coordinate: 3 },
            'I': { coordinate: -3 },
            'S': { coordinate: 3 },
            'N': { coordinate: -3 },
            'T': { coordinate: 3 },
            'F': { coordinate: -3 },
            'J': { coordinate: 3 },
            'P': { coordinate: -3 }
        };

        const preferredCoordinates = {};
        typeLetters.forEach(letter => {
            if (letterPreferences[letter]) {
                preferredCoordinates[letter] = letterPreferences[letter].coordinate;
            }
        });

        questions.forEach((question, index) => {
            const optionA = question.options?.option_a || question.optionA;
            const optionB = question.options?.option_b || question.optionB;

            if (!optionA || !optionB) return;

            const typeA = optionA.character_type;
            const typeB = optionB.character_type;

            let coordinate = 0;

            if (preferredCoordinates[typeA] !== undefined) {
                coordinate = preferredCoordinates[typeA];
            } else if (preferredCoordinates[typeB] !== undefined) {
                coordinate = -preferredCoordinates[typeB];
            } else {
                coordinate = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
            }

            answers.push({
                questionIndex: index,
                coordinate: coordinate,
                optionA: optionA,
                optionB: optionB
            });
        });

        return answers;
    },

    /**
     * 初始化直接查看结果弹窗事件
     */
    initDirectResultModalEvents: function () {
        const modal = document.getElementById('direct-result-modal');
        const cancelBtn = document.getElementById('direct-result-cancel');
        const confirmBtn = document.getElementById('direct-result-confirm');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideDirectResultModal();
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmDirectResult();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideDirectResultModal();
                }
            });
        }
    },

    /**
     * 检查是否有历史结果
     */
    checkHistoryResult: function () {
        const historyBtn = document.getElementById('history-result-btn');
        const historyTime = document.getElementById('history-result-time');

        if (!historyBtn) return;

        try {
            const history = JSON.parse(localStorage.getItem('genshin_mbti_history') || '[]');
            if (history.length > 0) {
                const lastResult = history[0];
                // 有历史记录，移除禁用状态
                historyBtn.classList.remove('disabled');

                // 显示上次测试时间
                if (lastResult.timestamp) {
                    const date = new Date(lastResult.timestamp);
                    const now = new Date();
                    const diffMs = now - date;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);

                    let timeText = '';
                    if (diffMins < 1) {
                        timeText = '刚刚';
                    } else if (diffMins < 60) {
                        timeText = `${diffMins}分钟前`;
                    } else if (diffHours < 24) {
                        timeText = `${diffHours}小时前`;
                    } else if (diffDays < 7) {
                        timeText = `${diffDays}天前`;
                    } else {
                        timeText = `${date.getMonth() + 1}月${date.getDate()}日`;
                    }

                    if (historyTime) {
                        historyTime.textContent = timeText;
                    }
                }
            } else {
                // 无历史记录，添加禁用状态
                historyBtn.classList.add('disabled');
                if (historyTime) {
                    historyTime.textContent = '暂无测试记录';
                }
            }
        } catch (e) {
            console.error('读取历史结果失败:', e);
            // 出错时也显示禁用状态
            historyBtn.classList.add('disabled');
            if (historyTime) {
                historyTime.textContent = '暂无测试记录';
            }
        }
    },

    /**
     * 显示上次测试结果（改为显示历史记录弹窗）
     */
    showLastResult: async function () {
        // 检查弹窗是否已打开
        const modal = document.getElementById('history-modal');
        if (modal && modal.classList.contains('active')) {
            console.log('[查看历史记录] 弹窗已打开');
            return;
        }
        
        // 检查是否登录
        if (!this.isLoggedIn) {
            alert('请先登录后查看历史记录');
            this.showLoginModal();
            return;
        }
        
        // 显示历史记录弹窗
        this.showHistoryModal();
    },
    
    /**
     * 显示历史记录弹窗
     */
    showHistoryModal: async function() {
        const modal = document.getElementById('history-modal');
        const body = document.getElementById('history-modal-body');
        
        if (!modal || !body) {
            console.error('[历史记录] 弹窗元素不存在');
            return;
        }
        
        modal.classList.add('active');
        body.innerHTML = '<div class="export-loading">正在加载记录...</div>';
        
        try {
            const response = await fetch('/api/user/results');
            const data = await response.json();
            
            if (!data.success) {
                body.innerHTML = '<div class="export-empty">获取记录失败: ' + (data.error || '未知错误') + '</div>';
                return;
            }
            
            const results = data.data || [];
            
            if (results.length === 0) {
                body.innerHTML = '<div class="export-empty">暂无测试记录</div>';
                return;
            }
            
            // 渲染记录列表
            let html = '<div class="export-record-list">';
            results.forEach((result, index) => {
                const date = result.savedAt ? new Date(result.savedAt).toLocaleString('zh-CN') : '未知时间';
                const typeLabel = result.label || result.type;
                
                // 根据 analysisMode 显示不同的标记
                let badgeClass, badgeText;
                if (result.analysisMode === 'mallm') {
                    badgeClass = 'mallm';
                    badgeText = '大模型辩论';
                } else if (result.isMallmOnly) {
                    badgeClass = 'mallm-only';
                    badgeText = result.mallmOnlyLabel || '多智能体讨论';
                } else if (result.isAIAnalysis) {
                    badgeClass = 'ai';
                    badgeText = '大模型分析';
                } else {
                    badgeClass = 'normal';
                    badgeText = '普通测试';
                }
                
                const modelInfo = result.usedModel ? `<span class="export-record-meta">${result.usedModel.model}</span>` : '';
                
                html += `
                    <div class="export-record-item" data-index="${index}">
                        <div class="export-record-info">
                            <div class="export-record-type">
                                <span class="export-record-badge ${badgeClass}">${badgeText}</span>
                                ${result.type} ${typeLabel}
                            </div>
                            <div class="export-record-meta">
                                ${date} · ${result.gender === 'male' ? '男性' : result.gender === 'female' ? '女性' : '未知'}
                                ${modelInfo ? ' · ' + modelInfo : ''}
                            </div>
                        </div>
                        <div class="export-record-actions">
                            <button class="btn-export" data-index="${index}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                查看
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            body.innerHTML = html;
            
            // 绑定点击事件
            body.querySelectorAll('.export-record-item, .view-btn').forEach(item => {
                item.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const index = item.getAttribute('data-index') || item.closest('.export-record-item')?.getAttribute('data-index');
                    if (index !== null) {
                        // 先关闭弹窗，再加载结果
                        modal.classList.remove('active');
                        await this.loadAndDisplayResult(parseInt(index));
                    }
                });
            });
            
            // 绑定关闭按钮事件
            this.initHistoryModalEvents();
            
        } catch (error) {
            console.error('[历史记录] 获取失败:', error);
            body.innerHTML = '<div class="export-empty">获取记录失败: ' + error.message + '</div>';
        }
    },
    
    /**
     * 初始化历史记录弹窗事件
     */
    initHistoryModalEvents: function() {
        const modal = document.getElementById('history-modal');
        const closeBtn = document.getElementById('history-modal-close');
        
        if (!modal) return;
        
        const closeModal = () => {
            modal.classList.remove('active');
        };
        
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        
        // 点击背景关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
    },
    
    /**
     * 加载并显示指定索引的结果
     * 
     * @param {number} index - 结果索引
     */
    loadAndDisplayResult: async function(index) {
        console.log('[查看结果] 加载索引:', index);
        
        // 完全复用 showDirectViewCalculatingPage 的逻辑
        // 隐藏所有页面元素
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        let container = document.getElementById('calculating-page-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'calculating-page-container';
            document.body.appendChild(container);
        }

        // 保持视频背景可见，计算页面使用透明背景
        const videoBg = document.getElementById('video-background');
        if (videoBg) {
            videoBg.style.display = 'block';
            videoBg.style.zIndex = '0';
        }

        // 显示等待页面（与 showDirectViewCalculatingPage 相同的结构）
        container.innerHTML = `
            <div class="calculating-page">
                <div class="calculating-card">
                    <div class="mhy-login-platform__loading--rotation">
                        <div></div>
                    </div>
                    <div class="calculating-message" id="calculating-message">${LOADING_MESSAGES[0]}</div>
                </div>
            </div>
        `;

        const startTime = Date.now();
        const minDuration = 3000;
        let result = null;
        let preloadedAssets = { images: [], audio: null, audioLoaded: false };

        // 复用预加载函数
        const preloadAssets = async (characterData) => {
            if (!characterData) {
                console.log('[预加载] 没有角色数据');
                return;
            }

            console.log('[预加载] 开始加载角色素材:', characterData.name);
            const imagePromises = [];

            if (characterData.showcase) {
                const img = new Image();
                img.src = characterData.showcase;
                imagePromises.push(new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }));
            }

            if (characterData.card) {
                const img = new Image();
                img.src = characterData.card;
                imagePromises.push(new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }));
            }

            if (characterData.mobile_card) {
                const img = new Image();
                img.src = characterData.mobile_card;
                imagePromises.push(new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }));
            }

            if (characterData.assets?.avatar) {
                const img = new Image();
                img.src = characterData.assets.avatar;
                imagePromises.push(new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }));
            }

            if (characterData.assets?.portrait) {
                const img = new Image();
                img.src = characterData.assets.portrait;
                imagePromises.push(new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }));
            }

            if (characterData.assets?.name_image) {
                const img = new Image();
                img.src = characterData.assets.name_image;
                imagePromises.push(new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }));
            }

            if (characterData.assets?.pattern) {
                const img = new Image();
                img.src = characterData.assets.pattern;
                imagePromises.push(new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }));
            }

            if (characterData.voice_lines && characterData.voice_lines.length > 0) {
                const audioSrc = characterData.voice_lines[0].audio;
                if (audioSrc) {
                    preloadedAssets.audio = new Audio(audioSrc);
                    preloadedAssets.audio.volume = 0.7;
                    preloadedAssets.audio.preload = 'auto';

                    const audioPromise = new Promise(resolve => {
                        preloadedAssets.audio.oncanplaythrough = () => {
                            preloadedAssets.audioLoaded = true;
                            console.log('[预加载] 语音加载完成');
                            resolve();
                        };
                        preloadedAssets.audio.onerror = () => resolve();
                        preloadedAssets.audio.load();
                    });
                    imagePromises.push(audioPromise);
                }
            }

            await Promise.all(imagePromises);
            console.log('[预加载] 所有素材加载完成');
        };

        const messageEl = document.getElementById('calculating-message');

        try {
            const response = await fetch(`/api/user/result/${index}`);
            const data = await response.json();
            
            if (!data.success) {
                container.innerHTML = '';
                alert('获取结果失败: ' + (data.error || '未知错误'));
                this.showPage('welcome');
                return;
            }
            
            result = data.data;
            
            // 恢复性别设置
            if (result.gender && typeof GenshinMBTI !== 'undefined' && GenshinMBTI.state) {
                GenshinMBTI.state.gender = result.gender;
            }
            
            // 保存到本地存储
            localStorage.setItem('mbti_result', JSON.stringify(result));
            
        } catch (error) {
            console.error('[查看结果] 加载失败:', error);
            container.innerHTML = '';
            alert('获取结果失败: ' + error.message);
            this.showPage('welcome');
            return;
        }

        // 预加载角色素材
        if (result?.characterFull) {
            await preloadAssets(result.characterFull);
        }

        // 显示结果的函数
        const showResult = () => {
            if (result) {
                this.displayResult(result);
            }
        };

        // 播放语音并显示结果
        const playAudioAndShowResult = () => {
            if (preloadedAssets.audio && preloadedAssets.audioLoaded) {
                preloadedAssets.audio.play().then(() => {
                    setTimeout(showResult, 500);
                }).catch(() => {
                    setTimeout(showResult, 300);
                });
            } else {
                showResult();
            }
        };

        // 动画效果（消息切换 + 点点动画）
        const usedMessages = new Set();
        const getRandomMessage = () => {
            const available = LOADING_MESSAGES.filter((_, i) => !usedMessages.has(i));
            if (available.length === 0) {
                usedMessages.clear();
                return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
            }
            const randomIndex = Math.floor(Math.random() * available.length);
            const originalIndex = LOADING_MESSAGES.indexOf(available[randomIndex]);
            usedMessages.add(originalIndex);
            return available[randomIndex];
        };

        let currentMessage = LOADING_MESSAGES[0];
        let dots = 0;
        let lastDotTime = Date.now();
        const dotInterval = 400;

        const updateUI = () => {
            const elapsed = Date.now() - startTime;
            const now = Date.now();

            if (now - lastDotTime >= dotInterval) {
                dots++;
                if (dots > 3) {
                    dots = 0;
                    currentMessage = getRandomMessage();
                }
                lastDotTime = now;
            }

            const dotsStr = '.'.repeat(dots);

            if (messageEl) {
                messageEl.textContent = currentMessage + dotsStr;
            }

            if (result && elapsed >= minDuration) {
                playAudioAndShowResult();
                return;
            }

            if (!result || elapsed < minDuration) {
                requestAnimationFrame(updateUI);
            }
        };

        requestAnimationFrame(updateUI);
    },

    /**
     * 显示导出弹窗
     * 
     * @param {string} exportType - 导出类型 ('answers' 或 'report')
     */
    showExportModal: function (exportType) {
        this._exportType = exportType;
        this._selectedRecords = [];

        const modal = document.getElementById('export-modal');
        const title = document.getElementById('export-modal-title');
        const body = document.getElementById('export-modal-body');
        const confirmBtn = document.getElementById('export-confirm');

        if (!modal || !body) return;

        if (title) {
            title.textContent = exportType === 'answers' ? '选择要导出的答卷' : '选择要导出的分析报告';
        }

        modal.classList.add('active');
        body.innerHTML = '<div class="export-loading">正在加载记录...</div>';
        if (confirmBtn) confirmBtn.disabled = true;

        this.loadExportRecords();
        this.initExportModalEvents();
    },

    /**
     * 加载导出记录列表（带分页）
     */
    loadExportRecords: async function (page = 1) {
        const body = document.getElementById('export-modal-body');
        const pageSize = 10;

        try {
            // 检查登录状态
            const checkRes = await fetch('/api/auth/check');
            const checkData = await checkRes.json();

            if (!checkData.loggedIn) {
                body.innerHTML = '<div class="export-empty">请先登录后查看记录</div>';
                return;
            }

            // 从服务器获取记录
            const response = await fetch('/api/user/results');
            const data = await response.json();

            if (!data.success) {
                body.innerHTML = '<div class="export-empty">加载失败，请稍后重试</div>';
                return;
            }

            const allRecords = data.data || [];

            if (allRecords.length === 0) {
                body.innerHTML = '<div class="export-empty">暂无已提交的答卷记录</div>';
                return;
            }

            this._allRecords = allRecords;
            this._exportCurrentPage = page;
            this._exportPageSize = pageSize;

            // 计算分页
            const totalPages = Math.ceil(allRecords.length / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, allRecords.length);
            const pageRecords = allRecords.slice(startIndex, endIndex);

            let html = '<div class="export-record-list">';
            pageRecords.forEach((record, i) => {
                const globalIndex = startIndex + i;
                const date = new Date(record.savedAt);
                const dateStr = date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // 根据 analysisMode 显示不同的标记
                let badgeClass, badgeText;
                if (record.analysisMode === 'mallm') {
                    badgeClass = 'mallm';
                    badgeText = '大模型辩论';
                } else if (record.isMallmOnly) {
                    badgeClass = 'mallm-only';
                    badgeText = record.mallmOnlyLabel || '多智能体讨论';
                } else if (record.isAIAnalysis) {
                    badgeClass = 'ai';
                    badgeText = 'AI分析';
                } else {
                    badgeClass = 'normal';
                    badgeText = '普通测试';
                }

                html += `
                        <div class="export-record-item" data-index="${globalIndex}">
                            <div class="export-record-checkbox">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <div class="export-record-info">
                                <div class="export-record-type">${record.label || record.type} - ${record.gender === 'male' ? '男' : record.gender === 'female' ? '女' : '未知'}</div>
                                <div class="export-record-meta">${dateStr} ${record.usedModel ? '· ' + record.usedModel.provider : ''}</div>
                            </div>
                            <span class="export-record-badge ${badgeClass}">${badgeText}</span>
                        </div>
                    `;
            });
            html += '</div>';

            // 分页控件
            if (totalPages > 1) {
                html += '<div class="export-pagination">';
                html += `<button class="export-page-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>上一页</button>`;
                html += `<span class="export-page-info">第 ${page} / ${totalPages} 页 (共 ${allRecords.length} 条)</span>`;
                html += `<button class="export-page-btn" data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}>下一页</button>`;
                html += '</div>';
            }

            body.innerHTML = html;

            // 绑定选择事件
            const items = body.querySelectorAll('.export-record-item');
            items.forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    this.toggleRecordSelection(index, item);
                });
            });

            // 绑定分页事件
            const pageBtns = body.querySelectorAll('.export-page-btn');
            pageBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const newPage = parseInt(btn.dataset.page);
                    if (newPage >= 1 && newPage <= totalPages) {
                        this._selectedRecords = [];
                        this.loadExportRecords(newPage);
                    }
                });
            });

        } catch (error) {
            console.error('加载记录失败:', error);
            body.innerHTML = '<div class="export-empty">加载失败，请检查网络连接</div>';
        }
    },

    /**
     * 切换记录选择状态
     * 
     * @param {number} index - 记录索引
     * @param {HTMLElement} item - 记录元素
     */
    toggleRecordSelection: function (index, item) {
        const isSelected = item.classList.contains('selected');

        if (isSelected) {
            item.classList.remove('selected');
            this._selectedRecords = this._selectedRecords.filter(i => i !== index);
        } else {
            item.classList.add('selected');
            this._selectedRecords.push(index);
        }

        const confirmBtn = document.getElementById('export-confirm');
        if (confirmBtn) {
            confirmBtn.disabled = this._selectedRecords.length === 0;
            confirmBtn.textContent = this._selectedRecords.length > 0
                ? `导出选中 (${this._selectedRecords.length})`
                : '导出选中';
        }
    },

    /**
     * 初始化导出弹窗事件
     */
    initExportModalEvents: function () {
        const modal = document.getElementById('export-modal');
        const closeBtn = document.getElementById('export-modal-close');
        const cancelBtn = document.getElementById('export-cancel');
        const confirmBtn = document.getElementById('export-confirm');

        const closeModal = () => {
            modal.classList.remove('active');
            this._selectedRecords = [];
            this._allRecords = [];
            // 重置确认按钮状态
            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.textContent = '导出选中';
            }
        };

        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }

        if (cancelBtn) {
            cancelBtn.onclick = closeModal;
        }

        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            };
        }

        if (confirmBtn) {
            confirmBtn.onclick = () => {
                this.executeExport();
            };
        }
    },

    /**
     * 执行导出操作
     */
    executeExport: async function () {
        if (!this._selectedRecords || this._selectedRecords.length === 0) {
            alert('请选择要导出的记录');
            return;
        }

        const modal = document.getElementById('export-modal');
        const confirmBtn = document.getElementById('export-confirm');
        
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = '正在导出...';
        }

        try {
            for (const index of this._selectedRecords) {
                if (this._exportType === 'answers') {
                    // 导出答卷（JSON格式）
                    const response = await fetch(`/api/user/export/answers/${index}`);
                    const data = await response.json();
                    
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    const recordType = data.records && data.records[0] ? data.records[0].type : 'unknown';
                    link.download = `MBTI答卷_${recordType}_${new Date().toISOString().slice(0, 10)}.json`;
                    link.href = url;
                    link.click();
                    
                    URL.revokeObjectURL(url);
                } else {
                    // 导出报告（MD格式）
                    const response = await fetch(`/api/user/export/report/${index}`);
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    link.download = `MBTI报告_${new Date().toISOString().slice(0, 10)}.md`;
                    link.href = url;
                    link.click();
                    
                    URL.revokeObjectURL(url);
                }
                
                // 添加延迟避免浏览器阻止多个下载
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            if (modal) {
                modal.classList.remove('active');
            }
            
            this._selectedRecords = [];
            this._allRecords = [];
            
        } catch (error) {
            console.error('[导出] 失败:', error);
            alert('导出失败: ' + error.message);
        } finally {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = '导出选中';
            }
        }
    },

    /**
     * 显示导入弹窗
     */
    showImportModal: function () {
        const modal = document.getElementById('import-modal');
        if (!modal) return;

        this._importData = null;

        modal.classList.add('active');

        const preview = document.getElementById('import-preview');
        const error = document.getElementById('import-error');
        const confirmBtn = document.getElementById('import-confirm');
        const fileName = document.getElementById('import-file-name');
        const textarea = document.getElementById('import-textarea');

        if (preview) preview.style.display = 'none';
        if (error) error.style.display = 'none';
        if (confirmBtn) confirmBtn.disabled = true;
        if (fileName) fileName.style.display = 'none';
        if (textarea) textarea.value = '';

        this.initImportModalEvents();
    },

    /**
     * 初始化导入弹窗事件
     */
    initImportModalEvents: function () {
        const modal = document.getElementById('import-modal');
        const closeBtn = document.getElementById('import-modal-close');
        const cancelBtn = document.getElementById('import-cancel');
        const confirmBtn = document.getElementById('import-confirm');
        const fileArea = document.getElementById('import-file-area');
        const fileInput = document.getElementById('import-file-input');
        const tabs = document.querySelectorAll('.import-tab');
        const textarea = document.getElementById('import-textarea');

        const closeModal = () => {
            modal.classList.remove('active');
            this._importData = null;
        };

        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }

        if (cancelBtn) {
            cancelBtn.onclick = closeModal;
        }

        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            };
        }

        if (tabs) {
            tabs.forEach(tab => {
                tab.onclick = () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    const tabType = tab.dataset.tab;
                    document.getElementById('import-tab-file').style.display = tabType === 'file' ? 'block' : 'none';
                    document.getElementById('import-tab-text').style.display = tabType === 'text' ? 'block' : 'none';
                };
            });
        }

        if (fileArea && fileInput) {
            fileArea.onclick = () => fileInput.click();

            fileArea.ondragover = (e) => {
                e.preventDefault();
                fileArea.classList.add('dragover');
            };

            fileArea.ondragleave = () => {
                fileArea.classList.remove('dragover');
            };

            fileArea.ondrop = (e) => {
                e.preventDefault();
                fileArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImportFile(files[0]);
                }
            };

            fileInput.onchange = (e) => {
                if (e.target.files.length > 0) {
                    this.handleImportFile(e.target.files[0]);
                }
            };
        }

        if (textarea) {
            textarea.oninput = () => {
                const text = textarea.value.trim();
                if (text) {
                    this.parseImportText(text);
                } else {
                    this.hideImportPreview();
                }
            };
        }

        if (confirmBtn) {
            confirmBtn.onclick = () => {
                this.executeImport();
            };
        }
    },

    /**
     * 处理导入文件
     * 
     * @param {File} file - 文件对象
     */
    handleImportFile: function (file) {
        const error = document.getElementById('import-error');
        const fileName = document.getElementById('import-file-name');

        if (!file.name.endsWith('.json')) {
            this.showImportError('请选择JSON文件');
            if (fileName) fileName.style.display = 'none';
            return;
        }

        if (fileName) {
            fileName.textContent = '已选择: ' + file.name;
            fileName.style.display = 'block';
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.parseImportText(e.target.result);
        };
        reader.onerror = () => {
            this.showImportError('文件读取失败');
        };
        reader.readAsText(file);
    },

    /**
     * 解析导入文本
     * 
     * @param {string} text - JSON文本
     */
    parseImportText: function (text) {
        const error = document.getElementById('import-error');
        const preview = document.getElementById('import-preview');
        const previewContent = document.getElementById('import-preview-content');
        const confirmBtn = document.getElementById('import-confirm');

        try {
            const data = JSON.parse(text);

            const validation = this.validateImportData(data);

            if (!validation.valid) {
                this.showImportError(validation.error);
                if (preview) preview.style.display = 'none';
                if (confirmBtn) confirmBtn.disabled = true;
                return;
            }

            this._importData = validation.data;
            this._importType = validation.type;

            if (error) error.style.display = 'none';
            if (preview) preview.style.display = 'block';
            if (confirmBtn) confirmBtn.disabled = false;

            if (previewContent) {
                const record = validation.data;
                const date = new Date(record.savedAt);
                const dateStr = date.toLocaleString('zh-CN');
                const typeLabel = validation.type === 'ai' ? 'AI分析' : '普通测试';

                if (validation.type === 'ai') {
                    previewContent.innerHTML = `
                            <div class="import-preview-item">
                                <span class="import-preview-label">答卷类型</span>
                                <span class="import-preview-value">${typeLabel}</span>
                            </div>
                            <div class="import-preview-item">
                                <span class="import-preview-label">性别</span>
                                <span class="import-preview-value">${record.gender === 'male' ? '男' : record.gender === 'female' ? '女' : '未知'}</span>
                            </div>
                            <div class="import-preview-item">
                                <span class="import-preview-label">题目数量</span>
                                <span class="import-preview-value">${(record.questions || []).length} 道</span>
                            </div>
                            <div class="import-preview-item">
                                <span class="import-preview-label">已答数量</span>
                                <span class="import-preview-value">${Object.keys(record.answers || {}).filter(k => record.answers[k]).length} 道</span>
                            </div>
                            <div class="import-preview-item">
                                <span class="import-preview-label">弃置题目</span>
                                <span class="import-preview-value">${(record.skippedQuestions || []).length} 道</span>
                            </div>
                            <div class="import-preview-item">
                                <span class="import-preview-label">保存时间</span>
                                <span class="import-preview-value">${dateStr}</span>
                            </div>
                            ${record.usedModel ? `
                            <div class="import-preview-item">
                                <span class="import-preview-label">上次使用模型</span>
                                <span class="import-preview-value">${record.usedModel.provider || '未知'} / ${record.usedModel.model || '未知'}</span>
                            </div>
                            ` : ''}
                        `;
                } else {
                    previewContent.innerHTML = `
                            <div class="import-preview-item">
                                <span class="import-preview-label">答卷类型</span>
                                <span class="import-preview-value">${typeLabel}</span>
                            </div>
                            <div class="import-preview-item">
                                <span class="import-preview-label">题库版本</span>
                                <span class="import-preview-value">${record.questionSet || record.version || '未知'}</span>
                            </div>
                            <div class="import-preview-item">
                                <span class="import-preview-label">性别</span>
                                <span class="import-preview-value">${record.gender === 'male' ? '男' : record.gender === 'female' ? '女' : '未知'}</span>
                            </div>
                            <div class="import-preview-item">
                                <span class="import-preview-label">答题数量</span>
                                <span class="import-preview-value">${record.answers.length} 道</span>
                            </div>
                            <div class="import-preview-item">
                                <span class="import-preview-label">保存时间</span>
                                <span class="import-preview-value">${dateStr}</span>
                            </div>
                        `;
                }
            }

        } catch (e) {
            this.showImportError('JSON格式错误: ' + e.message);
            if (preview) preview.style.display = 'none';
            if (confirmBtn) confirmBtn.disabled = true;
        }
    },

    /**
     * 验证导入数据
     * 
     * @param {Object} data - 解析后的数据
     * @returns {Object} 验证结果 {valid: boolean, error?: string, data?: Object, type?: string}
     */
    validateImportData: function (data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: '数据格式无效' };
        }

        let record = data;

        // 处理导出文件格式
        if (data.exportType && data.records) {
            if (!Array.isArray(data.records) || data.records.length === 0) {
                return { valid: false, error: '导出文件中没有记录' };
            }
            record = data.records[0];
        }

        // 识别类型：普通答题 vs AI答题
        // AI答题：questions数组中每个元素有id, scene, question, dimensions等字段
        const isAI = record.type === 'ai' || (
            record.questions &&
            Array.isArray(record.questions) &&
            record.questions.length > 0 &&
            record.questions[0].id !== undefined &&
            record.questions[0].scene !== undefined &&
            record.questions[0].dimensions !== undefined
        );

        // 普通答题：answers是数组，元素是数字（coordinate值）或null
        const isNormal = record.type === 'normal' || (
            Array.isArray(record.answers) &&
            record.answers.length > 0 &&
            !isAI // 如果不是AI格式，且是数组，则认为是普通答题
        );

        // 检查是否有有效答案
        const hasValidAnswer = Array.isArray(record.answers) &&
            record.answers.some(a => a !== null && a !== undefined);

        if (isAI) {
            // AI答题格式验证
            if (!record.questions || !Array.isArray(record.questions) || record.questions.length === 0) {
                return { valid: false, error: 'AI答卷缺少题目数据' };
            }

            // 验证题目数量（后端限制为5、10、25）
            const validCounts = [5, 10, 25];
            if (!validCounts.includes(record.questions.length)) {
                return { valid: false, error: `AI答卷题目数量必须为 5、10 或 25 题，当前为 ${record.questions.length} 题` };
            }

            // 验证题目结构（只需要id, scene, question）
            const firstQ = record.questions[0];
            if (firstQ.id === undefined || !firstQ.scene || !firstQ.question) {
                return { valid: false, error: 'AI答卷题目结构不完整（需要id, scene, question）' };
            }

            // 验证答案数据：必须是对象且不为null，不为数组
            if (!record.answers || record.answers === null || Array.isArray(record.answers)) {
                return { valid: false, error: 'AI答卷缺少答案数据（需要对象格式）' };
            }

            // 验证性别
            if (!record.gender || !['male', 'female'].includes(record.gender)) {
                return { valid: false, error: '缺少有效的性别数据（需要 male 或 female）' };
            }

            // 忽略多余字段：label, usedModel, savedAt, skippedQuestions等
            return { valid: true, data: record, type: 'ai' };

        } else if (isNormal) {
            // 普通答题格式验证
            if (!Array.isArray(record.answers)) {
                return { valid: false, error: '普通答卷答案格式错误（应为数组）' };
            }

            if (!record.questionSet && !record.version) {
                return { valid: false, error: '普通答卷缺少题库标识（questionSet 或 version）' };
            }

            // 性别必须存在
            if (!record.gender || !['male', 'female'].includes(record.gender)) {
                return { valid: false, error: '缺少有效的性别数据（需要 male 或 female）' };
            }

            return { valid: true, data: record, type: 'normal' };

        } else {
            return { valid: false, error: '无法识别的答卷格式，请确保包含 type 字段（"ai" 或 "normal"）' };
        }
    },

    /**
     * 显示导入错误
     * 
     * @param {string} message - 错误信息
     */
    showImportError: function (message) {
        const error = document.getElementById('import-error');
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
    },

    /**
     * 隐藏导入预览
     */
    hideImportPreview: function () {
        const preview = document.getElementById('import-preview');
        const error = document.getElementById('import-error');
        const confirmBtn = document.getElementById('import-confirm');

        if (preview) preview.style.display = 'none';
        if (error) error.style.display = 'none';
        if (confirmBtn) confirmBtn.disabled = true;
    },

    /**
     * 执行导入操作
     */
    executeImport: async function () {
        if (!this._importData) {
            alert('没有可导入的数据');
            return;
        }

        const record = this._importData;
        const type = this._importType;

        const modal = document.getElementById('import-modal');
        if (modal) {
            modal.classList.remove('active');
        }

        if (type === 'ai') {
            // AI答题导入
            if (window.AIAnalysis && typeof window.AIAnalysis.loadImportedData === 'function') {
                window.AIAnalysis.loadImportedData(record);
            } else {
                alert('AI分析模块未加载，请刷新页面重试');
            }
        } else if (type === 'normal') {
            // 普通答题导入 - 复用现有流程
            const questionSet = record.questionSet || record.version;

            // 根据 questionSet 确定 version
            let version;
            if (questionSet.includes('200')) {
                version = '200-genshin';
            } else if (questionSet.includes('90')) {
                version = '90-genshin';
            } else if (questionSet.includes('20')) {
                version = '20-genshin';
            } else {
                version = '90-genshin';
            }

            // 设置性别
            if (window.GenshinMBTI) {
                window.GenshinMBTI.state.gender = record.gender;
                window.GenshinMBTI.state.pendingImportData = record;
                window.GenshinMBTI.state.questionVersion = questionSet;

                // 加载题库并进入答题页面
                const questions = await window.GenshinMBTI.loadQuestions(version);
                if (questions.length > 0) {
                    // 设置 UI.questions 并开始测试
                    this.questions = questions;
                    this.startTest();
                } else {
                    alert('题库加载失败');
                }
            } else {
                alert('主程序未加载，请刷新页面重试');
            }
        } else {
            alert('未知的答卷类型');
        }

        this._importData = null;
        this._importType = null;
    },

    /**
     * 显示登录弹窗
     * 
     * @param {Function} pendingAction - 登录成功后执行的操作
     */
    showLoginModal: function (pendingAction) {
        this.pendingAction = pendingAction;
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('show');
        }
    },

    /**
     * 隐藏登录弹窗
     */
    hideLoginModal: function () {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.pendingAction = null;
    },

    /**
     * 初始化登录弹窗事件
     */
    initLoginModalEvents: function () {
        const modal = document.getElementById('login-modal');
        if (!modal) return;

        // 如果已经初始化过，不再重复绑定
        if (this._loginModalInitialized) return;
        this._loginModalInitialized = true;

        // 切换登录/注册标签
        const tabs = modal.querySelectorAll('.login-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;

                // 更新标签样式
                tabs.forEach(t => {
                    t.style.borderBottomColor = t.dataset.tab === tabType ? '#d3bc8e' : 'transparent';
                    t.style.color = t.dataset.tab === tabType ? '#d3bc8e' : '#999';
                });

                // 切换表单
                const loginForm = document.getElementById('login-form');
                const registerForm = document.getElementById('register-form');

                if (tabType === 'login') {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                } else {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                }
            });
        });

        // 登录提交
        const loginSubmit = document.getElementById('login-submit');
        if (loginSubmit) {
            loginSubmit.addEventListener('click', async () => {
                const username = document.getElementById('login-username').value.trim();
                const password = document.getElementById('login-password').value;
                const errorEl = document.getElementById('login-error');

                if (!username || !password) {
                    errorEl.style.color = '#e74c3c';
                    errorEl.textContent = '请填写用户名和密码';
                    return;
                }

                loginSubmit.disabled = true;
                loginSubmit.textContent = '登录中...';

                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });

                    const data = await response.json();

                    if (data.success) {
                        this.isLoggedIn = true;
                        this.username = data.username;
                        errorEl.style.color = '#4CAF50';
                        errorEl.textContent = '登录成功！';

                        setTimeout(() => {
                            this.hideLoginModal();

                            if (this.pendingAction) {
                                this.pendingAction();
                                this.pendingAction = null;
                            }
                        }, 500);
                    } else {
                        this.isLoggedIn = false;
                        this.username = null;
                        errorEl.style.color = '#e74c3c';
                        errorEl.textContent = data.error || '登录失败';
                    }
                } catch (error) {
                    this.isLoggedIn = false;
                    this.username = null;
                    errorEl.style.color = '#e74c3c';
                    errorEl.textContent = '网络错误，请稍后重试';
                }

                loginSubmit.disabled = false;
                loginSubmit.textContent = '登录';
            });
        }

        // 注册提交
        const registerSubmit = document.getElementById('register-submit');
        if (registerSubmit) {
            registerSubmit.addEventListener('click', async () => {
                const username = document.getElementById('register-username').value.trim();
                const password = document.getElementById('register-password').value;
                const passwordConfirm = document.getElementById('register-password-confirm').value;
                const errorEl = document.getElementById('register-error');

                if (!username || !password || !passwordConfirm) {
                    errorEl.textContent = '请填写所有字段';
                    return;
                }

                if (username.length < 3) {
                    errorEl.textContent = '用户名至少需要3个字符';
                    return;
                }

                if (password.length < 6) {
                    errorEl.textContent = '密码至少需要6个字符';
                    return;
                }

                if (password !== passwordConfirm) {
                    errorEl.textContent = '两次输入的密码不一致';
                    return;
                }

                registerSubmit.disabled = true;
                registerSubmit.textContent = '注册中...';

                try {
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });

                    const data = await response.json();

                    if (data.success) {
                        errorEl.style.color = '#4CAF50';
                        errorEl.textContent = '注册成功，正在自动登录...';

                        const loginResponse = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password })
                        });

                        const loginData = await loginResponse.json();

                        if (loginData.success) {
                            this.isLoggedIn = true;
                            this.username = loginData.username;
                            errorEl.textContent = '登录成功！';

                            setTimeout(() => {
                                this.hideLoginModal();

                                if (this.pendingAction) {
                                    this.pendingAction();
                                    this.pendingAction = null;
                                }
                            }, 500);
                        } else {
                            this.isLoggedIn = false;
                            this.username = null;
                            errorEl.style.color = '#e74c3c';
                            errorEl.textContent = '自动登录失败：' + (loginData.error || '未知错误');
                        }
                    } else {
                        this.isLoggedIn = false;
                        this.username = null;
                        errorEl.style.color = '#e74c3c';
                        errorEl.textContent = data.error || '注册失败';
                    }
                } catch (error) {
                    this.isLoggedIn = false;
                    this.username = null;
                    errorEl.style.color = '#e74c3c';
                    errorEl.textContent = '网络错误，请稍后重试';
                }

                registerSubmit.disabled = false;
                registerSubmit.textContent = '注册';
            });
        }
    },

    /**
     * 需要登录的操作
     * 
     * @param {Function} action - 需要登录后执行的操作
     */
    requireLogin: async function (action) {
        if (this.isLoggedIn) {
            action();
        } else {
            const loggedIn = await this.checkLoginStatus();
            if (loggedIn) {
                action();
            } else {
                this.showLoginModal(action);
            }
        }
    }
};

// 挂载到 window 对象，供其他模块访问
if (typeof window !== 'undefined') {
    window.UI = UI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
