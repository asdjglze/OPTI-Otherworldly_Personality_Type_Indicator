// 版本号: v1.0.0
/**
 * 原神版MBTI - 术语渲染器
 * 
 * 功能: 将MBTI术语替换为原神元素反应术语
 * 用途: 在结果页面展示时进行文本替换，不修改原始数据
 */

const TermRenderer = {
    /**
     * MBTI维度元素对应
     */
    dimensionElements: {
        'E': '风',
        'I': '水',
        'S': '火',
        'N': '岩',
        'T': '雷',
        'F': '草',
        'J': '冰',
        'P': '原'
    },

    /**
     * 元素名称到代码的映射
     */
    elementNameToCode: {
        '风': 'anemo',
        '水': 'hydro',
        '火': 'pyro',
        '岩': 'geo',
        '雷': 'electro',
        '草': 'dendro',
        '冰': 'cryo',
        '原': 'physical'
    },

    /**
     * 认知功能 → 元素反应 映射
     */
    cognitiveFunctionReactions: {
        'Te': '超导',
        'Ti': '感电',
        'Fe': '扩散',
        'Fi': '绽放',
        'Ne': '激化',
        'Ni': '结晶',
        'Se': '燃烧',
        'Si': '蒸发'
    },

    /**
     * 认知功能 → 元素代码 映射
     */
    cognitiveFunctionElements: {
        'Ne': 'anemo',
        'Ni': 'hydro',
        'Se': 'pyro',
        'Si': 'geo',
        'Te': 'cryo',
        'Ti': 'electro',
        'Fe': 'dendro',
        'Fi': 'physical'
    },

    /**
     * MBTI类型 → 元素组合 映射
     * 将每个字母替换为对应元素
     */
    typeToElements: {
        'INTJ': '水岩雷冰',
        'INTP': '水岩雷原',
        'ENTJ': '风岩雷冰',
        'ENTP': '风岩雷原',
        'INFJ': '水岩草冰',
        'INFP': '水岩草原',
        'ENFJ': '风岩草冰',
        'ENFP': '风岩草原',
        'ISTJ': '水火雷冰',
        'ISFJ': '水火草冰',
        'ESTJ': '风火雷冰',
        'ESFJ': '风火草冰',
        'ISTP': '水火雷原',
        'ISFP': '水火草原',
        'ESTP': '风火雷原',
        'ESFP': '风火草原'
    },

    /**
     * 类型组合映射
     */
    typeGroupMappings: {
        'NT': '岩雷',
        'NF': '岩草',
        'SJ': '火冰',
        'SP': '火原'
    },

    /**
     * 替换单个维度字母
     * 规则：
     * 1. 字母前后均没有其他英文字母时，替换为对应元素
     * 2. 字母前后有英文字母时，检查是否为MBTI类型/认知功能/类型组合
     * 3. 如果都不是MBTI体系术语，不替换
     * 
     * @param {string} text - 原始文本
     * @returns {string} 替换后的文本
     */
    replaceIdentifiers: function(text) {
        let result = text;
        
        // 保护"MBTI"这个词，避免被拆分替换
        result = result.replace(/\bMBTI\b/g, '___MBTI_PLACEHOLDER___');
        
        // 定义所有MBTI相关的字母组合
        const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                          'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
        const cognitiveFuncs = ['Te', 'Ti', 'Fe', 'Fi', 'Ne', 'Ni', 'Se', 'Si'];
        const typeGroups = ['NT', 'NF', 'SJ', 'SP'];
        
        // 对每个维度字母进行处理
        const dimensionLetters = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
        
        dimensionLetters.forEach(letter => {
            // 正则匹配：字母前后没有其他英文字母的情况
            // 使用负向前瞻和负向后顾来确保字母独立
            const pattern = new RegExp(`(?<![a-zA-Z])${letter}(?![a-zA-Z])`, 'g');
            
            result = result.replace(pattern, (match, offset, fullText) => {
                // 检查是否在MBTI类型中
                for (const type of mbtiTypes) {
                    const typePattern = new RegExp(`\\b${type}\\b`, 'g');
                    let typeMatch;
                    while ((typeMatch = typePattern.exec(fullText)) !== null) {
                        if (offset >= typeMatch.index && offset < typeMatch.index + type.length) {
                            return match; // 在MBTI类型中，不替换
                        }
                    }
                }
                
                // 检查是否在认知功能中
                for (const func of cognitiveFuncs) {
                    const funcPattern = new RegExp(`\\b${func}\\b`, 'g');
                    let funcMatch;
                    while ((funcMatch = funcPattern.exec(fullText)) !== null) {
                        if (offset >= funcMatch.index && offset < funcMatch.index + func.length) {
                            return match; // 在认知功能中，不替换
                        }
                    }
                }
                
                // 检查是否在类型组合中
                for (const group of typeGroups) {
                    const groupPattern = new RegExp(`\\b${group}\\b`, 'g');
                    let groupMatch;
                    while ((groupMatch = groupPattern.exec(fullText)) !== null) {
                        if (offset >= groupMatch.index && offset < groupMatch.index + group.length) {
                            return match; // 在类型组合中，不替换
                        }
                    }
                }
                
                // 独立的字母，替换为对应元素
                return this.dimensionElements[letter] || match;
            });
        });
        
        // 恢复"MBTI"占位符
        result = result.replace(/___MBTI_PLACEHOLDER___/g, 'MBTI');
        
        return result;
    },

    /**
     * MBTI类型到角色ID的映射（硬编码）
     */
    characterMapping: {
        'INTJ': { primary_male: 'character_080', primary_female: 'character_103' },
        'INTP': { primary_male: 'character_016', primary_female: 'character_014' },
        'ENTJ': { primary_male: 'character_087', primary_female: 'character_099' },
        'ENTP': { primary_male: 'character_075', primary_female: 'character_092' },
        'INFJ': { primary_male: 'character_042', primary_female: 'character_105' },
        'INFP': { primary_male: 'character_022', primary_female: 'character_110' },
        'ENFJ': { primary_male: 'character_023', primary_female: 'character_057' },
        'ENFP': { primary_male: 'character_008', primary_female: 'character_009' },
        'ISTJ': { primary_male: 'character_033', primary_female: 'character_031' },
        'ISFJ': { primary_male: 'character_024', primary_female: 'character_095' },
        'ESTJ': { primary_male: 'character_081', primary_female: 'character_030' },
        'ESFJ': { primary_male: 'character_032', primary_female: 'character_065' },
        'ISTP': { primary_male: 'character_029', primary_female: 'character_001' },
        'ISFP': { primary_male: 'character_048', primary_female: 'character_100' },
        'ESTP': { primary_male: 'character_054', primary_female: 'character_068' },
        'ESFP': { primary_male: 'character_055', primary_female: 'character_074' }
    },

    /**
     * 角色ID到名称的映射（硬编码）
     */
    charactersData: {
        'character_001': { name: '琴' },
        'character_008': { name: '温迪' },
        'character_009': { name: '可莉' },
        'character_014': { name: '莫娜' },
        'character_016': { name: '阿贝多' },
        'character_022': { name: '杜林' },
        'character_023': { name: '法尔伽' },
        'character_024': { name: '魈' },
        'character_029': { name: '重云' },
        'character_030': { name: '刻晴' },
        'character_031': { name: '七七' },
        'character_032': { name: '达达利亚' },
        'character_033': { name: '钟离' },
        'character_042': { name: '白术' },
        'character_048': { name: '枫原万叶' },
        'character_054': { name: '托马' },
        'character_055': { name: '荒泷一斗' },
        'character_057': { name: '八重神子' },
        'character_065': { name: '多莉' },
        'character_068': { name: '妮露' },
        'character_074': { name: '迪希雅' },
        'character_075': { name: '卡维' },
        'character_080': { name: '那维莱特' },
        'character_081': { name: '莱欧斯利' },
        'character_087': { name: '阿蕾奇诺' },
        'character_092': { name: '玛拉妮' },
        'character_095': { name: '希诺宁' },
        'character_099': { name: '玛薇卡' },
        'character_100': { name: '瓦雷莎' },
        'character_103': { name: '丝柯克' },
        'character_105': { name: '菈乌玛' },
        'character_110': { name: '哥伦比娅' }
    },

    /**
     * 设置角色映射数据（保留兼容性，但不再需要外部调用）
     * 
     * @param {Object} mapping - MBTI角色映射数据
     * @param {Object} characters - 角色详细数据
     */
    setCharacterData: function(mapping, characters) {
        if (mapping) this.characterMapping = mapping;
        if (characters) this.charactersData = characters;
    },

    /**
     * 获取MBTI类型对应的角色名称
     * 
     * @param {string} mbtiType - MBTI类型
     * @returns {Object} { male: 男性角色名, female: 女性角色名 }
     */
    getCharacterNames: function(mbtiType) {
        const result = { male: null, female: null };
        
        if (!mbtiType) return result;
        
        const mapping = this.characterMapping[mbtiType];
        if (!mapping) return result;
        
        const maleId = mapping.primary_male;
        const femaleId = mapping.primary_female;
        
        if (maleId && this.charactersData[maleId]) {
            result.male = this.charactersData[maleId].name;
        }
        if (femaleId && this.charactersData[femaleId]) {
            result.female = this.charactersData[femaleId].name;
        }
        
        return result;
    },

    /**
     * 渲染简单Markdown格式
     * 支持: **text** → <strong>text</strong>
     * 
     * @param {string} text - 包含Markdown格式的文本
     * @returns {string} 转换后的HTML字符串
     */
    renderMarkdown: function(text) {
        if (typeof text !== 'string') {
            return text;
        }

        let result = text;

        result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        result = result.replace(/\n/g, '<br>');

        return result;
    },

    /**
     * 渲染文本 - 主入口函数
     * 
     * @param {string} text - 原始文本
     * @returns {string} 替换后的文本
     */
    render: function(text) {
        if (typeof text !== 'string') {
            return text;
        }

        let result = text;

        // 首先替换 MBTI 为原神元素反应，避免后续 ti 被错误替换
        result = result.replace(/\bMBTI\b/g, '原神元素反应');

        // 保护霍兰德代码（R/I/A/S/E/C），避免被MBTI替换
        // 霍兰德代码格式：艺术型（A）、研究型（I）等
        const hollandCodePattern = /([（(]\s*)(R|I|A|S|E|C)(\s*[）)])/g;
        const hollandPlaceholders = [];
        let hollandIndex = 0;
        
        result = result.replace(hollandCodePattern, (match, prefix, code, suffix) => {
            // 使用纯数字占位符，避免字母被错误替换
            const placeholder = `__HLD_${hollandIndex}__`;
            hollandPlaceholders.push({ placeholder, match });
            hollandIndex++;
            return placeholder;
        });

        result = this.replaceMBTITypes(result);

        result = this.replaceCognitiveFunctions(result);

        result = this.replaceAxisCombinations(result);

        result = this.replaceIdentifiers(result);

        result = this.addElementCharacterNames(result);

        // 恢复霍兰德代码
        hollandPlaceholders.forEach(item => {
            result = result.replace(item.placeholder, item.match);
        });

        return result;
    },

    /**
     * 替换MBTI类型名称
     * 
     * @param {string} text - 原始文本
     * @returns {string} 替换后的文本
     */
    replaceMBTITypes: function(text) {
        let result = text;
        const typePattern = /\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/g;
        
        result = result.replace(typePattern, (match) => {
            return this.typeToElements[match] || match;
        });

        return result;
    },

    /**
     * 为元素组合添加角色名称（如果后面没有括号）
     * 
     * @param {string} text - 文本
     * @returns {string} 处理后的文本
     */
    addElementCharacterNames: function(text) {
        let result = text;
        
        const elementPatterns = Object.values(this.typeToElements);
        
        for (const elements of elementPatterns) {
            const escapedElements = elements.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp(escapedElements, 'g');
            
            result = result.replace(pattern, (match, offset, fullText) => {
                if (this.isInsideParentheses(fullText, offset)) {
                    return match;
                }
                
                const afterMatch = fullText.substring(offset + match.length);
                if (/^[（(]/.test(afterMatch)) {
                    return match;
                }
                
                const mbtiType = this.getElementToType(match);
                if (!mbtiType) return match;
                
                const names = this.getCharacterNames(mbtiType);
                if (names.male && names.female) {
                    return `${match}（${names.male}/${names.female}）`;
                } else if (names.male || names.female) {
                    return `${match}（${names.male || names.female}）`;
                }
                
                return match;
            });
        }
        
        return result;
    },

    /**
     * 检查指定位置是否在括号内
     * 
     * @param {string} text - 完整文本
     * @param {number} position - 要检查的位置
     * @returns {boolean} 是否在括号内
     */
    isInsideParentheses: function(text, position) {
        let depth = 0;
        
        for (let i = position - 1; i >= 0; i--) {
            const char = text[i];
            
            if (char === '）' || char === ')') {
                depth++;
            } else if (char === '（' || char === '(') {
                if (depth > 0) {
                    depth--;
                } else {
                    return true;
                }
            }
        }
        
        return false;
    },

    /**
     * 根据元素组合反查MBTI类型
     * 
     * @param {string} elements - 元素组合（如 水岩雷冰）
     * @returns {string} MBTI类型
     */
    getElementToType: function(elements) {
        for (const [type, el] of Object.entries(this.typeToElements)) {
            if (el === elements) {
                return type;
            }
        }
        return null;
    },

    /**
     * 替换认知功能缩写
     * 
     * @param {string} text - 原始文本
     * @returns {string} 替换后的文本
     */
    replaceCognitiveFunctions: function(text) {
        let result = text;

        const funcPatternWithParen = /\b(Te|Ti|Fe|Fi|Ne|Ni|Se|Si)\s*[（(]\s*([^）)]+)\s*[）)]/g;
        result = result.replace(funcPatternWithParen, (match, func, desc) => {
            const reaction = this.cognitiveFunctionReactions[func];
            if (reaction) {
                return `${reaction}（${desc}）`;
            }
            return match;
        });

        const funcPattern = /\b(Te|Ti|Fe|Fi|Ne|Ni|Se|Si)\b/g;
        result = result.replace(funcPattern, (match) => {
            return this.cognitiveFunctionReactions[match] || match;
        });

        return result;
    },

    /**
     * 替换功能轴组合
     * 
     * @param {string} text - 原始文本
     * @returns {string} 替换后的文本
     */
    replaceAxisCombinations: function(text) {
        let result = text;

        const funcs = Object.keys(this.cognitiveFunctionReactions);
        for (let i = 0; i < funcs.length; i++) {
            for (let j = i + 1; j < funcs.length; j++) {
                if (i === j) continue;
                const axis = `${funcs[i]}-${funcs[j]}`;
                const reaction1 = this.cognitiveFunctionReactions[funcs[i]];
                const reaction2 = this.cognitiveFunctionReactions[funcs[j]];
                const replacement = `${reaction1}-${reaction2}`;
                
                const patterns = [
                    new RegExp(axis.replace('-', '\\s*[-—]\\s*'), 'g'),
                    new RegExp(axis.replace('-', '\\s*轴\\s*[-—]?\\s*'), 'g'),
                    new RegExp(axis.replace('-', '\\s*[-—]\\s*轴\\s*'), 'g')
                ];
                
                for (const pattern of patterns) {
                    result = result.replace(pattern, replacement + '轴');
                }

                const simplePattern = new RegExp(axis.replace('-', '\\s*[-—]\\s*'), 'g');
                result = result.replace(simplePattern, replacement);
            }
        }

        return result;
    },

    /**
     * 渲染对象 - 递归处理对象中的所有字符串
     * 
     * @param {any} obj - 原始对象
     * @returns {any} 替换后的对象
     */
    renderObject: function(obj) {
        if (typeof obj === 'string') {
            return this.render(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.renderObject(item));
        }

        if (obj !== null && typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.renderObject(value);
            }
            return result;
        }

        return obj;
    },

    /**
     * 获取认知功能对应的元素反应名称
     * 
     * @param {string} func - 认知功能代码 (Te, Ti, Fe, Fi, Ne, Ni, Se, Si)
     * @returns {string} 对应的元素反应名称
     */
    getReaction: function(func) {
        return this.cognitiveFunctionReactions[func] || func;
    },

    /**
     * 获取MBTI类型对应的元素组合
     * 
     * @param {string} type - MBTI类型 (如 INTJ)
     * @returns {string} 对应的元素组合 (如 水岩雷冰)
     */
    getElements: function(type) {
        return this.typeToElements[type] || type;
    },

    /**
     * 获取MBTI类型对应的元素代码数组
     * 
     * @param {string} type - MBTI类型 (如 INTJ)
     * @returns {Array} 对应的元素代码数组 (如 ['hydro', 'geo', 'electro', 'cryo'])
     */
    getElementCodes: function(type) {
        const elements = this.typeToElements[type];
        if (!elements) return [];
        
        const codes = [];
        for (let i = 0; i < elements.length; i += 1) {
            const char = elements[i];
            const code = this.elementNameToCode[char];
            if (code) {
                codes.push(code);
            }
        }
        return codes;
    },

    /**
     * 获取维度对应的元素名称
     * 
     * @param {string} dimension - 维度字母 (E, I, S, N, T, F, J, P)
     * @returns {string} 对应的元素名称
     */
    getElementName: function(dimension) {
        return this.dimensionElements[dimension] || dimension;
    },

    /**
     * 获取维度对应的元素代码
     * 
     * @param {string} dimension - 维度字母 (E, I, S, N, T, F, J, P)
     * @returns {string} 对应的元素代码 (如 'anemo')
     */
    getElementCode: function(dimension) {
        const elementName = this.dimensionElements[dimension];
        return this.elementNameToCode[elementName] || null;
    },

    /**
     * 获取维度配置数组（用于问题页面等）
     * 
     * @returns {Array} 维度配置数组
     */
    getDimensionConfig: function() {
        return [
            {
                key: 'EI',
                left: 'E',
                right: 'I',
                leftElement: this.getElementCode('E'),
                rightElement: this.getElementCode('I')
            },
            {
                key: 'SN',
                left: 'S',
                right: 'N',
                leftElement: this.getElementCode('S'),
                rightElement: this.getElementCode('N')
            },
            {
                key: 'TF',
                left: 'T',
                right: 'F',
                leftElement: this.getElementCode('T'),
                rightElement: this.getElementCode('F')
            },
            {
                key: 'JP',
                left: 'J',
                right: 'P',
                leftElement: this.getElementCode('J'),
                rightElement: this.getElementCode('P')
            }
        ];
    },

    /**
     * 获取元素代码到名称的映射对象
     * 
     * @returns {Object} 元素代码到名称的映射
     */
    getCodeToNameMap: function() {
        return {
            anemo: '风',
            hydro: '水',
            pyro: '火',
            geo: '岩',
            electro: '雷',
            dendro: '草',
            cryo: '冰',
            physical: '原'
        };
    },

    /**
     * 获取元素名称到代码的映射对象
     * 
     * @returns {Object} 元素名称到代码的映射
     */
    getNameToCodeMap: function() {
        return { ...this.elementNameToCode };
    },

    /**
     * 获取认知功能对应的元素代码
     * 
     * @param {string} func - 认知功能代码 (Te, Ti, Fe, Fi, Ne, Ni, Se, Si)
     * @returns {string} 元素代码
     */
    getCognitiveFunctionElement: function(func) {
        return this.cognitiveFunctionElements[func] || 'physical';
    },

    /**
     * 获取认知功能信息
     * 
     * @param {string} func - 认知功能代码
     * @returns {Object} { element, name, reaction }
     */
    getCognitiveFunctionInfo: function(func) {
        const elementCode = this.getCognitiveFunctionElement(func);
        const codeToName = this.getCodeToNameMap();
        return {
            element: elementCode,
            name: codeToName[elementCode] + '元素',
            reaction: this.cognitiveFunctionReactions[func] || '未知'
        };
    },

    /**
     * 渲染HTML内容 - 处理DOM元素中的文本
     * 
     * @param {HTMLElement} element - DOM元素
     */
    renderElement: function(element) {
        if (!element) return;

        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue && node.nodeValue.trim()) {
                node.nodeValue = this.render(node.nodeValue);
            }
        }
    },

    /**
     * 渲染结果数据 - 用于结果页面的数据渲染
     * 
     * @param {Object} result - 测试结果对象
     * @returns {Object} 渲染后的结果对象
     */
    renderResult: function(result) {
        if (!result) return result;

        const renderedResult = JSON.parse(JSON.stringify(result));

        if (renderedResult.type) {
            renderedResult.typeDisplay = this.getElements(renderedResult.type);
        }

        if (renderedResult.functionStack) {
            renderedResult.functionStackDisplay = {
                dominant: this.getReaction(renderedResult.functionStack.dominant),
                auxiliary: this.getReaction(renderedResult.functionStack.auxiliary),
                tertiary: this.getReaction(renderedResult.functionStack.tertiary),
                inferior: this.getReaction(renderedResult.functionStack.inferior)
            };
        }

        if (renderedResult.description) {
            renderedResult.description = this.render(renderedResult.description);
        }

        return renderedResult;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TermRenderer;
}
