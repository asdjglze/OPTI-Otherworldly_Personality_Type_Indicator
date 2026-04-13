# OPTI - Otherworldly Personality Type Indicator

**异世界人格类型指标** - 基于荣格心理类型理论、融合提瓦特元素体系的MBTI人格测试系统

---

## 目录

- [项目概述](#项目概述)
- [系统架构](#系统架构)
- [功能模块](#功能模块)
- [API接口文档](#api接口文档)
- [部署指南](#部署指南)
- [配置说明](#配置说明)
- [数据结构](#数据结构)
- [开发指南](#开发指南)
- [许可证](#许可证)

---

## 项目概述

### 核心定位

OPTI (Otherworldly Personality Type Indicator) 是一个专业的MBTI人格测试系统，将荣格八维认知功能理论与《原神》世界观深度融合，为测试者提供沉浸式的人格分析体验。

### 核心特色

#### 1. 元素人格映射系统

将MBTI四维人格映射为原神七元素体系：

| MBTI维度 | 左侧倾向 | 对应元素 | 右侧倾向 | 对应元素 |
|----------|----------|----------|----------|----------|
| E/I（能量方向） | 外倾(E) | 风 | 内倾(I) | 水 |
| S/N（信息收集） | 感觉(S) | 火 | 直觉(N) | 岩 |
| T/F（决策方式） | 思考(T) | 雷 | 情感(F) | 草 |
| J/P（生活态度） | 判断(J) | 冰 | 感知(P) | 原（物理） |

#### 2. 角色人格匹配

- **主要角色**：32个（16种MBTI类型 × 2种性别），展示完整角色故事、语音、立绘
- **典型角色**：111个，展示角色头像和简介，扩展人格代表性

#### 3. AI深度分析

支持多种大语言模型进行深度人格分析：
- 智谱GLM（GLM-5.1、GLM-5、GLM-4.7等）
- DeepSeek（DeepSeek Reasoner、DeepSeek Chat）
- 千问（Qwen3-Max、Qwen3.5-Plus等）
- 火山引擎/豆包（Doubao Seed系列）

---

## 系统架构

### 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端 | HTML5 + CSS3 + JavaScript | 原生JS，无框架依赖 |
| 后端 | Node.js + Express | RESTful API设计 |
| 数据存储 | JSON文件 | 本地文件存储，无需数据库 |
| AI服务 | 多模型API | 支持OpenAI兼容接口 |

### 目录结构

```
dist-v1.0.0/
├── index.html                    # 前端入口页面
├── server.js                     # 后端服务入口
├── package.json                  # 项目依赖配置
├── .env                          # 环境变量配置（需自行创建）
├── .gitignore                    # Git忽略规则
├── LICENSE                       # MIT许可证
│
├── js/                           # 前端JavaScript模块
│   ├── main.js                   # 核心逻辑：应用初始化、状态管理
│   ├── ui.js                     # UI交互：页面切换、事件绑定
│   ├── calculator.js             # MBTI计算：维度得分、类型判定
│   ├── result-renderer.js        # 结果渲染：报告页面生成
│   ├── question-loader.js        # 题目加载：题库读取、版本切换
│   ├── answer-page.js            # 答题页面：进度条、答案记录
│   ├── ai-analysis.js            # AI分析：大模型交互、流式响应
│   ├── dimension-mapper.js       # 维度映射：元素转换逻辑
│   ├── character-stats-modal.js  # 角色统计弹窗
│   ├── stats-modal.js            # 统计数据弹窗
│   ├── term-renderer.js          # 术语渲染：MBTI术语解释
│   └── quick-test.js             # 快速测试：随机答案生成
│
├── css/                          # 样式文件
│   ├── main.css                  # 主样式：布局、通用组件
│   ├── components.css            # 组件样式：按钮、卡片、弹窗
│   ├── themes.css                # 主题样式：元素主题色
│   └── share-card.css            # 分享卡片：结果分享样式
│
├── data/                         # 数据文件
│   ├── character_data.json       # 角色数据：111个角色完整信息
│   ├── mbti_character_mapping.json # MBTI角色映射：类型与角色对应
│   ├── mbti_descriptions.json    # MBTI描述：16种类型详细说明
│   ├── dimension_element_mapping.json # 维度元素映射：MBTI→元素
│   ├── element_temperament_mapping.json # 元素气质映射：元素→气质
│   ├── city_backgrounds.json     # 城市背景：地区→背景图映射
│   ├── mbti_statistics.json      # MBTI统计：类型分布数据
│   ├── mbti_compatibility_pairs.json # 配对兼容性：类型匹配度
│   ├── mbti_card_summaries.json  # 卡片摘要：结果卡片内容
│   ├── about_test.json           # 测试说明：项目介绍
│   ├── ai-questions.json         # AI题目：开放性场景问题
│   └── questions/                # 题库目录
│       ├── genshin/              # 原神版题目
│       │   ├── mbti-20.json      # 20题快速版
│       │   ├── mbti-90.json      # 90题标准版
│       │   └── mbti-200.json     # 200题完整版
│       └── original/             # 原版题目
│           ├── mbti-90.json
│           ├── mbti-106.json
│           ├── mbti-172.json
│           └── mbti-200.json
│
├── config/                       # 配置文件
│   └── model-config.js           # AI模型配置：多模型统一管理
│
├── routes/                       # 后端路由
│   ├── data.js                   # 数据接口：题库、角色数据
│   ├── result.js                 # 结果接口：测试结果存储
│   ├── statistics.js             # 统计接口：数据统计
│   ├── ai-analyze.js             # AI分析接口：大模型调用
│   └── user.js                   # 用户接口：登录、注册
│
├── services/                     # 后端服务
│   ├── ai-service.js             # AI服务：大模型API调用
│   ├── calculator.js             # 计算服务：MBTI计算逻辑
│   ├── data.js                   # 数据服务：数据读取封装
│   ├── json-db.js                # JSON数据库：文件读写
│   ├── result.js                 # 结果服务：结果存储
│   └── auth.js                   # 认证服务：用户认证
│
└── assets/                       # 静态资源
    ├── audio/                    # 音频资源
    │   ├── bgm.mp3               # 背景音乐
    │   ├── ambient.mp3           # 环境音效
    │   └── {角色名}_audio_1.mp3  # 角色语音（32个主要角色）
    ├── backgrounds/              # 背景图片
    │   ├── mondstadt_*.jpg       # 蒙德背景
    │   ├── liyue_*.jpg           # 璃月背景
    │   ├── inazuma_*.jpg         # 稻妻背景
    │   ├── sumeru_*.jpg          # 须弥背景
    │   ├── fontaine_*.jpg        # 枫丹背景
    │   ├── natlan_*.jpg          # 纳塔背景
    │   └── snezhnaya_*.jpg       # 至冬背景
    ├── characters/               # 角色图片
    │   ├── avatars/              # 角色头像（111个）
    │   ├── badges/               # 元素徽章（7元素）
    │   ├── mobile_cards/         # 移动端卡片（32个）
    │   ├── portraits/            # 角色立绘
    │   ├── {角色名}_card.png     # 角色卡片
    │   └── {角色名}_showcase.png # 角色展示图
    ├── images/                   # 其他图片
    │   ├── elements/             # 元素图标
    │   └── logo.png              # Logo
    └── video/                    # 视频资源
        └── bg.mp4                # 背景视频
```

---

## 功能模块

### 1. 测试系统

#### 1.1 传统测试模式

| 题库版本 | 题数 | 题目类型 | 适用场景 |
|----------|------|----------|----------|
| mbti-20 | 20题 | 原神版 | 快速体验 |
| mbti-90 | 90题 | 原神版/原版 | 标准测试 |
| mbti-106 | 106题 | 原版 | 深度测试 |
| mbti-172 | 172题 | 原版 | 完整测试 |
| mbti-200 | 200题 | 原神版/原版 | 专业测试 |

**特性**：
- 答题进度自动保存到浏览器本地存储
- 支持中途退出、继续答题
- 实时维度得分统计
- 支持快速测试（随机答案）

#### 1.2 AI深度分析模式

| 测试模式 | 题数 | 分析方式 | 特点 |
|----------|------|----------|------|
| 快速测试 | 5题 | AI分析 | 快速获取人格画像 |
| 基础测试 | 10题 | AI分析 | 平衡速度与准确度 |
| 完整测试 | 25题 | AI分析 | 最详细的人格分析 |

**AI分析特性**：
- 开放性场景问题，非选择题
- 支持换题功能（可跳过不适题目）
- 流式响应，实时显示分析进度
- 输出包含：认知功能栈、置信度、被排除假设、详细证据

### 2. 结果展示

#### 2.1 人格类型判定

- MBTI四字母类型（如 INFP、INTJ）
- 类型标签（如"调停者"、"建筑师"）
- 整体置信度（1-100%）

#### 2.2 维度分析

```
维度得分示例：
E/I: 外倾(E) 35% | 内倾(I) 65%
S/N: 感觉(S) 40% | 直觉(N) 60%
T/F: 思考(T) 30% | 情感(F) 70%
J/P: 判断(J) 45% | 感知(P) 55%
```

#### 2.3 元素人格

根据MBTI类型生成对应的元素组合：
- 示例：INFP → 水+岩+草+原

#### 2.4 角色匹配

- **主要角色**：根据性别匹配对应的主要角色，展示：
  - 角色立绘、卡片
  - 角色语音
  - 完整角色故事
  - 角色详情

- **典型角色列表**：展示同类型的其他角色

#### 2.5 人格详解

- **认知功能栈**：主导、辅助、第三、劣势功能
- **职业发展**：适合的职业领域、岗位
- **社交风格**：人际关系特点
- **家庭关系**：家庭角色建议
- **个人成长**：发展建议
- **配对兼容性**：与其他类型的匹配度

### 3. 其他功能

- **结果导出**：导出完整测试报告（JSON格式）
- **分享卡片**：生成可分享的结果图片
- **用户系统**：登录注册，保存测试历史

---

## API接口文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **认证方式**: Cookie (`auth_token`)

### 接口列表

#### 1. 数据接口

##### GET /api/questions/:version
获取指定版本的题库

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| version | string | 是 | 题库版本（如 `90`, `200-genshin`） |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "q1",
        "question": "题目内容",
        "options": ["选项A", "选项B"],
        "dimensions": ["E/I"]
      }
    ]
  }
}
```

##### GET /api/character/:mbtiType/:gender
获取指定类型和性别的角色数据

**路径参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| mbtiType | string | 是 | MBTI类型（如 `INFP`） |
| gender | string | 是 | 性别（`male`/`female`） |

#### 2. 结果接口

##### POST /api/result
保存测试结果

**请求体**：
```json
{
  "type": "INFP",
  "gender": "female",
  "dimensions": { "E": 35, "I": 65, "S": 40, "N": 60, "T": 30, "F": 70, "J": 45, "P": 55 },
  "answers": [
    { "questionId": "q1", "answer": 0 }
  ]
}
```

##### GET /api/result/latest
获取最新测试结果

#### 3. AI分析接口

##### GET /api/ai-models
获取可用的AI模型列表

**响应示例**：
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "provider": "glm",
        "providerName": "智谱 GLM",
        "models": [
          { "id": "glm-5.1", "name": "GLM-5.1（推荐）", "description": "最新旗舰模型" }
        ],
        "supportsThinking": true
      }
    ],
    "defaultModel": { "provider": "glm", "model": "glm-5.1" }
  }
}
```

##### GET /api/ai-questions
获取AI分析模式的题目

**查询参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| count | number | 否 | 题目数量（5/10/25，默认10） |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "ai_q1",
        "scene": "场景描述",
        "question": "开放性问题",
        "hint": "回答提示",
        "dimensions": ["E/I", "S/N"]
      }
    ],
    "allDimensions": ["E/I", "S/N", "T/F", "J/P"]
  }
}
```

##### POST /api/ai-questions/replace
换题接口

**请求体**：
```json
{
  "currentQuestionIds": ["ai_q1", "ai_q2", "ai_q3", "ai_q4", "ai_q5"],
  "replaceIndex": 2
}
```

##### POST /api/ai-analyze
提交答案进行AI分析（SSE流式响应）

**请求体**：
```json
{
  "answers": [
    { "questionId": "ai_q1", "answerText": "用户的开放性回答" }
  ],
  "gender": "female",
  "questions": [],
  "provider": "glm",
  "model": "glm-5.1",
  "skippedQuestions": []
}
```

**响应格式**：Server-Sent Events (SSE)

```
data: {"stage": "preparing", "message": "正在准备分析数据...", "progress": 5}

data: {"stage": "connecting", "message": "正在连接大模型服务...", "progress": 10}

data: {"stage": "thinking", "message": "大模型正在深度思考...", "progress": 20}

data: {"stage": "complete", "message": "分析完成！", "progress": 100}

data: {"stage": "result", "data": { /* 完整结果对象 */ }}
```

**结果对象结构**：
```json
{
  "type": "INFP",
  "label": "调停者",
  "elements": { "primary": "hydro", "secondary": "geo" },
  "dimensionScores": { /* 四维度得分 */ },
  "functionStack": {
    "dominant": "Fi",
    "auxiliary": "Ne",
    "tertiary": "Si",
    "inferior": "Te"
  },
  "characterFull": { /* 主要角色数据 */ },
  "characterExamples": [ /* 典型角色列表 */ ],
  "careerInfo": { /* 职业信息 */ },
  "aiAnalysis": {
    "confidence": 75,
    "cognitiveFunctions": { /* 认知功能 */ },
    "alternativeHypotheses": [ /* 被排除的假设 */ ],
    "detailedEvidence": [ /* 详细证据 */ ],
    "analysisSummary": "分析总结"
  }
}
```

#### 4. 用户接口

##### POST /api/register
用户注册

**请求体**：
```json
{
  "username": "user123",
  "password": "password123"
}
```

##### POST /api/login
用户登录

**请求体**：
```json
{
  "username": "user123",
  "password": "password123"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "username": "user123",
    "token": "auth_token_value"
  }
}
```

---

## 部署指南

### 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 14.0.0 | 推荐使用LTS版本 |
| npm | >= 6.0.0 | 随Node.js安装 |

### 本地开发部署

#### 步骤1：克隆仓库

```bash
git clone https://github.com/asdjglze/OPTI-Otherworldly_Personality_Type_Indicator.git
cd OPTI-Otherworldly_Personality_Type_Indicator
```

#### 步骤2：安装依赖

```bash
npm install
```

#### 步骤3：配置环境变量

创建 `.env` 文件：

```env
# 服务端口
PORT=3000

