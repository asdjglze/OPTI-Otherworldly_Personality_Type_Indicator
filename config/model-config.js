// 版本号: v1.0.0
/**
 * 模型配置模块
 * 
 * 功能: 集中管理所有 AI 模型的配置信息
 * 支持: DeepSeek、千问、豆包、智谱GLM（均支持深度思考）
 * 
 * 深度思考功能说明:
 * - DeepSeek: deepseek-reasoner 原生支持，deepseek-chat 通过 thinking 参数启用
 * - 千问: 所有模型通过 enable_thinking 参数启用
 * - 豆包: doubao-seed-* 系列原生支持深度思考
 * - 智谱GLM: GLM-5/4.7/4.6/4.5 系列通过 thinking 参数启用
 */

const path = require('path');

// 明确指定 .env 文件路径（app 目录下）
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * 构建完整的 API URL（自动拼接 /chat/completions）
 * 
 * @param {string} baseUrl - 基础 URL（不含端点）
 * @returns {string} 完整的 API URL
 */
function buildApiUrl(baseUrl) {
    if (!baseUrl) return '';
    const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return url.endsWith('/chat/completions') ? url : `${url}/chat/completions`;
}

/**
 * 模型配置（仅保留支持深度思考的模型）
 * 
 * 配置说明：
 * - 环境变量只需配置基础 URL（如 https://api.deepseek.com/v1）
 * - 代码会自动拼接 /chat/completions 端点
 */
