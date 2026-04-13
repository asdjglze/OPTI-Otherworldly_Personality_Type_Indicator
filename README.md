# OPTI - Otherworldly Personality Type Indicator

原神版MBTI人格测试系统

## 项目简介

OPTI是一个基于原神角色的MBTI人格测试系统，用户可以通过回答问题获得自己对应的人格类型，并匹配原神中的角色。

## 功能特点

- **多种题库版本**：支持20题、90题、200题等多种题库
- **原神风格题目**：提供原神风格的测试题目
- **角色匹配**：根据测试结果匹配原神中的角色
- **详细分析**：提供详细的MBTI人格分析和角色解读
- **AI智能分析**：集成AI功能，提供更深入的人格分析
- **多语言支持**：支持原神版和原版两种题目风格

## 技术栈

- **前端**：HTML5 + CSS3 + JavaScript
- **后端**：Node.js + Express
- **数据存储**：JSON文件存储
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
AI_MODEL=xxx
AI_API_KEY=xxx
```

4. 启动服务
```bash
npm start
```

5. 访问服务
打开浏览器访问 `http://localhost:3000`

## 版本信息

- **当前版本**：v1.0.0
- **构建时间**：2026-04-13

## 目录结构

```
├── app/                    # 源代码目录
│   ├── index.html         # 主入口
│   ├── server.js          # 服务器入口
│   ├── js/                # JavaScript文件
│   ├── css/               # 样式文件
│   ├── data/              # 数据文件
│   │   ├── questions/     # 题库
│   │   └── mbti/         # MBTI描述数据
│   ├── assets/            # 静态资源
│   │   ├── characters/    # 角色图片
│   │   ├── backgrounds/   # 背景图片
│   │   ├── audio/        # 音频文件
│   │   └── video/        # 视频文件
│   ├── config/            # 配置文件
│   ├── routes/            # 路由文件
│   └── services/          # 服务文件
├── dist-v1.0.0/          # 发布版本（可直接部署）
└── package.json
```

## 注意事项

1. 本项目仅供学习和交流使用
2. 部分素材资源较大，首次加载可能较慢
3. AI分析功能需要配置有效的AI接口

## 许可证

本项目仅供学习交流使用，请勿用于商业用途。

## 联系方式

- GitHub: https://github.com/asdjglze/OPTI-Otherworldly_Personality_Type_Indicator