# 智谱GLM配置（推荐）
GLM_API_KEY=your_glm_api_key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
GLM_MODEL=glm-4-flash

# DeepSeek配置（可选）
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat

# 千问配置（可选）
QWEN_API_KEY=your_qwen_api_key
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions

# 火山引擎/豆包配置（可选）
VOLCANO_API_KEY=your_volcano_api_key
VOLCANO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
VOLCANO_MODEL=doubao-pro-32k
```

#### 步骤4：启动服务

```bash
# 生产模式
npm start

# 开发模式（支持热重载）
npm run dev
```

#### 步骤5：访问应用

打开浏览器访问 `http://localhost:3000`

### 生产环境部署

#### 使用PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name opti

# 设置开机自启
pm2 startup
pm2 save
```

#### Nginx反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # SSE支持
        proxy_buffering off;
        proxy_cache off;
    }
}
```

---

## 配置说明

### AI模型配置

配置文件：`config/model-config.js`

支持的模型提供商：

| 提供商 | 环境变量 | 支持的模型 |
|--------|----------|------------|
| 智谱GLM | `GLM_API_KEY`, `GLM_API_URL`, `GLM_MODEL` | glm-5.1, glm-5, glm-4.7, glm-4.6, glm-4.5-flash |
| DeepSeek | `DEEPSEEK_API_KEY`, `DEEPSEEK_API_URL`, `DEEPSEEK_MODEL` | deepseek-reasoner, deepseek-chat |
| 千问 | `QWEN_API_KEY`, `QWEN_API_URL` | qwen3-max, qwen3.6-plus, qwen3.5-plus, qwen3.5-flash, qwen-turbo |
| 火山引擎 | `VOLCANO_API_KEY`, `VOLCANO_API_URL`, `VOLCANO_MODEL` | doubao-seed-2-0-pro-260215, doubao-seed-2-0-lite-260215, doubao-seed-1-8-251228 |

