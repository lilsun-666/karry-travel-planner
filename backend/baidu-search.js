const fetch = require('node-fetch');

/**
 * 百度搜索 API 封装类
 * 文档: https://ai.baidu.com/ai-doc/SEARCH/Gkxqbbwme
 */
class BaiduSearchAPI {
    constructor(apiKey, secretKey) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.accessToken = null;
        this.tokenExpireTime = 0;
    }
    
    /**
     * 获取 Access Token
     * Access Token 有效期 30 天，自动缓存
     */
    async getAccessToken() {
        const now = Date.now();
        
        // 如果 token 还有效，直接返回
        if (this.accessToken && now < this.tokenExpireTime) {
            return this.accessToken;
        }
        
        try {
            const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`获取百度Token失败: ${data.error_description}`);
            }
            
            this.accessToken = data.access_token;
            this.tokenExpireTime = now + (data.expires_in * 1000) - 60000; // 提前1分钟过期
            
            console.log('✅ 百度 Access Token 获取成功');
            return this.accessToken;
            
        } catch (error) {
            console.error('❌ 获取百度Token失败:', error.message);
            throw error;
        }
    }
    
    /**
     * 网页搜索
     * @param {String} query - 搜索关键词
     * @param {Number} pageSize - 返回结果数量（1-50）
     * @returns {Promise<Array>} 搜索结果数组
     */
    async search(query, pageSize = 10) {
        const token = await this.getAccessToken();
        
        try {
            const url = `https://aip.baidubce.com/rest/2.0/search/v1/web?access_token=${token}&query=${encodeURIComponent(query)}&page_size=${pageSize}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error_code) {
                throw new Error(`百度搜索失败: ${data.error_msg}`);
            }
            
            if (!data.results || data.results.length === 0) {
                console.log(`⚠️ 没有搜索到结果: ${query}`);
                return [];
            }
            
            // 格式化搜索结果
            return data.results.map(item => ({
                title: item.title || '',
                snippet: item.abstract || '',
                url: item.url || '',
                siteName: item.site_name || '',
                publishTime: item.publish_time || ''
            }));
            
        } catch (error) {
            console.error(`❌ 百度搜索失败 [${query}]:`, error.message);
            return [];
        }
    }
    
    /**
     * 针对特定平台搜索
     * @param {String} destination - 目的地
     * @param {String} platform - 平台名称
     */
    async searchPlatform(destination, platform) {
        const platformMap = {
            'xiaohongshu': '小红书',
            'ctrip': '携程',
            'mafengwo': '马蜂窝',
            'dianping': '大众点评',
            'zhihu': '知乎'
        };
        
        const platformName = platformMap[platform] || platform;
        const query = `${destination} 攻略 ${platformName}`;
        
        return await this.search(query);
    }
    
    /**
     * 批量搜索多个关键词
     * @param {Array<String>} queries - 搜索关键词数组
     * @returns {Promise<Array>} 所有搜索结果
     */
    async batchSearch(queries) {
        const results = [];
        
        for (const query of queries) {
            try {
                const data = await this.search(query);
                results.push({
                    query,
                    results: data
                });
                
                // 避免请求过快，延迟 100ms
                await this.sleep(100);
                
            } catch (error) {
                console.error(`❌ 批量搜索失败 [${query}]:`, error.message);
                results.push({
                    query,
                    results: []
                });
            }
        }
        
        return results;
    }
    
    /**
     * 提取酒店信息
     * @param {String} text - 文本内容
     * @param {String} url - 来源URL
     */
    extractHotelInfo(text, url) {
        // 提取酒店名称
        const namePatterns = [
            /【(.+?)】/,
            /《(.+?)》/,
            /(.+?酒店)/,
            /(.+?宾馆)/,
            /(.+?度假村)/
        ];
        
        let name = null;
        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match) {
                name = match[1];
                break;
            }
        }
        
        if (!name) return null;
        
        // 提取价格
        const priceMatch = text.match(/¥(\d+)|(\d+)元/);
        const price = priceMatch ? parseInt(priceMatch[1] || priceMatch[2]) : null;
        
        // 提取评分
        const ratingMatch = text.match(/(\d\.\d)分/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
        
        return {
            name: name.trim(),
            price,
            rating,
            url,
            snippet: text.substring(0, 150)
        };
    }
    
    /**
     * 提取餐厅信息
     */
    extractRestaurantInfo(text, url) {
        const namePatterns = [
            /【(.+?)】/,
            /《(.+?)》/,
            /(.+?餐厅)/,
            /(.+?饭店)/,
            /(.+?食府)/
        ];
        
        let name = null;
        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match) {
                name = match[1];
                break;
            }
        }
        
        if (!name) return null;
        
        // 提取人均价格
        const priceMatch = text.match(/人均[:：]?\s*¥?(\d+)|人均消费\s*(\d+)/);
        const avgPrice = priceMatch ? parseInt(priceMatch[1] || priceMatch[2]) : null;
        
        // 提取菜系
        const cuisineMatch = text.match(/(川菜|粤菜|湘菜|鲁菜|日料|韩餐|西餐|火锅|烧烤|海鲜)/);
        const cuisine = cuisineMatch ? cuisineMatch[1] : null;
        
        return {
            name: name.trim(),
            avgPrice,
            cuisine,
            url,
            snippet: text.substring(0, 150)
        };
    }
    
    /**
     * 提取景点信息
     */
    extractAttractionInfo(text, url) {
        const namePatterns = [
            /【(.+?)】/,
            /《(.+?)》/
        ];
        
        let name = null;
        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match) {
                name = match[1];
                break;
            }
        }
        
        if (!name) {
            // 提取标题中的景点名
            const titleMatch = text.match(/^(.+?)[，,。\s]/);
            if (titleMatch) {
                name = titleMatch[1];
            }
        }
        
        if (!name) return null;
        
        // 提取门票价格
        const priceMatch = text.match(/门票[:：]?\s*¥?(\d+)|(\d+)元/);
        const ticketPrice = priceMatch ? parseInt(priceMatch[1] || priceMatch[2]) : null;
        
        // 提取游玩时长
        const durationMatch = text.match(/(\d+)小时|(\d+)天/);
        const duration = durationMatch ? durationMatch[0] : null;
        
        return {
            name: name.trim(),
            ticketPrice,
            duration,
            url,
            snippet: text.substring(0, 150)
        };
    }
    
    /**
     * 从搜索结果中提取结构化数据
     * @param {Array} searchResults - 批量搜索结果
     */
    extractStructuredData(searchResults) {
        const hotels = [];
        const restaurants = [];
        const attractions = [];
        
        searchResults.forEach(({ query, results }) => {
            results.forEach(item => {
                const text = `${item.title} ${item.snippet}`;
                
                // 根据关键词判断类型
                if (query.includes('酒店') || query.includes('住宿')) {
                    const hotel = this.extractHotelInfo(text, item.url);
                    if (hotel) hotels.push(hotel);
                }
                
                if (query.includes('美食') || query.includes('餐厅')) {
                    const restaurant = this.extractRestaurantInfo(text, item.url);
                    if (restaurant) restaurants.push(restaurant);
                }
                
                if (query.includes('景点') || query.includes('门票')) {
                    const attraction = this.extractAttractionInfo(text, item.url);
                    if (attraction) attractions.push(attraction);
                }
            });
        });
        
        // 去重（基于名称）
        const uniqueHotels = this.deduplicateByName(hotels);
        const uniqueRestaurants = this.deduplicateByName(restaurants);
        const uniqueAttractions = this.deduplicateByName(attractions);
        
        return {
            hotels: uniqueHotels,
            restaurants: uniqueRestaurants,
            attractions: uniqueAttractions
        };
    }
    
    /**
     * 去重
     */
    deduplicateByName(items) {
        const seen = new Set();
        return items.filter(item => {
            if (seen.has(item.name)) {
                return false;
            }
            seen.add(item.name);
            return true;
        });
    }
    
    /**
     * 辅助函数：延迟
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = BaiduSearchAPI;
