const axios = require('axios');

/**
 * 图片搜索服务 - 获取真实图片
 * 使用百度图片搜索（无需API Key）
 */
class ImageSearchAPI {
    constructor() {
        this.cache = new Map(); // 缓存图片URL
    }
    
    /**
     * 从百度图片搜索获取图片URL
     * @param {String} keyword - 搜索关键词
     * @param {Number} count - 返回数量
     * @returns {Promise<Array>} 图片URL数组
     */
    async searchBaiduImages(keyword, count = 1) {
        // 检查缓存
        const cacheKey = `${keyword}_${count}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const url = 'https://image.baidu.com/search/acjson';
            const params = {
                tn: 'resultjson_com',
                word: keyword,
                pn: 0,
                rn: count,
                ie: 'utf-8'
            };
            
            const response = await axios.get(url, { 
                params,
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const images = [];
            if (response.data && response.data.data) {
                for (const item of response.data.data) {
                    if (item.thumbURL) {
                        images.push(item.thumbURL);
                    }
                    if (images.length >= count) break;
                }
            }
            
            // 缓存结果
            if (images.length > 0) {
                this.cache.set(cacheKey, images);
            }
            
            return images;
            
        } catch (error) {
            console.error(`❌ 百度图片搜索失败 (${keyword}):`, error.message);
            return [];
        }
    }
    
    /**
     * 获取景点图片
     * @param {String} name - 景点名称
     * @param {String} city - 城市名称
     * @returns {Promise<String>} 图片URL
     */
    async getAttractionImage(name, city = '') {
        const keyword = city ? `${city} ${name} 景点` : `${name} 景点`;
        const images = await this.searchBaiduImages(keyword, 1);
        return images[0] || this.getFallbackImage(name, 'attraction');
    }
    
    /**
     * 获取美食图片
     * @param {String} name - 餐厅或美食名称
     * @param {String} city - 城市名称
     * @returns {Promise<String>} 图片URL
     */
    async getFoodImage(name, city = '') {
        const keyword = city ? `${city} ${name} 美食` : `${name} 美食`;
        const images = await this.searchBaiduImages(keyword, 1);
        return images[0] || this.getFallbackImage(name, 'food');
    }
    
    /**
     * 获取酒店图片
     * @param {String} name - 酒店名称
     * @param {String} city - 城市名称
     * @returns {Promise<String>} 图片URL
     */
    async getHotelImage(name, city = '') {
        const keyword = city ? `${city} ${name} 酒店` : `${name} 酒店`;
        const images = await this.searchBaiduImages(keyword, 1);
        return images[0] || this.getFallbackImage(name, 'hotel');
    }
    
    /**
     * 批量获取图片
     * @param {Array} items - 项目数组 [{name, type, city}]
     * @returns {Promise<Array>} 附带图片URL的数组
     */
    async batchGetImages(items) {
        const results = await Promise.all(
            items.map(async (item) => {
                let imageUrl = '';
                
                if (item.type === 'attraction') {
                    imageUrl = await this.getAttractionImage(item.name, item.city);
                } else if (item.type === 'food') {
                    imageUrl = await this.getFoodImage(item.name, item.city);
                } else if (item.type === 'hotel') {
                    imageUrl = await this.getHotelImage(item.name, item.city);
                }
                
                return {
                    ...item,
                    imageUrl
                };
            })
        );
        
        return results;
    }
    
    /**
     * 生成备用SVG图片
     * @param {String} name - 名称
     * @param {String} type - 类型
     * @returns {String} Data URL
     */
    getFallbackImage(name, type) {
        let color1 = '', color2 = '', icon = '';
        
        if (type === 'attraction') {
            color1 = '#2D7A89';
            color2 = '#45A4B8';
            icon = '🎯';
        } else if (type === 'food') {
            color1 = '#FF9B71';
            color2 = '#FFB592';
            icon = '🍽️';
        } else if (type === 'hotel') {
            color1 = '#5C9EAD';
            color2 = '#7DB9C8';
            icon = '🏨';
        }
        
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const angle = hash % 360;
        
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
            <defs>
                <linearGradient id="grad${hash}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})">
                    <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect fill="url(#grad${hash})" width="800" height="500"/>
            <text fill="white" font-size="80" font-weight="300" x="50%" y="40%" text-anchor="middle" dy=".3em">${icon}</text>
            <text fill="white" font-size="28" font-weight="400" x="50%" y="60%" text-anchor="middle" dy=".3em" opacity="0.95">${name}</text>
        </svg>`;
        
        return 'data:image/svg+xml,' + encodeURIComponent(svg);
    }
}

module.exports = ImageSearchAPI;
