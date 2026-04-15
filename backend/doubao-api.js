const fetch = require('node-fetch');

/**
 * 豆包 API 封装类
 * 文档: https://www.volcengine.com/docs/82379/1099475
 */
class DoubaoAPI {
    constructor(apiKey, model) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseURL = 'https://ark.cn-beijing.volces.com/api/v3';
        
        // 请求队列（限制 50次/分钟）
        this.requestQueue = [];
        this.maxRequestsPerMinute = 50;
    }
    
    /**
     * 发送聊天请求
     * @param {Array} messages - 消息数组 [{ role: 'user', content: '...' }]
     * @param {Object} options - 可选参数
     * @returns {Promise<String>} AI 回复内容
     */
    async chat(messages, options = {}) {
        await this.checkRateLimit();
        
        const url = `${this.baseURL}/responses`;
        
        const requestBody = {
            model: this.model,
            input: messages.map(m => ({
                role: m.role,
                content: [{ type: 'input_text', text: m.content }]
            }))
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`豆包API错误: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            
            const data = await response.json();
            
            // 记录请求时间
            this.requestQueue.push(Date.now());
            
            // 解析响应
            if (data.output && data.output.text) {
                return data.output.text;
            }
            if (data.choices && data.choices[0]) {
                return data.choices[0].message.content;
            }
            
            return JSON.stringify(data);
            
        } catch (error) {
            console.error('❌ 豆包API调用失败:', error.message);
            throw error;
        }
    }
    
    /**
     * 流式响应（逐字输出）
     * @param {Array} messages - 消息数组
     * @param {Function} onChunk - 每收到一块数据时的回调
     */
    async chatStream(messages, onChunk) {
        await this.checkRateLimit();
        
        const url = `${this.baseURL}/responses`;
        
        const requestBody = {
            model: this.model,
            input: messages.map(m => ({
                role: m.role,
                content: [{ type: 'input_text', text: m.content }]
            })),
            stream: true
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`豆包API错误: ${response.status}`);
            }
            
            // 处理流式响应
            const reader = response.body;
            let buffer = '';
            
            reader.on('data', chunk => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop(); // 保留最后一行（可能不完整）
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') return;
                        
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0].delta.content;
                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            });
            
            this.requestQueue.push(Date.now());
            
        } catch (error) {
            console.error('❌ 豆包流式API调用失败:', error.message);
            throw error;
        }
    }
    
    /**
     * 检查请求频率限制
     * 豆包免费版限制: 50次/分钟
     */
    async checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // 清理1分钟前的请求记录
        this.requestQueue = this.requestQueue.filter(time => time > oneMinuteAgo);
        
        // 如果超过限制，等待
        if (this.requestQueue.length >= this.maxRequestsPerMinute) {
            const oldestRequest = this.requestQueue[0];
            const waitTime = 60000 - (now - oldestRequest);
            
            console.log(`⏳ 达到频率限制，等待 ${Math.ceil(waitTime / 1000)} 秒...`);
            await this.sleep(waitTime);
        }
    }
    
    /**
     * 解析用户需求
     * @param {String} userInput - 用户输入
     * @returns {Promise<Object>} 结构化需求
     */
    async parseUserIntent(userInput) {
        const messages = [
            {
                role: 'system',
                content: '你是一个旅行需求分析助手。从用户输入中提取目的地、天数、预算、同伴类型、关键词。以JSON格式返回，不要包含其他文字。'
            },
            {
                role: 'user',
                content: `分析这段旅行需求：${userInput}\n\n返回格式：\n{"destination":"目的地","days":天数,"budget":预算(数字),"companions":"同伴类型","keywords":["关键词1","关键词2"]}`
            }
        ];
        
        try {
            const result = await this.chat(messages);
            
            // 提取 JSON（可能包含 markdown 代码块）
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('无法解析JSON格式');
            }
            
            return JSON.parse(jsonMatch[0]);
            
        } catch (error) {
            console.error('❌ 解析用户需求失败:', error.message);
            
            // 返回默认值
            return {
                destination: userInput.match(/去|到|想去|前往/)?.[0] || '未知目的地',
                days: 5,
                budget: 10000,
                companions: 'unknown',
                keywords: []
            };
        }
    }
    
    /**
     * 生成旅行方案
     * @param {Object} profile - 用户需求
     * @param {Object} searchData - 搜索数据
     * @returns {Promise<String>} 完整的旅行方案
     */
    async generateTravelPlan(profile, searchData) {
        const { destination, days, budget, companions, keywords } = profile;
        const { hotels, restaurants, attractions } = searchData;
        
        const companionText = {
            'couple': '情侣/蜜月',
            'parents': '陪同长辈',
            'family': '家庭亲子',
            'solo': '独自旅行',
            'friends': '朋友结伴'
        }[companions] || '旅行者';
        
        const prompt = `
你是专业的旅行规划师。请根据以下信息，生成一份详细的 ${days} 天 ${destination} 旅行方案。

**用户信息：**
- 目的地：${destination}
- 天数：${days}天
- 预算：¥${budget}/人
- 同伴：${companionText}
- 偏好：${keywords.join('、') || '无特殊偏好'}

**搜索到的真实资源：**

酒店推荐（${hotels.length}家）：
${hotels.slice(0, 5).map((h, i) => `${i + 1}. ${h.name}：¥${h.price || '价格待询'}/晚，评分${h.rating || '暂无评分'}
   简介：${h.snippet}`).join('\n')}

餐厅推荐（${restaurants.length}家）：
${restaurants.slice(0, 8).map((r, i) => `${i + 1}. ${r.name}：人均¥${r.avgPrice || '价格待询'}，${r.cuisine || '特色美食'}
   介绍：${r.snippet}`).join('\n')}

景点推荐（${attractions.length}个）：
${attractions.slice(0, 10).map((a, i) => `${i + 1}. ${a.name}：门票¥${a.ticketPrice || '免费'}，${a.duration || '建议游玩2小时'}
   亮点：${a.snippet}`).join('\n')}

**要求：**
1. 生成每日详细行程，包含：
   - 上午、下午、晚上的具体活动
   - 每个项目的时间安排和预计费用
   - 交通方式和路线建议
   
2. 推荐最合适的酒店（根据预算和同伴类型）

3. 计算准确的总预算明细：
   - 往返机票（估算）
   - 住宿费用（${days - 1}晚）
   - 餐饮费用（${days}天，早中晚餐）
   - 景点门票和活动
   - 市内交通
   - 购物和其他

4. 提供实用贴士：
   - 签证办理
   - 最佳旅行时间
   - 货币兑换
   - 语言沟通
   - 安全注意事项
   - 预订建议

5. 以 **Markdown 格式** 输出，使用清晰的标题和列表，方便阅读。

请开始生成方案：
        `;
        
        const messages = [
            { role: 'system', content: '你是专业的旅行规划师，擅长根据用户需求和真实数据生成详细的旅行方案。' },
            { role: 'user', content: prompt }
        ];
        
        try {
            const plan = await this.chat(messages, { maxTokens: 6000 });
            return plan;
        } catch (error) {
            console.error('❌ 生成旅行方案失败:', error.message);
            throw error;
        }
    }
    
    /**
     * 直接生成旅行方案（不依赖外部搜索）
     * @param {String} userInput - 用户原始输入
     * @param {Object} profile - 用户需求
     * @returns {Promise<String>} 完整的旅行方案
     */
    async generateTravelPlanDirect(userInput, profile) {
        const { destination, days, budget, companions, keywords } = profile;
        
        const companionText = {
            'couple': '情侣/蜜月',
            'parents': '陪同长辈',
            'family': '家庭亲子',
            'solo': '独自旅行',
            'friends': '朋友结伴'
        }[companions] || '旅行者';
        
        const prompt = `
你是专业的旅行规划师。请根据用户需求，生成一份**格式精美、结构清晰**的 ${days} 天 ${destination} 旅行方案。

**用户需求：**
${userInput}

**解析信息：**
- 目的地：${destination}
- 天数：${days}天
- 预算：¥${budget}/人
- 同伴：${companionText}
- 偏好：${keywords.join('、') || '无特殊偏好'}

**格式要求（严格遵守）：**

## 📅 每日详细行程

每天按照以下格式输出：

### 📍 第X天：标题

**上午 (8:00-12:00)**
- 8:00 酒店早餐
- 9:00 前往XXX景点（地址：XX路XX号）
  - 门票：¥XXX/人
  - 游玩时间：Xh
  - 交通：打车约¥XX

**下午 (12:00-18:00)**
- ...

**晚上 (18:00-22:00)**
- ...

## 🏨 酒店推荐

以**表格形式**展示，必须包含以下列：

| 酒店名称 | 价格/晚 | 位置 | 特色 | 推荐理由 |
|---|---|---|---|---|
| XXX酒店 | ¥XXX | XX区 | 五星级/设计感/温泉 | 适合蜜月/地理位置优越/... |

## 🍽️ 美食推荐

以**表格形式**展示：

| 餐厅名称 | 人均消费 | 特色菜品 | 营业时间 | 推荐理由 |
|---|---|---|---|---|
| XXX餐厅 | ¥XXX | XX菜系/必点XXX | 10:00-22:00 | 本地人气/米其林推荐/... |

## 🎯 景点推荐

### ⭐ 必游景点

| 景点名称 | 门票价格 | 游玩时长 | 最佳时间 | 亮点 |
|---|---|---|---|---|
| XXX | ¥XXX | Xh | 上午/下午/傍晚 | 打卡圣地/自然奇观/... |

### 👍 小众景点

| 景点名称 | 门票价格 | 游玩时长 | 最佳时间 | 亮点 |
|---|---|---|---|---|
| XXX | ¥XXX | Xh | 上午/下午 | 人少景美/当地特色/... |

## 💰 预算明细

以**表格形式**展示：

| 项目 | 金额 | 说明 |
|---|---|---|
| 往返机票 | ¥XXX | XX航空，提前预订 |
| 住宿费用 | ¥XXX | ${days - 1}晚，平均¥XXX/晚 |
| 餐饮费用 | ¥XXX | ${days}天，早中晚餐 |
| 景点门票 | ¥XXX | 主要景点门票 |
| 市内交通 | ¥XXX | 打车+公交+地铁 |
| 购物娱乐 | ¥XXX | 预留费用 |
| **总计** | **¥XXX** | **人均预算** |

## 💡 实用贴士

- 📋 **签证办理**：XXX
- 🌤️ **最佳时间**：XXX
- 💱 **货币兑换**：XXX
- 🗣️ **语言沟通**：XXX
- ⚠️ **注意事项**：XXX

## 📝 预订建议

1. 提前XX天预订机票，节省约¥XXX
2. 酒店推荐XXX平台，价格更优惠
3. ...

请严格按照以上格式输出，使用Markdown表格，确保所有数字都是合理估算值。
        `;
        
        const messages = [
            { 
                role: 'system', 
                content: '你是专业的旅行规划师，擅长根据用户需求生成详细、实用、有创意的旅行方案。你了解全球各地的旅游信息，能提供准确的价格参考、景点推荐和实用建议。'
            },
            { role: 'user', content: prompt }
        ];
        
        try {
            const plan = await this.chat(messages, { maxTokens: 8000 });
            return plan;
        } catch (error) {
            console.error('❌ 生成旅行方案失败:', error.message);
            throw error;
        }
    }
    
    /**
     * 辅助函数：延迟
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = DoubaoAPI;
