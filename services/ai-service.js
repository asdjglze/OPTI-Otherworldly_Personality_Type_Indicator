// 版本号: v1.0.0
/**
 * AI 服务模块
 * 
 * 功能: 调用多种 AI API 进行 MBTI 分析
 * 支持: 智谱GLM、DeepSeek、火山引擎/豆包、千问
 * 特性: 所有模型均启用深度思考模式
 */

require('dotenv').config();

// Node.js 18+ 内置 fetch，低版本需要 node-fetch
const fetch = globalThis.fetch || require('node-fetch');

// 文件系统模块，用于日志记录
const fs = require('fs');
const path = require('path');

// 引入模型配置
const { MODEL_CONFIG, getAvailableModels, getSystemDefaultModel } = require('../config/model-config');

/**
 * 记录AI请求日志到文件
 * 
 * @param {string} prompt - 发送给AI的完整提示词
 * @param {string} provider - AI提供商
 * @param {string} model - 模型名称
 */
function logAIRequest(prompt, provider, model) {
    try {
        const logDir = path.join(__dirname, '..', 'logs', 'ai-requests');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ai-request-${timestamp}.log`;
        const filepath = path.join(logDir, filename);
        
        const logContent = `
================================================================================
AI 请求日志
================================================================================
时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
提供商: ${provider}
模型: ${model}
================================================================================
发送给AI的完整内容:
================================================================================

${prompt}

================================================================================
日志结束
================================================================================
`;
        
        fs.writeFileSync(filepath, logContent, 'utf8');
        console.log(`[AI服务] 请求日志已保存: ${filepath}`);
        
        return filepath;
    } catch (error) {
        console.error('[AI服务] 保存日志失败:', error);
        return null;
    }
}

/**
 * 记录AI响应日志到文件
 * 
 * @param {string} requestLogPath - 请求日志路径
 * @param {string} response - AI响应内容
 * @param {string} reasoning - AI深度思考过程（可选）
 * @param {string} provider - AI提供商
 */
function logAIResponse(requestLogPath, response, reasoning, provider) {
    try {
        if (!requestLogPath) return;
        
        const reasoningSection = reasoning ? `
================================================================================
AI 深度思考过程:
================================================================================

${reasoning}

` : '';
        
        const responseSection = `
================================================================================
AI 响应内容:
================================================================================

${response}

================================================================================
日志结束
================================================================================
`;
        
        const logContent = reasoningSection + responseSection;
        
        fs.appendFileSync(requestLogPath, logContent, 'utf8');
        console.log(`[AI服务] 响应日志已追加: ${requestLogPath}`);
    } catch (error) {
        console.error('[AI服务] 保存响应日志失败:', error);
    }
}

/**
 * 调用 AI API（启用深度思考模式）
 * 
 * @param {string} prompt - 分析提示词
 * @param {string} provider - 服务提供商
 * @param {string} model - 模型ID
 * @param {Function} onReasoning - 思考内容回调函数 (reasoning: string) => void
 * @returns {Promise<Object>} AI 返回的分析结果
 */
async function callAIApi(prompt, provider = 'glm', model = null, onReasoning = null) {
    const config = MODEL_CONFIG[provider];
    
    if (!config || !config.apiKey) {
        throw new Error(`${provider} API Key 未配置`);
    }
    
    const modelId = model || config.models[0].id;
    
    // 记录发送给AI的完整内容到日志文件
    const requestLogPath = logAIRequest(prompt, provider, modelId);
    
    const requestBody = {
        model: modelId,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 8000
    };
    
    const useStreaming = true; // 始终使用流式响应以获取实时思考内容
    
    if (provider === 'qwen') {
        requestBody.enable_thinking = true;
        requestBody.stream = true;
    } else if (provider === 'deepseek') {
        if (modelId !== 'deepseek-reasoner') {
            requestBody.thinking = { type: 'enabled' };
        }
        requestBody.stream = true;
    } else {
        requestBody.thinking = { type: 'enabled' };
        requestBody.temperature = 1.0;
        requestBody.stream = true;
    }
    
    const controller = new AbortController();
    const timeoutMs = 4 * 60 * 1000;
    const timeoutId = setTimeout(() => {
        controller.abort();
        console.error(`[${provider}] API请求超时 (${timeoutMs}ms)`);
    }, timeoutMs);
    
    let response;
    try {
        response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
    } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
            throw new Error(`${provider} API 请求超时（${timeoutMs/1000}秒），AI思考时间过长，请尝试其他模型`);
        }
        throw new Error(`${provider} API 网络错误: ${fetchError.message}`);
    }
    clearTimeout(timeoutId);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${provider} API 调用失败: ${response.status} - ${errorText}`);
    }
    
    let content = '';
    let reasoning = null;
    
    if (useStreaming) {
        // 使用更兼容的方式处理流式响应
        const chunks = [];
        
        // Node.js 18+ 内置 fetch 的 response.body 是 ReadableStream
        // 但 getReader() 可能在某些环境下不可用
        if (response.body && typeof response.body.getReader === 'function') {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        
                        try {
                            const json = JSON.parse(data);
                            // 调试：打印原始响应
                            console.log(`[${provider}] SSE数据:`, JSON.stringify(json).substring(0, 200));
                            
                            const delta = json.choices?.[0]?.delta;
                            if (delta) {
                                if (delta.content) {
                                    content += delta.content;
                                }
                                if (delta.reasoning_content) {
                                    reasoning = (reasoning || '') + delta.reasoning_content;
                                    console.log(`[${provider}] 收到思考内容, 长度: ${reasoning.length}`);
                                    // 实时回调思考内容
                                    if (onReasoning && reasoning) {
                                        onReasoning(reasoning);
                                    }
                                }
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } else {
            // 回退方案：读取完整响应然后解析
            const responseText = await response.text();
            const lines = responseText.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const json = JSON.parse(data);
                        const delta = json.choices?.[0]?.delta;
                        if (delta) {
                            if (delta.content) {
                                content += delta.content;
                            }
                            if (delta.reasoning_content) {
                                reasoning = (reasoning || '') + delta.reasoning_content;
                            }
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
            
            // 非实时模式下，最后调用一次回调
            if (onReasoning && reasoning) {
                onReasoning(reasoning);
            }
        }
        
        console.log(`[${provider}] 流式响应完成，内容长度: ${content.length}`);
    } else {
        const data = await response.json();
        const message = data.choices[0].message;
        content = message.content;
        reasoning = message.reasoning_content || null;
    }
    
    if (reasoning) {
        console.log(`[${provider}] 深度思考过程:\n${reasoning.substring(0, 500)}...`);
    }
    
    // 记录AI响应到日志文件
    logAIResponse(requestLogPath, content, reasoning, provider);
    
    // 尝试解析 JSON
    try {
        return JSON.parse(content);
    } catch (parseError) {
        // 尝试提取 JSON 对象
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (innerError) {
                console.error(`[${provider}] JSON 提取后仍然解析失败:`, innerError.message);
                console.error(`[${provider}] 提取的 JSON 片段 (前500字符):`, jsonMatch[0].substring(0, 500));
                throw new Error(`AI 返回的 JSON 格式不完整，请重试或更换模型`);
            }
        }
        console.error(`[${provider}] 无法从 AI 响应中提取 JSON`);
        console.error(`[${provider}] AI 响应内容 (前500字符):`, content.substring(0, 500));
        throw new Error(`AI 返回内容无法解析为 JSON，请重试或更换模型`);
    }
}

/**
 * 构建 MBTI 分析提示词
 * 
 * @param {Array} questions - 题目列表
 * @param {Array} answers - 用户答案列表
 * @param {string} gender - 用户性别
 * @param {Array} skippedQuestions - 跳过的题目列表
 * @returns {string} 完整的提示词
 */
function buildAnalysisPrompt(questions, answers, gender = null, skippedQuestions = []) {
    const genderText = gender === 'male' ? '男性' : gender === 'female' ? '女性' : '未知';
    
    const systemPrompt = `# 角色与任务

你是一位严格遵守MBTI认知功能理论的心理学分析专家。你的任务是对用户提供的"开放性场景回答答卷"进行心理分析，并输出该用户的MBTI性格标签。

**核心原则**：
- 你不是在"猜测"或"概括"用户的回答，而是在进行**假设检验式的推理**。
- 你必须考虑**多种可能的性格解释**，并通过证据逐一排除，最终留下最符合理论与数据的那一个。
- **禁止**一开始就锚定某个类型，然后沿着该类型寻找支持证据（确认偏误）。

---

## 一、理论基础（必须逐条遵守，减少幻觉）

以下理论来自MBTI官方认可的认知功能模型（荣格八维），不是简化版二分法。

### 1. 类型本质属性
- MBTI描述的是**先天固有的心理倾向**，不是后天习得的人格或习惯。
- 所有类型中性平等，无优劣之分。
- 成年后核心类型**不改变**（行为可随环境调整，但本能偏好回归稳定）。

### 2. 认知功能定义（铁律，不可替换）

| 功能 | 定义 | 典型表现（仅作为参考，不是绝对指标） |
|------|------|--------------------------------------|
| **Se（外倾感觉）** | 专注于当下、现实的感官细节，对物理环境高度敏感 | 描述具体的颜色、声音、气味；喜欢实时体验 |
| **Si（内倾感觉）** | 专注于主观印象、过去的经验对比，重视习惯和记忆 | 回忆过去类似情境，依据以往经验做判断 |
| **Ne（外倾直觉）** | 探索外部世界的模式、关联性和多种可能性 | 联想不同事物之间的联系，喜欢头脑风暴 |
| **Ni（内倾直觉）** | 聚焦于内在的洞见、未来趋势和深层含义 | 突然领悟到某个核心模式，关注长期走向 |
| **Te（外倾思维）** | 依据外部逻辑、效率、客观标准做决策 | 制定计划、整理系统、追求结果 |
| **Ti（内倾思维）** | 依据内部逻辑框架、一致性、精准定义做决策 | 分析原理、构建理论、追求精确 |
| **Fe（外倾情感）** | 依据集体价值观、人际和谐、他人感受做决策 | 照顾群体氛围、表达情感、寻求共识 |
| **Fi（内倾情感）** | 依据个人内心价值观、真实感受、道德信念做决策 | 坚持个人信念、关注内心真实、追求 authenticity |

### 3. 维度二分法的正确使用（避免刻板印象）

- **E/I**：能量恢复方式。E从外部互动获得能量，I从独处/内心世界获得能量。**不是**"外向/内向"的社会化程度。
- **S/N**：信息收集偏好。S关注现实可验证的细节，N关注抽象模式与可能性。**不是**"务实/理想主义"。
- **T/F**：决策优先原则。T优先逻辑因果和客观标准，F优先人际/个人价值观。**不是**"理性/感性"。
- **J/P**：对外部世界的态度。J偏好结构化、计划、决定，P偏好开放、灵活、探索。**不是**"有条理/没条理"。

### 4. 功能层级铁律
- 每个人的认知功能有固定顺序：**主导（第1）、辅助（第2）、第三（第3）、劣势（第4）**。
- 主导功能是最本能、最不费力的。劣势功能是最容易疲惫、过度反应或幼稚化的。
- 功能轴：判断轴（T-F）和感知轴（S-N）必须是互补的。例如：主导为Ni（内倾直觉），辅助必为Fe或Te（外倾判断）。

### 5. 证据层级（权重从高到低）
- **第一层级**（最高）：用户直接陈述的**动机、内心感受、价值判断、焦虑表达**。
- **第二层级**：描述中**重复出现的行为模式、决策优先级、自然反应**。
- **第三层级**：对情境的态度、情绪反应、偏好陈述。

**禁止**：用第三层级证据推翻第一层级证据。

### 6. 辅助分析维度（不可作为主证据，但可作为佐证）

以下维度可为性格分析提供侧面参考，但**不可单独作为判断依据**，仅用于增强或验证主要证据链。

#### 6.1 性别维度的心理学意义
性别本身并非性格的决定因素，但社会文化对不同性别的规训存在系统性差异。**核心原则**：在MBTI理论中，"想"与"做"并非一体，个体并非总是知行合一地生活与工作。相同的外显行为，可能源于截然不同的内在动机。

**示例**：面对"面对他人失礼行为，即使感觉不适，我也不会当众说出来"这一陈述：
- **女性**选择沉默，可能源于社会规训下"女性应该温柔体贴"的内化，其内在动机可能是"不想让对方难堪"（Fe的外向情感关怀），也可能是"这不符合我心中得体的形象"（Fi的内在价值判断）。
- **男性**选择沉默，可能源于社会规训下"不要得罪人"的功利考量，其内在动机可能是"多一事不如少一事"（Ti的理性权衡），也可能是"这无关紧要，不值得计较"（Te的效率优先）。

**分析原则**：
1. **行为≠动机**：不能仅从行为表象推断性格类型。沉默可能是Fe的体贴、Fi的价值观、Ti的权衡、Te的效率考量，也可能是社会规训的产物。必须深入探索用户文本中呈现的**内部动机与心理状态**。
2. **用户可能不坦诚**：用户并非对所有问题都袒露无疑，可能有所保留，甚至因社会期待或道德压力而做出符合"正确答案"倾向的回应。需警惕那些过于"完美"或"正确"的回答。
3. **严格遵守证据层级**：第一层级证据（用户明确陈述的动机、内心感受）优先于第二层级（行为模式），第二层级优先于第三层级（态度偏好）。当证据冲突时，以高层级为准。
4. **深度推论排除干扰**：通过全文分析对比，识别可能受社会规训、道德谴责影响而自我限制作答的部分。例如，若用户多处表现出强烈的个人价值判断（Fi痕迹），却在某处给出"照顾他人感受"的"正确答案"，应怀疑后者是否为社会期待作答，而非真实偏好。
5. **综合定性**：将所有证据汇总，进行交叉验证与矛盾排除，最终形成综合性的性格定性。单一题目的回答不足以定论，需观察整体模式。

#### 6.2 语言风格与文本特征的心理学投射
用户的语言习惯、文体文风、表达方式等，可侧面反映其认知功能偏好：
- **感知型（S）倾向**：描述具体、细节丰富、多用感官词汇（颜色、声音、触感）、叙述线性有序、偏好事实陈述。
- **直觉型（N）倾向**：抽象概念多、善用比喻和类比、跳跃性联想、关注"可能性"与"意义"、叙述结构松散但主题聚焦。
- **思维型（T）倾向**：逻辑连接词多（因此、因为、所以）、因果分析明确、表达客观冷静、偏好精确表述。
- **情感型（F）倾向**：情感词汇丰富、关注人际互动、表达主观感受、语气温暖或情绪化。
- **判断型（J）倾向**：表达有结论性、偏好确定性陈述、结构清晰、有计划性暗示。
- **感知型（P）倾向**：表达开放性、保留可能性、语气灵活、避免绝对化结论。

**分析原则**：语言风格仅作为辅助证据，需与内容分析交叉验证。避免仅凭语言风格下结论。

#### 6.3 潜意识投射与场景理解分析
**核心洞察**：用户的回答不仅仅是文字符号的表层信息，更是其潜意识对题目场景的投射与扩张。分析时需穿透文字表象，洞察用户如何理解、填充、重构题目情境。

**场景理解模式示例**：
用户对题目场景的处理方式本身就能揭示其人格特征。以下是同一道题目的不同回答方式及其可能的人格暗示：

**题目**：如果你的好朋友跟你一起去较近的地方玩，计划中有一个你不喜欢的旅程……

| 回答 | 场景处理模式 | 可能的人格暗示 |
|------|-------------|---------------|
| "能计划出我不喜欢的流程的人会成为我的好朋友吗？" | **否定场景真实性**：质疑题目预设的前提（好朋友不会做出我不喜欢的事） | 可能反映Fi的理想化人际关系观，或Ni对可能性的质疑，或对亲密关系的高标准 |
| "我会将就我的朋友" 或 "我会跟朋友商量改变旅程" | **顺着场景说**：接受题目预设，直接回答行为选择 | 可能反映Fe的和谐导向，或Ti的理性协商，或P的灵活适应 |
| "我的好朋友计划出来的流程我怎么会不喜欢呢" | **扩充场景**：引入额外假设（好朋友=品味一致） | 可能反映Fe对关系的理想化，或Si的经验投射（过去的好朋友都和我品味一致），或对冲突的回避 |
| "我没有好朋友" | **拒绝场景预设**：不参与题目构建的假设情境 | 可能反映I的内向与独立，或对亲密关系的回避/焦虑，或Ti/T的理性切割 |

**分析要点**：
- 用户是**质疑场景**还是**顺从场景**？
- 用户是**扩充细节**还是**维持原意**？
- 用户是**情感化回应**还是**理性化回应**？
- 用户的回答是否暴露了其**人际关系模式**或**认知偏好**？

**其他潜意识投射的表现形式**：
1. **隐含假设**：用户在回答中往往包含题目未明确给出的假设。这些假设是潜意识的投射。
   - 示例：题目问"你会如何处理冲突"，用户回答"我会先冷静下来，因为情绪化解决不了问题"。这里隐含了"情绪化=无效"的价值判断，可能反映Te的效率导向或Ti的理性偏好。

2. **回避与模糊**：用户对某些情境的回避、模糊处理、或给出"正确答案"式的回应，可能暗示潜意识中的冲突或防御。
   - 示例：用户在涉及"权力"或"控制"的题目上给出模糊回答，可能暗示其对该主题存在潜意识焦虑。

3. **情感色调**：用户描述场景时带有的情感色调（温暖、冷漠、焦虑、兴奋）是其潜意识态度的窗口。
   - 示例：描述"独处时间"时，有人用"自由、充电、享受"，有人用"孤独、无聊、逃避"，反映截然不同的内在态度。

**分析原则**：
1. **场景依赖性**：**必须结合题目场景分析用户回答**，不能脱离场景单独分析回答文本。我们测试的是特定场景下用户的反应与想法，一切行为、思考都是在这个场景下被触发的。同一用户在不同场景下可能有截然不同的应对方式。

   **示例**：用户回答"我会回避这种情绪冲突"
   - 如果题目场景是**危险情况**（如对方有暴力倾向、职场权力不对等），回避可能是Ti的理性自保或Si的风险规避
   - 如果题目场景是**安全情况**（如与好友、亲人相处），回避可能是Fe的和谐维护或Fi的内在价值判断
   - 如果用户对**好友亲人**也回避，可能反映对亲密关系的恐惧或回避型依恋
   - 如果用户对**陌生人**也回避，可能反映社交焦虑或I的内向特质
   - **关键**：同一个"回避"行为，在不同场景下可能指向完全不同的心理动机。分析时需明确：这是"该用户在该场景下的反应"，而非"该用户的普遍行为模式"。

2. **不局限于字面**：不能仅从用户选择的选项字面意义推断性格，要看用户如何理解、如何扩张题目场景。
3. **识别潜意识模式**：通过对比用户在不同题目中的场景理解方式，识别其潜意识中反复出现的主题（如"被理解的需求"、"对失控的恐惧"、"对和谐的渴望"）。
4. **结合精神分析视角**：适度运用弗洛伊德的"防御机制"概念（如合理化、投射、反向形成）来理解用户的回答。例如，用户过度强调"独立"可能是对依赖需求的反向形成。
5. **保持谦逊**：潜意识推断具有不确定性，应标注为"可能的潜意识动机"而非确定结论，并与其他证据交叉验证。

---

## 二、分析方法论：强制自我驳斥（避免早期锚定）

你**必须**按照以下步骤进行分析，并在输出中体现每一步的思考痕迹（在 \`analysis_summary\` 或 \`detailed_evidence\` 中记录）。

### 步骤1：提取所有可能的性格假设（发散）
- 阅读用户的所有回答，列出所有**初步看起来合理**的MBTI类型（通常2-4个）。例如：可能是INTJ、INFJ、ISTJ。
- 对每个假设，列出支持它的证据（引用用户原话）。

### 步骤2：对每个假设进行内部一致性检验
- 检查该假设的认知功能栈是否符合理论（例如，INTJ的主导Ni+辅助Te，如果用户回答中完全看不到Te的迹象，则削弱该假设）。
- 检查是否有**反证**：用户回答中是否有与该假设矛盾的地方？

### 步骤3：假设间对比与排除（核心驳斥）
- 对每一对竞争假设，回答以下问题：
  - 假设A能解释但假设B无法解释的关键证据是什么？
  - 假设B能解释但假设A无法解释的关键证据是什么？
  - 哪个假设需要的"额外假设"更少（奥卡姆剃刀）？
- 逐步排除，直到剩下**唯一一个**最符合理论与数据的假设。

### 步骤4：确认最终假设
- 最终确定的类型必须在所有维度上有至少一个**高权重证据**支持。
- 如果某个维度的证据不足（例如，用户几乎没有提到社交相关的内容），则在该维度上标记为"不确定"并说明原因，**不要强行判断**。

### 步骤5：输出结果
- 按照JSON格式输出最终判断，并附上被排除的其他假设及其被排除的理由。

---

## 三、输入格式

用户将提供一份答卷，包含对开放式问题的回答。每个回答对应一个问题（问题内容已知，但分析时以用户回答为主要依据）。`;

    let answersContent = '\n---\n\n## 用户答卷\n\n';
    answersContent += `**用户性别**：${genderText}\n\n`;
    
    questions.forEach((q, index) => {
        const answer = answers.find(a => a.questionId === q.id);
        answersContent += `### 问题 ${index + 1}（测试维度：${q.dimensions.join('、')}）\n`;
        answersContent += `**场景**：${q.scene}\n\n`;
        answersContent += `**问题**：${q.question}\n\n`;
        answersContent += `**用户回答**：${answer ? answer.answerText : '（未回答）'}\n\n---\n\n`;
    });
    
    // 添加抛弃题目信息
    if (skippedQuestions && skippedQuestions.length > 0) {
        answersContent += `## 用户跳过的题目（共 ${skippedQuestions.length} 道）\n\n`;
        answersContent += `以下是用户在测试过程中选择跳过/更换的题目。这些信息非常重要，可以帮助你理解用户可能回避的情境类型或心理防御机制。\n\n`;
        
        skippedQuestions.forEach((q, index) => {
            answersContent += `### 跳过题目 ${index + 1}（测试维度：${q.dimensions ? q.dimensions.join('、') : '未知'}）\n`;
            answersContent += `**场景**：${q.scene || '未知'}\n\n`;
            answersContent += `**问题**：${q.question || '未知'}\n\n`;
            if (q.hadAnswer) {
                answersContent += `**状态**：用户已填写答案后选择更换\n\n`;
            } else {
                answersContent += `**状态**：用户未填写即选择更换\n\n`;
            }
            answersContent += `---\n\n`;
        });
    }

    const questionCount = questions.length;
    const skippedCount = skippedQuestions ? skippedQuestions.length : 0;
    
    const outputFormat = `## 四、输出格式（严格JSON ）

请严格按以下JSON格式输出，不要包含其他内容。**严禁私自增加字段或修改字段名称**。

\`\`\`json
{
  "mbti_type": "INFP",
  "confidence_overall": 75,
  "dimensions": {
    "E/I": {"preference": "I", "confidence": 85, "evidence": ["聚会后需要独处充电", "喜欢深度对话多于群体活动"]},
    "S/N": {"preference": "N", "confidence": 60, "evidence": ["多次谈到未来可能性", "对抽象概念感兴趣"]},
    "T/F": {"preference": "F", "confidence": 70, "evidence": ["做决定优先考虑他人感受", "冲突时更在意关系和谐"]},
    "J/P": {"preference": "P", "confidence": 55, "evidence": ["喜欢开放式安排", "对截止日期感到压力但不太提前规划"]}
  },
  "cognitive_functions": {
    "dominant": "Fi",
    "auxiliary": "Ne",
    "tertiary": "Si",
    "inferior": "Te"
  },
  "alternative_hypotheses_excluded": [
    {
      "type": "ISFP",
      "reason_excluded": "ISFP的主导功能是Fi，辅助是Se。用户虽然表现出Fi，但完全没有Se式的对当下感官细节的关注，反而多次展现Ne式的可能性联想，因此更符合INFP的Fi+Ne组合。"
    }
  ],
  "analysis_summary": "用户的核心动力来自内在价值判断(Fi)，对外探索可能性(Ne)作为辅助。在自我驳斥过程中，对比了ISFP（用户缺少Se证据）和ENFP（用户能量指向内倾），最终确认INFP。",
  "detailed_evidence": [
    {
      "question_id": 1,
      "user_excerpt": "（摘录用户回答原文）",
      "observed_trait": "J/P维度：P倾向",
      "reasoning": "描述中未主动规划结构，而是根据心情逐步决定"
    }
  ],
  "skipped_questions_analysis": "用户跳过的题目主要涉及社交冲突场景，这可能反映出其对人际压力的回避倾向，与Fi类型的内在价值保护机制一致。",
  "caveats": "该分析基于用户在假设情境下的自我描述，受限于自我认知偏差和情境想象的真实性。"
}
\`\`\`

**字段说明（必须严格遵守）**：

1. **mbti_type**（字符串）：4字母MBTI类型，如 "INFP"、"INTJ"
2. **confidence_overall**（数字1-100）：整体置信度百分比
3. **dimensions**（对象）：四个维度的分析，每个维度包含：
   - preference（字符串）：倾向的字母，如 "I"、"N"、"F"、"P"
   - confidence（数字1-100）：该维度的置信度
   - evidence（字符串数组）：2-3条支撑证据
4. **cognitive_functions**（对象）：认知功能栈，**必须使用英文缩写**：
   - dominant（字符串）：主导功能
   - auxiliary（字符串）：辅助功能
   - tertiary（字符串）：第三功能
   - inferior（字符串）：劣势功能
   - **有效值仅为**：Fi, Fe, Ti, Te, Ni, Ne, Si, Se（共8种）
5. **alternative_hypotheses_excluded**（数组）：被排除的其他类型，每个包含：
   - type（字符串）：MBTI类型
   - reason_excluded（字符串）：排除理由
6. **analysis_summary**（字符串）：整体分析总结，200-400字
7. **detailed_evidence**（数组）：每道题的详细分析，每个包含：
   - question_id（数字）：题目编号
   - user_excerpt（字符串）：用户回答摘录
   - observed_trait（字符串）：观察到的特质
   - reasoning（字符串）：分析推理
8. **skipped_questions_analysis**（字符串，可选）：跳过题目的整体分析
9. **caveats**（字符串）：分析说明和注意事项

**输出要求**：
1. 只输出JSON，不要有任何其他文字
2. 严禁私自增加字段或修改字段名称
3. 本次测试共有${questionCount}道题目，请在detailed_evidence中为每道题提供分析
4. 在所有分析文本中，请使用"您"来称呼测试者，不要使用"用户"
5. skipped_questions_analysis字段：如果用户跳过了题目（共${skippedCount}道），请对这些跳过的题目进行整体分析，总结用户可能回避的情境类型或心理模式，写成一段简短的分析文字。如果跳过题目数量为0，则该字段可以省略或为空字符串
6. **语言规范**：在所有分析类文本字段（analysis_summary、detailed_evidence中的reasoning、alternative_hypotheses_excluded中的reason_excluded、skipped_questions_analysis、caveats等）中，请使用中文表达，尽量减少使用英文词汇。但以下情况除外：
   - MBTI类型缩写（如INFP、INTJ等）必须使用英文
   - 认知功能缩写（如Fi、Fe、Ti、Te、Ni、Ne、Si、Se）必须使用英文
   - 维度缩写（如E/I、S/N、T/F、J/P）必须使用英文
   - JSON字段名（如mbti_type、confidence_overall等）保持英文
   - 专有名词或无标准中文翻译的术语可保留英文
   - 特意进行明确规定者，使用规定的返回格式，有冲突者，以**字段说明（必须严格遵守）**为准`;


    return systemPrompt + answersContent + outputFormat;
}

/**
 * 分析用户答案，返回 MBTI 结果
 * 
 * @param {Array} questions - 题目列表
 * @param {Array} answers - 用户答案列表
 * @param {string} provider - 服务提供商
 * @param {string} model - 模型ID
 * @param {string} gender - 用户性别
 * @param {Array} skippedQuestions - 跳过的题目列表
 * @param {Function} onReasoning - 思考内容回调函数 (reasoning: string) => void
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeAnswers(questions, answers, provider = 'glm', model = null, gender = null, skippedQuestions = [], onReasoning = null) {
    const prompt = buildAnalysisPrompt(questions, answers, gender, skippedQuestions);
    const aiResult = await callAIApi(prompt, provider, model, onReasoning);
    
    const mbtiType = aiResult.mbti_type || aiResult.type || 'INTJ';
    
    let dimensions = { E: 50, I: 50, S: 50, N: 50, T: 50, F: 50, J: 50, P: 50 };
    
    /**
     * 处理置信度（AI返回1-100，直接使用）
     * @param {number} confidence - 置信度 1-100
     * @returns {number} 百分比 50-100
     */
    const processConfidence = (confidence) => {
        const conf = typeof confidence === 'number' ? confidence : 50;
        return Math.max(50, Math.min(100, conf));
    };
    
    if (aiResult.dimensions) {
        if (aiResult.dimensions['E/I']) {
            const ei = aiResult.dimensions['E/I'];
            const confPercent = processConfidence(ei.confidence);
            if (ei.preference === 'E') {
                dimensions.E = confPercent;
                dimensions.I = 100 - confPercent;
            } else {
                dimensions.I = confPercent;
                dimensions.E = 100 - confPercent;
            }
        }
        if (aiResult.dimensions['S/N']) {
            const sn = aiResult.dimensions['S/N'];
            const confPercent = processConfidence(sn.confidence);
            if (sn.preference === 'S') {
                dimensions.S = confPercent;
                dimensions.N = 100 - confPercent;
            } else {
                dimensions.N = confPercent;
                dimensions.S = 100 - confPercent;
            }
        }
        if (aiResult.dimensions['T/F']) {
            const tf = aiResult.dimensions['T/F'];
            const confPercent = processConfidence(tf.confidence);
            if (tf.preference === 'T') {
                dimensions.T = confPercent;
                dimensions.F = 100 - confPercent;
            } else {
                dimensions.F = confPercent;
                dimensions.T = 100 - confPercent;
            }
        }
        if (aiResult.dimensions['J/P']) {
            const jp = aiResult.dimensions['J/P'];
            const confPercent = processConfidence(jp.confidence);
            if (jp.preference === 'J') {
                dimensions.J = confPercent;
                dimensions.P = 100 - confPercent;
            } else {
                dimensions.P = confPercent;
                dimensions.J = 100 - confPercent;
            }
        }
    } else if (aiResult.dimensions && aiResult.dimensions.E !== undefined) {
        dimensions = aiResult.dimensions;
    }
    
    const overallConfidence = typeof aiResult.confidence_overall === 'number' 
        ? Math.max(1, Math.min(100, aiResult.confidence_overall))
        : 50;
    
    return {
        type: mbtiType,
        typeLabel: getTypeLabel(mbtiType),
        dimensions: dimensions,
        analysis: aiResult.analysis_summary || aiResult.analysis || '分析结果生成中...',
        cognitiveFunctions: aiResult.cognitive_functions || null,
        confidence: overallConfidence,
        alternativeHypotheses: aiResult.alternative_hypotheses_excluded || [],
        detailedEvidence: aiResult.detailed_evidence || [],
        caveats: aiResult.caveats || '',
        skippedQuestionsAnalysis: aiResult.skipped_questions_analysis || ''
    };
}

/**
 * 获取 MBTI 类型标签
 * 
 * @param {string} type - MBTI 类型
 * @returns {string} 类型标签
 */
function getTypeLabel(type) {
    const labels = {
        'INTJ': '建筑师',
        'INTP': '逻辑学家',
        'ENTJ': '指挥官',
        'ENTP': '辩论家',
        'INFJ': '提倡者',
        'INFP': '调停者',
        'ENFJ': '主人公',
        'ENFP': '竞选者',
        'ISTJ': '物流师',
        'ISFJ': '守卫者',
        'ESTJ': '总经理',
        'ESFJ': '执政官',
        'ISTP': '鉴赏家',
        'ISFP': '探险家',
        'ESTP': '企业家',
        'ESFP': '表演者'
    };
    return labels[type] || '未知';
}

module.exports = {
    callAIApi,
    analyzeAnswers,
    buildAnalysisPrompt,
    getTypeLabel,
    getAvailableModels,
    getSystemDefaultModel,
    MODEL_CONFIG
};
