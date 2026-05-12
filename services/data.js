// 版本号: v1.0.0
/**
 * 数据服务
 * 
 * 功能: 加载和管理所有需要保护的数据文件
 */

const fs = require('fs');
const path = require('path');

class DataService {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.loadData();
    }
    
    /**
     * 加载所有数据文件
     */
    loadData() {
        try {
            this.characterData = this.loadCharacterData();
            this.mbtiMapping = this.loadJson('mbti_character_mapping.json');
            this.compatibilityPairs = this.loadJson('mbti_compatibility_pairs.json');
            this.cardSummaries = this.loadJson('mbti_card_summaries.json');
            this.elementTemperamentMapping = this.loadJson('element_temperament_mapping.json');
            
            console.log('数据服务加载完成');
        } catch (error) {
            console.error('加载数据文件失败:', error);
        }
    }
    
    /**
     * 加载JSON文件
     * 
     * @param {string} filename - 文件名
     * @returns {Object} JSON数据
     */
    loadJson(filename) {
        const filePath = path.join(this.dataDir, filename);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        return null;
    }
    
    /**
     * 加载角色数据（转换为以id为键的对象）
     * 
     * @returns {Object} 角色数据对象
     */
    loadCharacterData() {
        const filePath = path.join(this.dataDir, 'character_data.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const result = {};
            data.forEach(char => {
                result[char.id] = char;
            });
            return result;
        }
        return {};
    }
    
    /**
     * 获取角色完整信息
     * 
     * @param {string} mbtiType - MBTI类型
     * @param {string} gender - 性别
     * @returns {Object|null} 角色完整信息
     */
    getCharacterFull(mbtiType, gender) {
        if (!this.mbtiMapping || !this.characterData) return null;
        
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return null;
        
        const characterId = mapping[`primary_${gender}`] || 
                           mapping.primary_male || 
                           mapping.primary_female;
        
        if (!characterId) return null;
        
        return this.characterData[characterId] || null;
    }
    
    /**
     * 获取同类型角色列表
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Array} 角色列表
     */
    getCharacterExamples(mbtiType) {
        if (!this.mbtiMapping || !this.characterData) return [];
        
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping || !mapping.group) return [];
        
        const characters = [];
        mapping.group.forEach(characterId => {
            const character = this.characterData[characterId];
            if (character) {
                characters.push({
                    id: characterId,
                    name: character.name,
                    rarity: character.rarity,
                    vision_cn: character.vision_cn,
                    region: character.region,
                    affiliation: character.affiliation,
                    weapon_type: character.weapon_type,
                    birthday: character.birthday,
                    constellation: character.constellation,
                    title: character.title,
                    description: character.description,
                    assets: character.assets
                });
            }
        });
        
        characters.sort((a, b) => {
            const rarityA = a.rarity?.includes('5') ? 5 : 4;
            const rarityB = b.rarity?.includes('5') ? 5 : 4;
            return rarityB - rarityA;
        });
        
        return characters;
    }
    
    /**
     * 获取职业发展信息
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object|null} 职业发展信息
     */
    getCareerInfo(mbtiType) {
        if (!this.mbtiMapping) return null;
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return null;
        return mapping.suitable_careers || null;
    }
    
    /**
     * 获取社交风格信息
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object|null} 社交风格信息
     */
    getSocialStyle(mbtiType) {
        if (!this.mbtiMapping) return null;
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return null;
        return mapping.social_style || null;
    }
    
    /**
     * 获取家庭风格信息
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object|null} 家庭风格信息
     */
    getFamilyStyle(mbtiType) {
        if (!this.mbtiMapping) return null;
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return null;
        return mapping.family_style || null;
    }
    
    /**
     * 获取个人成长信息
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object|null} 个人成长信息
     */
    getPersonalGrowth(mbtiType) {
        if (!this.mbtiMapping) return null;
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return null;
        return mapping.personal_growth || null;
    }
    
    /**
     * 获取认知功能描述
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object|null} 认知功能描述
     */
    getFunctionDescriptions(mbtiType) {
        if (!this.mbtiMapping) return null;
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return null;
        return mapping.function_descriptions || null;
    }
    
    /**
     * 获取配对数据
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Array} 配对数据列表
     */
    getCompatibilityPairs(mbtiType) {
        if (!this.compatibilityPairs || !this.compatibilityPairs.pairs) return [];
        
        const pairs = this.compatibilityPairs.pairs;
        const result = [];
        const seenPairs = new Set();
        
        for (const pair of pairs) {
            if (pair.type_a === mbtiType || pair.type_b === mbtiType) {
                if (!pair.compatibility_level_number || pair.compatibility_level_number === 0) {
                    continue;
                }
                
                const pairKey = [pair.type_a, pair.type_b].sort().join('-');
                if (seenPairs.has(pairKey)) continue;
                seenPairs.add(pairKey);
                
                const isTypeA = pair.type_a === mbtiType;
                result.push({
                    my_type: mbtiType,
                    other_type: isTypeA ? pair.type_b : pair.type_a,
                    is_self_pair: pair.is_self_pair,
                    compatibility_level: pair.compatibility_level,
                    compatibility_level_number: pair.compatibility_level_number,
                    analysis: pair.analysis,
                    advice_for_current: isTypeA ? pair.advice_for_a_to_b : pair.advice_for_b_to_a
                });
            }
        }
        
        return result;
    }
    
    /**
     * 获取气质类型信息
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object|null} 气质类型信息
     */
    getTemperamentInfo(mbtiType) {
        if (!this.elementTemperamentMapping) return null;
        
        const temperamentCode = this.elementTemperamentMapping.type_mapping[mbtiType];
        if (!temperamentCode) return null;
        
        const temperamentInfo = this.elementTemperamentMapping.temperaments[temperamentCode];
        if (!temperamentInfo) return null;
        
        return {
            code: temperamentCode,
            name: temperamentInfo.name,
            element: temperamentInfo.element,
            description: temperamentInfo.description,
            badge_color: temperamentInfo.badge_color
        };
    }
    
    /**
     * 获取分享卡片简介
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {string|null} 分享卡片简介
     */
    getCardSummary(mbtiType) {
        if (!this.cardSummaries || !this.cardSummaries.summaries) return null;
        const summary = this.cardSummaries.summaries[mbtiType];
        return summary?.summary || null;
    }
    
    /**
     * 获取动态描述模板
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {string|null} 动态描述模板
     */
    getDescTemplate(mbtiType) {
        if (!this.mbtiMapping) return null;
        const mapping = this.mbtiMapping[mbtiType];
        if (!mapping) return null;
        return mapping.desc_template || null;
    }
    
    /**
     * 获取MBTI类型标签
     * 
     * @param {string} type - MBTI类型
     * @returns {string} 类型标签
     */
    getTypeLabel(type) {
        const labels = {
            'INTJ': '建筑师', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
            'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
            'ISTJ': '物流师', 'ISFJ': '守卫者', 'ESTJ': '总经理', 'ESFJ': '执政官',
            'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
        };
        return labels[type] || type;
    }
}

module.exports = new DataService();