### 模型选择建议

| 场景 | 推荐模型 | 原因 |
|------|----------|------|
| 生产环境 | GLM-5.1 | 最新旗舰，推理能力强 |
| 成本敏感 | GLM-4.5-Flash | 免费模型，支持深度思考 |
| 推理质量 | DeepSeek Reasoner | 原生深度思考模型 |
| 均衡选择 | Qwen3.5-Plus | 效果、速度、成本均衡 |

---

## 数据结构

### 角色数据结构

```typescript
interface Character {
  id: string;                    // 角色ID
  name: string;                  // 角色名称
  name_en: string;               // 英文名称
  region: string;                // 所属地区
  element: string;               // 元素类型
  cv: string;                    // 声优
  description: string;           // 角色描述
  assets: {
    avatar: string;              // 头像路径
    icon: string;                // 元素图标
    portrait: string;            // 立绘路径
  };
  rarity: string;                // 稀有度
  birthday: string;              // 生日
  affiliation: string;           // 所属组织
  weapon_type: string;           // 武器类型
  constellation: string;         // 命之座
  title: string;                 // 称号
  vision_cn: string;             // 元素名称（中文）
  details: string;               // 详细介绍
  stories: Story[];              // 角色故事
  voice_lines: VoiceLine[];      // 语音
  showcase: string;              // 展示图
  card: string;                  // 卡片图
  gender: string;                // 性别
}
```