const MODEL_CONFIG = {
    glm: {
        name: '智谱 GLM',
        apiKey: process.env.GLM_API_KEY,
        apiUrl: buildApiUrl(process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4'),
        models: [
            { id: 'glm-5.1', name: 'GLM-5.1（推荐）', description: '最新旗舰模型，强制深度思考' },
            { id: 'glm-5', name: 'GLM-5', description: '高智能基座，强制深度思考' },
            { id: 'glm-4.7', name: 'GLM-4.7', description: '高智能模型，支持深度思考' },
            { id: 'glm-4.6', name: 'GLM-4.6', description: '超强性能，支持深度思考' },
            { id: 'glm-4.5-flash', name: 'GLM-4.5-Flash', description: '免费模型，支持深度思考' }
        ],
        supportsThinking: true
    },
    deepseek: {
        name: 'DeepSeek',
        apiKey: process.env.DEEPSEEK_API_KEY,
        apiUrl: buildApiUrl(process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1'),
        models: [
            { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner（推荐）', description: '原生深度思考模型，推理能力最强' },
            { id: 'deepseek-chat', name: 'DeepSeek Chat', description: '通用对话模型，支持深度思考参数' }
        ],
        supportsThinking: true,
        noTemperature: true
    },
    qwen: {
        name: '千问（阿里云百炼）',
        apiKey: process.env.QWEN_API_KEY,
        apiUrl: buildApiUrl(process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
        models: [
            { id: 'qwen3-max', name: 'Qwen3-Max（推荐）', description: '旗舰模型，深度思考能力最强' },
            { id: 'qwen3.6-plus', name: 'Qwen3.6-Plus', description: '效果、速度、成本均衡' },
            { id: 'qwen3.5-plus', name: 'Qwen3.5-Plus', description: '效果、速度、成本均衡' },
            { id: 'qwen3.5-flash', name: 'Qwen3.5-Flash', description: '速度快、成本低，支持深度思考' },
            { id: 'qwen-turbo', name: 'Qwen-Turbo', description: '快速响应，支持深度思考' }
        ],
        supportsThinking: true
    },
    volcano: {
        name: '火山引擎/豆包',
        apiKey: process.env.VOLCANO_API_KEY,
        apiUrl: buildApiUrl(process.env.VOLCANO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3'),
        models: [
            { id: 'doubao-seed-2-0-pro-260215', name: '豆包 Seed 2.0 Pro（推荐）', description: '专业版深度思考模型，效果最佳' },
            { id: 'doubao-seed-2-0-lite-260215', name: '豆包 Seed 2.0 Lite', description: '轻量级深度思考模型' },
            { id: 'doubao-seed-1-8-251228', name: '豆包 Seed 1.8', description: '稳定版本深度思考模型' }
        ],
        supportsThinking: true
    }
};

/**
 * 获取提供商的基础 URL（不含 /chat/completions 端点）
 * 
 * 说明：从完整的 API URL 中提取基础 URL，用于日志输出或配置展示。
 * 例如：https://api.deepseek.com/v1/chat/completions -> https://api.deepseek.com/v1
 * 
 * @param {string} provider - 提供商名称（如 'glm', 'deepseek', 'qwen', 'volcano'）
 * @returns {string} 基础 URL，如果提供商不存在则返回空字符串
 */
function getBaseUrl(provider) {
    const config = MODEL_CONFIG[provider];
    if (!config) return '';
    return config.apiUrl.replace('/chat/completions', '');
}

/**
 * 获取提供商的 API Key
 * 
 * @param {string} provider - 提供商名称
 * @returns {string} API Key
 */
function getApiKey(provider) {
    const config = MODEL_CONFIG[provider];
    return config ? config.apiKey : '';
}

/**
 * 获取提供商的默认模型
 * 
 * @param {string} provider - 提供商名称
 * @returns {string} 默认模型 ID
 */
function getDefaultModel(provider) {
    const config = MODEL_CONFIG[provider];
    if (!config || !config.models || config.models.length === 0) return '';
    return config.models[0].id;
}

/**
 * 获取可用的模型列表
 * 
 * @returns {Array} 可用模型列表
 */
function getAvailableModels() {
    const availableModels = [];
    
    for (const [provider, config] of Object.entries(MODEL_CONFIG)) {
        if (config.apiKey) {
            availableModels.push({
                provider: provider,
                providerName: config.name,
                models: config.models,
                supportsThinking: config.supportsThinking
            });
        }
    }
    
    return availableModels;
}

/**
 * 获取系统默认模型
 * 
 * @returns {Object} 默认模型配置 {provider, model}
 */
function getSystemDefaultModel() {
    if (MODEL_CONFIG.glm.apiKey) {
        return { provider: 'glm', model: 'glm-5.1' };
    }
    if (MODEL_CONFIG.deepseek.apiKey) {
        return { provider: 'deepseek', model: 'deepseek-reasoner' };
    }
    if (MODEL_CONFIG.qwen.apiKey) {
        return { provider: 'qwen', model: 'qwen3-max' };
    }
    if (MODEL_CONFIG.volcano.apiKey) {
        return { provider: 'volcano', model: 'doubao-seed-2-0-pro-260215' };
    }
    return { provider: 'glm', model: 'glm-5.1' };
}

/**
 * 检查提供商是否可用
 * 
 * @param {string} provider - 提供商名称
 * @returns {boolean} 是否可用
 */
function isProviderAvailable(provider) {
    const config = MODEL_CONFIG[provider];
    return config && !!config.apiKey;
}

/**
 * 获取提供商配置
 * 
 * @param {string} provider - 提供商名称
 * @returns {Object|null} 提供商配置
 */
function getProviderConfig(provider) {
    return MODEL_CONFIG[provider] || null;
}

/**
 * 获取所有提供商名称
 * 
 * @returns {Array<string>} 提供商名称列表
 */
function getProviderNames() {
    return Object.keys(MODEL_CONFIG);
}

/**
 * 健康检查
 * 
 * @returns {Object} 健康状态
 */
function healthCheck() {
    const providers = {};
    for (const [name, config] of Object.entries(MODEL_CONFIG)) {
        providers[name] = !!config.apiKey;
    }
    return {
        status: 'healthy',
        providers: providers
    };
}

module.exports = {
    MODEL_CONFIG,
    getBaseUrl,
    getApiKey,
    getDefaultModel,
    getAvailableModels,
    getSystemDefaultModel,
    isProviderAvailable,
    getProviderConfig,
    getProviderNames,
    healthCheck
};
