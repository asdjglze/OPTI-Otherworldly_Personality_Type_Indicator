const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function buildApiUrl(baseUrl) {
    if (!baseUrl) return '';
    const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return url.endsWith('/chat/completions') ? url : `${url}/chat/completions`;
}

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
            { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro（推荐）', description: '专业版，更强推理能力' },
            { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', description: '极速响应，深度思考模式' }
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

function getBaseUrl(provider) {
    const config = MODEL_CONFIG[provider];
    if (!config) return '';
    return config.apiUrl.replace('/chat/completions', '');
}

function getApiKey(provider) {
    const config = MODEL_CONFIG[provider];
    return config ? config.apiKey : '';
}

function getDefaultModel(provider) {
    const config = MODEL_CONFIG[provider];
    if (!config || !config.models || config.models.length === 0) return '';
    return config.models[0].id;
}

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

function getSystemDefaultModel() {
    if (MODEL_CONFIG.glm.apiKey) {
        return { provider: 'glm', model: 'glm-5.1' };
    }
    if (MODEL_CONFIG.deepseek.apiKey) {
        return { provider: 'deepseek', model: 'deepseek-v4-pro' };
    }
    if (MODEL_CONFIG.qwen.apiKey) {
        return { provider: 'qwen', model: 'qwen3-max' };
    }
    if (MODEL_CONFIG.volcano.apiKey) {
        return { provider: 'volcano', model: 'doubao-seed-2-0-pro-260215' };
    }
    return { provider: 'glm', model: 'glm-5.1' };
}

function isProviderAvailable(provider) {
    const config = MODEL_CONFIG[provider];
    return config && !!config.apiKey;
}

function getProviderConfig(provider) {
    return MODEL_CONFIG[provider] || null;
}

function getProviderNames() {
    return Object.keys(MODEL_CONFIG);
}

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