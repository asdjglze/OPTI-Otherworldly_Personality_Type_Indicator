// 版本号: v1.0.0
/**
 * 验证题库生成器
 * 
 * 功能: 生成1000道验证题目
 * 类型: 数学题、常识题、逻辑题、文字题
 */

const fs = require('fs');
const path = require('path');

// 题库文件路径
const QUIZ_FILE = path.join(__dirname, '..', 'data', 'verification_quiz.json');

/**
 * 生成随机整数
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成数学计算题
 */
function generateMathQuestions(count) {
    const questions = [];
    
    // 加法题
    for (let i = 0; i < count / 4; i++) {
        const a = randomInt(1, 100);
        const b = randomInt(1, 100);
        questions.push({
            id: `math_add_${i}`,
            type: 'math',
            question: `${a} + ${b} = ?`,
            answer: (a + b).toString(),
            difficulty: 'easy'
        });
    }
    
    // 减法题
    for (let i = 0; i < count / 4; i++) {
        const a = randomInt(50, 200);
        const b = randomInt(1, a);
        questions.push({
            id: `math_sub_${i}`,
            type: 'math',
            question: `${a} - ${b} = ?`,
            answer: (a - b).toString(),
            difficulty: 'easy'
        });
    }
    
    // 乘法题
    for (let i = 0; i < count / 4; i++) {
        const a = randomInt(2, 12);
        const b = randomInt(2, 12);
        questions.push({
            id: `math_mul_${i}`,
            type: 'math',
            question: `${a} × ${b} = ?`,
            answer: (a * b).toString(),
            difficulty: 'easy'
        });
    }
    
    // 除法题
    for (let i = 0; i < count / 4; i++) {
        const b = randomInt(2, 12);
        const result = randomInt(2, 12);
        const a = b * result;
        questions.push({
            id: `math_div_${i}`,
            type: 'math',
            question: `${a} ÷ ${b} = ?`,
            answer: result.toString(),
            difficulty: 'easy'
        });
    }
    
    return questions;
}

/**
 * 生成常识题
 */
