/**
 * 真正的人机验证题库生成器 v6.0
 * 
 * 功能: 生成需要懂梗才能回答的有趣题目
 * 特点: 
 * 1. 问题看起来普通
 * 2. 答案需要懂梗
 * 3. 有趣、难绷
 * 4. 不问"出自哪里"、"是谁说的"
 * 5. 包含题目、预设答案、解析
 */

const fs = require('fs');
const path = require('path');

/**
 * 生成梗题库
 */
function generateMemeQuiz() {
    const questions = [];
    let id = 1;

    const allQuestions = [
        // 鸡你太美梗
        { 
            q: "世界上最美的动物是什么？为什么？", 
            a: "鸡你太美",
            analysis: "因为鸡你太美是蔡徐坤的歌《只因你太美》的谐音梗，网友用这个梗来调侃蔡徐坤的唱跳rap篮球。"
        },
        { 
            q: "什么动物最会唱跳rap？", 
            a: "鸡",
            analysis: "因为鸡你太美，鸡会唱跳rap篮球。"
        },
        { 
            q: "为什么鸡会打篮球？", 
            a: "因为鸡你太美",
            analysis: "鸡你太美是蔡徐坤的梗，因为他在选秀节目中展示了唱跳rap篮球的才艺。"
        },
        { 
            q: "什么动物最会打篮球？", 
            a: "鸡",
            analysis: "因为鸡你太美，鸡会唱跳rap篮球。"
        },
        { 
            q: "什么动物会唱跳rap篮球？", 
            a: "鸡",
            analysis: "因为鸡你太美，这是蔡徐坤的梗。"
        },
        { 
            q: "鸡你太美是哪首歌的谐音？", 
            a: "只因你太美",
            analysis: "鸡你太美是蔡徐坤的歌《只因你太美》的谐音。"
        },
        { 
            q: "食不食油饼是什么的谐音？", 
            a: "是不是有病",
            analysis: "食不食油饼是是不是有病的谐音，是蔡徐坤梗的衍生梗。"
        },
        { 
            q: "荔枝是什么的谐音？", 
            a: "理智",
            analysis: "荔枝是理智的谐音，是蔡徐坤梗的衍生梗。"
        },
        { 
            q: "树脂是什么的谐音？", 
            a: "素质",
            analysis: "树脂是素质的谐音，是蔡徐坤梗的衍生梗。"
        },
        { 
            q: "香翅捞饭是什么的谐音？", 
            a: "想吃牢饭",
            analysis: "香翅捞饭是想吃牢饭的谐音，是蔡徐坤梗的衍生梗。"
        },
        
        // 原神梗
        { 
            q: "你说的对，但是原神是一款什么游戏？", 
            a: "开放世界冒险游戏",
            analysis: "这是原神梗的开头，原文是「你说的对，但是《原神》是由米哈游自主研发的一款全新开放世界冒险游戏」"
        },
        { 
            q: "派蒙被旅行者称为什么？", 
            a: "应急食品",
            analysis: "在原神剧情中，旅行者可以称呼派蒙为应急食品。"
        },
        { 
            q: "原神中旅行者找了多少章剧情还没找到妹妹？", 
            a: "几百章",
            analysis: "原神剧情中旅行者一直在找妹妹，但是几百章过去了还没找到。"
        },
        { 
            q: "遗迹守卫被玩家称为什么？", 
            a: "独眼小宝",
            analysis: "遗迹守卫被原神玩家戏称为独眼小宝，因为它只有一个眼睛。"
        },
        { 
            q: "深渊法师被玩家称为什么？", 
            a: "深渊憨憨",
            analysis: "深渊法师被原神玩家戏称为深渊憨憨。"
        },
        { 
            q: "丘丘人说的Olah是什么意思？", 
            a: "你好",
            analysis: "在原神中，丘丘人说的Olah是你好的意思。"
        },
        { 
            q: "雷电将军砍的那一刀叫什么？", 
            a: "无想的一刀",
            analysis: "雷电将军的大招叫无想的一刀。"
        },
        { 
            q: "钟离说欲买桂花同载酒，终不似什么？", 
            a: "少年游",
            analysis: "钟离的台词「欲买桂花同载酒，终不似，少年游」"
        },
        { 
            q: "芙宁娜扮演了多少年的水神？", 
            a: "500年",
            analysis: "芙宁娜扮演了500年的水神。"
        },
        
        // 丁真梗
        { 
            q: "丁真最想做的事是什么？", 
            a: "赛马",
            analysis: "丁真在采访中说最想做的事是赛马。"
        },
        { 
            q: "丁真的小马叫什么名字？", 
            a: "珍珠",
            analysis: "丁真的小马叫珍珠。"
        },
        { 
            q: "丁真的家乡在哪里？", 
            a: "理塘",
            analysis: "丁真的家乡在四川理塘。"
        },
        { 
            q: "丁真的笑容被网友称为什么？", 
            a: "纯真",
            analysis: "丁真的笑容被网友称为纯真。"
        },
        { 
            q: "雪豹、岩羊、猞猁、藏马熊，哪种动物不是丁真的朋友？", 
            a: "雪豹",
            analysis: "这是丁真梗，雪豹、岩羊、猞猁、藏马熊中，雪豹不是丁真的朋友。"
        },
        { 
            q: "丁真是哪个省的旅游形象大使？", 
            a: "四川",
            analysis: "丁真是四川省的旅游形象大使。"
        },
        { 
            q: "丁真的家乡被称为什么？", 
            a: "天空之城",
            analysis: "丁真的家乡理塘被称为天空之城。"
        },
        { 
            q: "丁真的马是什么颜色的？", 
            a: "白色",
            analysis: "丁真的马珍珠是白色的。"
        },
        { 
            q: "丁真的粉丝叫什么？", 
            a: "珍珠",
            analysis: "丁真的粉丝叫珍珠，和丁真的小马同名。"
        },
        
        // 华强买瓜梗
        { 
            q: "有一个人前来买瓜，请问瓜多少钱一斤？", 
            a: "两块",
            analysis: "华强买瓜梗，瓜两块钱一斤。"
        },
        { 
            q: "华强问老板这瓜保熟吗，老板怎么回答？", 
            a: "保熟",
            analysis: "华强买瓜梗，老板回答保熟。"
        },
        { 
            q: "华强买瓜，老板说我开水果摊的，能卖你什么瓜？", 
            a: "生瓜",
            analysis: "华强买瓜梗，老板说我开水果摊的，能卖你生瓜？"
        },
        { 
            q: "华强买瓜，华强说你这瓜要是怎样的，我肯定要？", 
            a: "熟的",
            analysis: "华强买瓜梗，华强说你这瓜要是熟的，我肯定要。"
        },
        { 
            q: "华强买瓜，老板说你故意找茬是不是，华强怎么回答？", 
            a: "是",
            analysis: "华强买瓜梗，华强回答是。"
        },
        { 
            q: "华强买瓜，华强说我不要了，老板怎么回答？", 
            a: "行",
            analysis: "华强买瓜梗，老板回答行。"
        },
        
        // 奥利给梗
        { 
            q: "奥利给是什么意思？", 
            a: "加油",
            analysis: "奥利给是加油的意思，是冬泳怪鸽的口头禅。"
        },
        { 
            q: "我们遇到什么困难也不要怕，微笑着面对它的下一句是什么？", 
            a: "消除恐惧的最好办法就是面对恐惧",
            analysis: "冬泳怪鸽的名言。"
        },
        { 
            q: "消除恐惧的最好办法是什么？", 
            a: "面对恐惧",
            analysis: "冬泳怪鸽的名言：消除恐惧的最好办法就是面对恐惧。"
        },
        
        // 游戏术语
        { 
            q: "Penta Kill是什么意思？", 
            a: "五杀",
            analysis: "英雄联盟术语，Penta Kill是五杀的意思。"
        },
        { 
            q: "Ace是什么意思？", 
            a: "团灭",
            analysis: "英雄联盟术语，Ace是团灭的意思。"
        },
        { 
            q: "First Blood是什么意思？", 
            a: "第一滴血",
            analysis: "英雄联盟术语，First Blood是第一滴血的意思。"
        },
        { 
            q: "Double Kill是什么意思？", 
            a: "双杀",
            analysis: "英雄联盟术语，Double Kill是双杀的意思。"
        },
        { 
            q: "Triple Kill是什么意思？", 
            a: "三杀",
            analysis: "英雄联盟术语，Triple Kill是三杀的意思。"
        },
        { 
            q: "Quadra Kill是什么意思？", 
            a: "四杀",
            analysis: "英雄联盟术语，Quadra Kill是四杀的意思。"
        },
        { 
            q: "Legendary是什么意思？", 
            a: "超神",
            analysis: "英雄联盟术语，Legendary是超神的意思。"
        },
        { 
            q: "Shut down是什么意思？", 
            a: "终结",
            analysis: "英雄联盟术语，Shut down是终结的意思。"
        },
        { 
            q: "Victory是什么意思？", 
            a: "胜利",
            analysis: "英雄联盟术语，Victory是胜利的意思。"
        },
        { 
            q: "Defeat是什么意思？", 
            a: "失败",
            analysis: "英雄联盟术语，Defeat是失败的意思。"
        },
        { 
            q: "GG是什么意思？", 
            a: "好游戏",
            analysis: "游戏术语，GG是Good Game的缩写，是好游戏的意思。"
        },
        { 
            q: "AFK是什么意思？", 
            a: "离开键盘",
            analysis: "游戏术语，AFK是Away From Keyboard的缩写，是离开键盘的意思。"
        },
        { 
            q: "Noob是什么意思？", 
            a: "菜鸟",
            analysis: "游戏术语，Noob是菜鸟的意思。"
        },
        
        // 动漫梗
        { 
            q: "错的不是我，是这个世界下一句是什么？", 
            a: "是这个世界",
            analysis: "反叛的鲁路修中鲁路修的名言。"
        },
        { 
            q: "我要成为海贼王的男人是谁说的？", 
            a: "路飞",
            analysis: "海贼王中路飞的名言。"
        },
        { 
            q: "我要成为火影是谁说的？", 
            a: "鸣人",
            analysis: "火影忍者中鸣人的名言。"
        },
        { 
            q: "真相只有一少的下一句是什么？", 
            a: "真相只有一个",
            analysis: "名侦探柯南中柯南的名言。"
        },
        { 
            q: "我不做人了JOJO的下一句是什么？", 
            a: "JOJO",
            analysis: "JOJO的奇妙冒险中迪奥的名言。"
        },
        { 
            q: "欧拉欧拉欧拉是谁的口头禅？", 
            a: "空条承太郎",
            analysis: "JOJO的奇妙冒险中空条承太郎的口头禅。"
        },
        { 
            q: "木大木大木大是谁的口头禅？", 
            a: "迪奥",
            analysis: "JOJO的奇妙冒险中迪奥的口头禅。"
        },
        { 
            q: "但是我拒绝的下一句是什么？", 
            a: "我岸边露伴最喜欢做的事情之一，就是对自己说NO的人说NO",
            analysis: "JOJO的奇妙冒险中岸边露伴的名言。"
        },
        { 
            q: "砸瓦鲁多是什么意思？", 
            a: "世界",
            analysis: "JOJO的奇妙冒险中迪奥的替身The World的日语发音。"
        },
    ];

    allQuestions.forEach(item => {
        questions.push({
            id: `meme_${id++}`,
            type: "meme",
            question: item.q,
            answer: item.a,
            analysis: item.analysis,
            difficulty: "medium"
        });
    });

    // 打乱顺序
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return {
        version: "6.0.0",
        totalCount: questions.length,
        createdAt: new Date().toISOString(),
        description: "需要懂梗才能回答的验证题库",
        questions: questions
    };
}

/**
 * 主函数
 */
function main() {
    console.log('开始生成梗题库...');
    
    const quiz = generateMemeQuiz();
    
    const outputPath = path.join(__dirname, '..', 'data', 'verification_quiz.json');
    
    fs.writeFileSync(outputPath, JSON.stringify(quiz, null, 2), 'utf8');
    
    console.log(`题库生成完成！`);
    console.log(`- 总题数: ${quiz.totalCount}`);
    console.log(`- 输出路径: ${outputPath}`);
}

main();
