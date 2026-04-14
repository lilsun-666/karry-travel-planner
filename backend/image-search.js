/**
 * 图片搜索服务
 * 使用 Unsplash API 获取高质量旅行图片
 */

class ImageSearchAPI {
    constructor() {
        // 使用公共的 Unsplash API（无需密钥，但有限流）
        this.baseURL = 'https://source.unsplash.com';
    }
    
    /**
     * 获取景点图片URL
     * @param {String} keyword - 搜索关键词（景点名称）
     * @param {String} location - 位置（可选）
     * @returns {String} 图片URL
     */
    getAttractionImage(keyword, location = '') {
        const query = location ? `${location} ${keyword}` : keyword;
        const encoded = encodeURIComponent(query);
        // 横向图片，适合景点展示
        return `${this.baseURL}/800x500/?${encoded},travel,landmark`;
    }
    
    /**
     * 获取美食图片URL
     * @param {String} foodName - 美食名称
     * @param {String} cuisine - 菜系（可选）
     * @returns {String} 图片URL
     */
    getFoodImage(foodName, cuisine = '') {
        const query = cuisine ? `${cuisine} ${foodName}` : foodName;
        const encoded = encodeURIComponent(query);
        // 正方形图片，适合美食展示
        return `${this.baseURL}/600x600/?${encoded},food,cuisine`;
    }
    
    /**
     * 获取酒店图片URL
     * @param {String} hotelName - 酒店名称
     * @param {String} location - 位置
     * @returns {String} 图片URL
     */
    getHotelImage(hotelName, location = '') {
        const query = location ? `${location} hotel` : `${hotelName} hotel`;
        const encoded = encodeURIComponent(query);
        return `${this.baseURL}/800x500/?${encoded},hotel,luxury`;
    }
    
    /**
     * 获取城市风景图片URL
     * @param {String} cityName - 城市名称
     * @returns {String} 图片URL
     */
    getCityImage(cityName) {
        const encoded = encodeURIComponent(cityName);
        return `${this.baseURL}/1200x600/?${encoded},city,skyline`;
    }
    
    /**
     * 批量生成图片URL（用于前端展示）
     * @param {Object} data - 包含景点、美食、酒店的数据
     * @returns {Object} 附带图片URL的数据
     */
    attachImages(data) {
        const result = { ...data };
        
        // 为景点添加图片
        if (result.attractions && Array.isArray(result.attractions)) {
            result.attractions = result.attractions.map(attr => ({
                ...attr,
                imageUrl: this.getAttractionImage(attr.name, attr.location)
            }));
        }
        
        // 为美食添加图片
        if (result.restaurants && Array.isArray(result.restaurants)) {
            result.restaurants = result.restaurants.map(rest => ({
                ...rest,
                imageUrl: this.getFoodImage(rest.name, rest.cuisine)
            }));
        }
        
        // 为酒店添加图片
        if (result.hotels && Array.isArray(result.hotels)) {
            result.hotels = result.hotels.map(hotel => ({
                ...hotel,
                imageUrl: this.getHotelImage(hotel.name, hotel.location)
            }));
        }
        
        return result;
    }
}

module.exports = ImageSearchAPI;