function generateCommonSenseQuestions() {
    const questions = [
        // 地理常识
        { id: 'geo_1', type: 'common', question: '中国的首都是哪里？', answer: '北京', difficulty: 'easy' },
        { id: 'geo_2', type: 'common', question: '美国的首都是哪里？', answer: '华盛顿', difficulty: 'easy' },
        { id: 'geo_3', type: 'common', question: '日本的首都是哪里？', answer: '东京', difficulty: 'easy' },
        { id: 'geo_4', type: 'common', question: '法国的首都是哪里？', answer: '巴黎', difficulty: 'easy' },
        { id: 'geo_5', type: 'common', question: '英国的首都是哪里？', answer: '伦敦', difficulty: 'easy' },
        { id: 'geo_6', type: 'common', question: '俄罗斯的首都是哪里？', answer: '莫斯科', difficulty: 'easy' },
        { id: 'geo_7', type: 'common', question: '德国的首都是哪里？', answer: '柏林', difficulty: 'easy' },
        { id: 'geo_8', type: 'common', question: '意大利的首都是哪里？', answer: '罗马', difficulty: 'easy' },
        { id: 'geo_9', type: 'common', question: '韩国的首都是哪里？', answer: '首尔', difficulty: 'easy' },
        { id: 'geo_10', type: 'common', question: '澳大利亚的首都是哪里？', answer: '堪培拉', difficulty: 'medium' },
        
        // 时间常识
        { id: 'time_1', type: 'common', question: '一年有多少个月？', answer: '12', difficulty: 'easy' },
        { id: 'time_2', type: 'common', question: '一天有多少小时？', answer: '24', difficulty: 'easy' },
        { id: 'time_3', type: 'common', question: '一小时有多少分钟？', answer: '60', difficulty: 'easy' },
        { id: 'time_4', type: 'common', question: '一分钟有多少秒？', answer: '60', difficulty: 'easy' },
        { id: 'time_5', type: 'common', question: '一周有多少天？', answer: '7', difficulty: 'easy' },
        { id: 'time_6', type: 'common', question: '一个世纪有多少年？', answer: '100', difficulty: 'easy' },
        
        // 数字常识
        { id: 'num_1', type: 'common', question: '圆周率的前两位是多少？（如3.14）', answer: '3.14', difficulty: 'easy' },
        { id: 'num_2', type: 'common', question: '一打等于多少个？', answer: '12', difficulty: 'easy' },
        { id: 'num_3', type: 'common', question: '一双等于多少个？', answer: '2', difficulty: 'easy' },
        
        // 颜色常识
        { id: 'color_1', type: 'common', question: '红色和黄色混合是什么颜色？', answer: '橙色', difficulty: 'easy' },
        { id: 'color_2', type: 'common', question: '蓝色和黄色混合是什么颜色？', answer: '绿色', difficulty: 'easy' },
        { id: 'color_3', type: 'common', question: '红色和蓝色混合是什么颜色？', answer: '紫色', difficulty: 'easy' },
        
        // 自然常识
        { id: 'nature_1', type: 'common', question: '水的化学式是什么？（如H2O）', answer: 'H2O', difficulty: 'easy' },
        { id: 'nature_2', type: 'common', question: '地球绕太阳转一圈是多久？', answer: '一年', difficulty: 'easy' },
        { id: 'nature_3', type: 'common', question: '月亮绕地球转一圈是多久？', answer: '一个月', difficulty: 'easy' },
        { id: 'nature_4', type: 'common', question: '太阳从哪个方向升起？', answer: '东方', difficulty: 'easy' },
        { id: 'nature_5', type: 'common', question: '太阳从哪个方向落下？', answer: '西方', difficulty: 'easy' },
        
        // 动物常识
        { id: 'animal_1', type: 'common', question: '猫有几条腿？', answer: '4', difficulty: 'easy' },
        { id: 'animal_2', type: 'common', question: '鸟有几条腿？', answer: '2', difficulty: 'easy' },
        { id: 'animal_3', type: 'common', question: '蜘蛛有几条腿？', answer: '8', difficulty: 'easy' },
        { id: 'animal_4', type: 'common', question: '昆虫有几条腿？', answer: '6', difficulty: 'easy' },
        { id: 'animal_5', type: 'common', question: '鱼用什么呼吸？', answer: '鳃', difficulty: 'easy' },
        
        // 文学常识
        { id: 'lit_1', type: 'common', question: '《红楼梦》的作者是谁？', answer: '曹雪芹', difficulty: 'medium' },
        { id: 'lit_2', type: 'common', question: '《西游记》的作者是谁？', answer: '吴承恩', difficulty: 'medium' },
        { id: 'lit_3', type: 'common', question: '《三国演义》的作者是谁？', answer: '罗贯中', difficulty: 'medium' },
        { id: 'lit_4', type: 'common', question: '《水浒传》的作者是谁？', answer: '施耐庵', difficulty: 'medium' },
        
        // 节日常识
        { id: 'fest_1', type: 'common', question: '春节是农历几月初几？', answer: '正月初一', difficulty: 'easy' },
        { id: 'fest_2', type: 'common', question: '中秋节是农历几月十五？', answer: '八月', difficulty: 'easy' },
        { id: 'fest_3', type: 'common', question: '端午节是农历几月初五？', answer: '五月初五', difficulty: 'medium' },
        { id: 'fest_4', type: 'common', question: '国庆节是几月几日？', answer: '10月1日', difficulty: 'easy' },
        { id: 'fest_5', type: 'common', question: '儿童节是几月几日？', answer: '6月1日', difficulty: 'easy' },
    ];
    
    return questions;
}

/**
 * 生成逻辑题
 */
function generateLogicQuestions() {
    const questions = [
        // 数字序列
        { id: 'logic_1', type: 'logic', question: '1, 2, 3, 4, ? 中的 ? 是几？', answer: '5', difficulty: 'easy' },
        { id: 'logic_2', type: 'logic', question: '2, 4, 6, 8, ? 中的 ? 是几？', answer: '10', difficulty: 'easy' },
        { id: 'logic_3', type: 'logic', question: '1, 3, 5, 7, ? 中的 ? 是几？', answer: '9', difficulty: 'easy' },
        { id: 'logic_4', type: 'logic', question: '10, 20, 30, 40, ? 中的 ? 是几？', answer: '50', difficulty: 'easy' },
        { id: 'logic_5', type: 'logic', question: '5, 10, 15, 20, ? 中的 ? 是几？', answer: '25', difficulty: 'easy' },
        { id: 'logic_6', type: 'logic', question: '1, 4, 9, 16, ? 中的 ? 是几？（平方数）', answer: '25', difficulty: 'medium' },
        { id: 'logic_7', type: 'logic', question: '1, 1, 2, 3, 5, ? 中的 ? 是几？（斐波那契）', answer: '8', difficulty: 'medium' },
        { id: 'logic_8', type: 'logic', question: '1, 2, 4, 8, ? 中的 ? 是几？', answer: '16', difficulty: 'medium' },
        
        // 字母序列
        { id: 'logic_9', type: 'logic', question: 'A, B, C, D, ? 中的 ? 是什么字母？', answer: 'E', difficulty: 'easy' },
        { id: 'logic_10', type: 'logic', question: 'A, C, E, G, ? 中的 ? 是什么字母？', answer: 'I', difficulty: 'medium' },
        
        // 逻辑推理
        { id: 'logic_11', type: 'logic', question: '如果今天是星期一，那么后天是星期几？', answer: '星期三', difficulty: 'easy' },
        { id: 'logic_12', type: 'logic', question: '如果今天是星期五，那么昨天是星期几？', answer: '星期四', difficulty: 'easy' },
        { id: 'logic_13', type: 'logic', question: '如果今天是星期三，那么大后天是星期几？', answer: '星期六', difficulty: 'easy' },
        { id: 'logic_14', type: 'logic', question: '如果A比B大，B比C大，那么A和C谁大？', answer: 'A', difficulty: 'easy' },
        { id: 'logic_15', type: 'logic', question: '如果所有猫都是动物，小花是猫，那么小花是什么？', answer: '动物', difficulty: 'easy' },
    ];
    
    return questions;
}