### MBTI映射结构

```typescript
interface MBTIMapping {
  [mbtiType: string]: {
    primary_male: string;        // 男性主要角色ID
    primary_female: string;      // 女性主要角色ID
    desc_template: string;       // 描述模板
    full_description: string;    // 完整描述
    suitable_careers: CareerInfo;// 职业信息
    strengths: string[];         // 优势
    weaknesses: string[];        // 劣势
  };
}
```

### 维度元素映射

```typescript
interface DimensionMapping {
  dimensions: {
    EI: { leftElement: string; rightElement: string; leftName: string; rightName: string; };
    SN: { leftElement: string; rightElement: string; leftName: string; rightName: string; };
    TF: { leftElement: string; rightElement: string; leftName: string; rightName: string; };
    JP: { leftElement: string; rightElement: string; leftName: string; rightName: string; };
  };
  letterToElement: { [letter: string]: string };
  elementNames: { [element: string]: string };
}
```

---

## 开发指南

### 添加新题库

1. 在 `data/questions/` 目录下创建新的JSON文件
2. 遵循现有题库格式：

```json
[
  {
    "id": "q1",
    "question": "题目内容",
    "options": ["选项A", "选项B"],
    "dimensions": ["E/I"],
    "scores": { "A": { "E": 1 }, "B": { "I": 1 } }
  }
]
```

### 添加新角色

1. 在 `data/character_data.json` 中添加角色数据
2. 在 `data/mbti_character_mapping.json` 中配置映射关系
3. 添加对应的图片资源到 `assets/characters/`

### 扩展AI模型

1. 在 `config/model-config.js` 中添加新的提供商配置
2. 在 `services/ai-service.js` 中实现调用逻辑

### 前端开发

前端采用模块化设计，主要入口为 `js/main.js`：

```javascript
// 应用初始化流程
document.addEventListener('DOMContentLoaded', () => {
  // 1. 加载配置
  // 2. 初始化UI
  // 3. 绑定事件
  // 4. 恢复状态（如有）
});
```

---

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

---

## 联系方式

- **GitHub**: https://github.com/asdjglze/OPTI-Otherworldly_Personality_Type_Indicator
- **版本**: v1.0.0
