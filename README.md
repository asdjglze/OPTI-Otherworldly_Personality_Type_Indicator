# OPTI - Otherworldly Personality Type Indicator

基于原神角色的MBTI人格测试系统

## 项目简介

OPTI是一个基于原神角色的MBTI人格测试系统，用户可以通过回答问题获得自己对应的人格类型，并匹配原神中的角色。

## 功能特点

- **多种题库版本**：支持90题、106题、172题、200题等多种题库
- **原神风格题目**：提供原神风格的测试题目
- **角色匹配**：根据测试结果匹配原神中的角色（支持119+原神角色）
- **详细分析**：提供详细的MBTI人格分析和角色解读
- **AI智能分析**：集成AI功能，提供更深入的人格分析
- **多语言支持**：支持原神版和原版两种题目风格

## 题库版本

### 原版题目
| 版本 | 题数 | 说明 |
|------|------|------|
| 90题版 | 90题 | 标准版 |
| 106题版 | 106题 | 扩展版 |
| 172题版 | 172题 | 完整版 |
| 200题版 | 200题 | 全功能版 |

### 原神版题目
| 版本 | 题数 | 说明 |
|------|------|------|
| 90题原神版 | 90题 | 原神风格 |
| 200题原神版 | 200题 | 原神风格全功能版 |

## 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (原生JS，无框架)
- **后端**：Node.js + Express
- **数据存储**：JSON文件本地存储
- **AI服务**：支持多种AI模型接口

## 部署说明

### 环境要求

- Node.js 14+
- npm

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/asdjglze/OPTI-Otherworldly_Personality_Type_Indicator.git
cd OPTI-Otherworldly_Personality_Type_Indicator
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env` 文件，配置以下内容：
```
PORT=3000
AI_API_KEY=你的AI接口密钥
AI_BASE_URL=AI接口地址
```

4. 启动服务
```bash
npm start
```

5. 访问服务
打开浏览器访问 `http://localhost:3000`

## 项目结构

```
├── index.html              # 主页面
├── server.js               # Node.js服务器入口
├── package.json            # 项目配置
│
├── js/                     # 前端JavaScript
│   ├── main.js             # 核心逻辑
│   ├── ui.js               # UI交互
│   ├── calculator.js       # MBTI计算
│   ├── result-renderer.js  # 结果渲染
│   ├── question-loader.js   # 题目加载
│   ├── answer-page.js       # 答题页面
│   ├── ai-analysis.js       # AI分析
│   └── ...
│
├── css/                    # 样式文件
│   ├── main.css            # 主样式
│   ├── components.css      # 组件样式
│   └── ...
│
├── data/                   # 数据文件
│   ├── character_data.json    # 角色数据
│   ├── mbti_character_mapping.json  # MBTI角色映射
│   ├── mbti_descriptions.json     # MBTI描述
│   └── questions/              # 题库
│       ├── genshin/            # 原神版题目
│       │   ├── mbti-90.json
│       │   └── mbti-200.json
│       └── original/           # 原版题目
│           ├── mbti-90.json
│           ├── mbti-106.json
│           ├── mbti-172.json
│           └── mbti-200.json
│
├── config/                 # 配置文件
│   └── model-config.js     # AI模型配置
│
├── routes/                 # 路由文件
│   ├── data.js             # 数据接口
│   ├── result.js           # 结果接口
│   ├── statistics.js        # 统计接口
│   └── ai-analyze.js       # AI分析接口
│
├── services/               # 服务文件
│   ├── ai-service.js       # AI服务
│   ├── calculator.js       # 计算服务
│   ├── data.js             # 数据服务
│   └── ...
│
└── assets/                 # 静态资源
    ├── characters/         # 角色图片
    ├── backgrounds/       # 背景图片
    ├── audio/             # 音频文件
    └── video/             # 视频文件
```

## 主要功能模块

### 答题系统
- 多版本题目切换
- 答题进度保存
- 实时答案统计
- 维度分析

### 结果展示
- MBTI人格类型判定
- 角色匹配推荐
- 详细人格分析
- 职业倾向分析
- 人际关系分析

### AI增强功能
- 深度人格分析
- 个性化建议
- 角色故事扩展

## 注意事项

1. 本项目仅供学习和交流使用
2. AI分析功能需要配置有效的AI接口密钥
3. 部分素材资源较大，首次加载可能较慢
4. 答题结果保存在浏览器本地

## 许可证

MIT License

## 联系方式

- GitHub: https://github.com/asdjglze/OPTI-Otherworldly_Personality_Type_Indicator