/**
 * 生成文字题
 */
function generateTextQuestions() {
    const questions = [
        // 成语填空
        { id: 'text_1', type: 'text', question: '一马当__（填一个字）', answer: '先', difficulty: 'easy' },
        { id: 'text_2', type: 'text', question: '画蛇添__（填一个字）', answer: '足', difficulty: 'easy' },
        { id: 'text_3', type: 'text', question: '守株待__（填一个字）', answer: '兔', difficulty: 'easy' },
        { id: 'text_4', type: 'text', question: '掩耳盗__（填一个字）', answer: '铃', difficulty: 'easy' },
        { id: 'text_5', type: 'text', question: '亡羊补__（填一个字）', answer: '牢', difficulty: 'easy' },
        { id: 'text_6', type: 'text', question: '刻舟求__（填一个字）', answer: '剑', difficulty: 'easy' },
        { id: 'text_7', type: 'text', question: '叶公好__（填一个字）', answer: '龙', difficulty: 'easy' },
        { id: 'text_8', type: 'text', question: '井底之__（填一个字）', answer: '蛙', difficulty: 'easy' },
        { id: 'text_9', type: 'text', question: '对牛弹__（填一个字）', answer: '琴', difficulty: 'easy' },
        { id: 'text_10', type: 'text', question: '狐假虎__（填一个字）', answer: '威', difficulty: 'easy' },
        
        // 反义词
        { id: 'text_11', type: 'text', question: '"大"的反义词是什么？', answer: '小', difficulty: 'easy' },
        { id: 'text_12', type: 'text', question: '"高"的反义词是什么？', answer: '低', difficulty: 'easy' },
        { id: 'text_13', type: 'text', question: '"快"的反义词是什么？', answer: '慢', difficulty: 'easy' },
        { id: 'text_14', type: 'text', question: '"多"的反义词是什么？', answer: '少', difficulty: 'easy' },
        { id: 'text_15', type: 'text', question: '"黑"的反义词是什么？', answer: '白', difficulty: 'easy' },
        
        // 近义词
        { id: 'text_16', type: 'text', question: '"美丽"的近义词是什么？', answer: '漂亮', difficulty: 'easy' },
        { id: 'text_17', type: 'text', question: '"快乐"的近义词是什么？', answer: '高兴', difficulty: 'easy' },
        { id: 'text_18', type: 'text', question: '"聪明"的近义词是什么？', answer: '智慧', difficulty: 'medium' },
    ];
    
    return questions;
}

/**
 * 生成完整题库
 */
function generateFullQuiz() {
    const allQuestions = [];
    
    // 生成数学题（约400道）
    const mathQuestions = generateMathQuestions(400);
    allQuestions.push(...mathQuestions);
    
    // 添加常识题（约50道）
    const commonQuestions = generateCommonSenseQuestions();
    allQuestions.push(...commonQuestions);
    
    // 添加逻辑题（约15道）
    const logicQuestions = generateLogicQuestions();
    allQuestions.push(...logicQuestions);
    
    // 添加文字题（约18道）
    const textQuestions = generateTextQuestions();
    allQuestions.push(...textQuestions);
    
    // 生成更多数学题补充到1000道
    const additionalMath = generateMathQuestions(1000 - allQuestions.length);
    allQuestions.push(...additionalMath);
    
    // 打乱顺序
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    
    // 重新编号
    allQuestions.forEach((q, index) => {
        q.id = `quiz_${index + 1}`;
    });
    
    return allQuestions;
}

/**
 * 保存题库到文件
 */
function saveQuiz(questions) {
    const data = {
        version: '1.0.0',
        totalCount: questions.length,
        createdAt: new Date().toISOString(),
        questions: questions
    };
    
    const dir = path.dirname(QUIZ_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(QUIZ_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[验证题库] 已生成 ${questions.length} 道题目`);
    console.log(`[验证题库] 文件保存至: ${QUIZ_FILE}`);
}

// 执行生成
const questions = generateFullQuiz();
saveQuiz(questions);

module.exports = { generateFullQuiz, saveQuiz };
