require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const DoubaoAPI = require('./doubao-api');
const ImageSearchAPI = require('./image-api');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务（提供前端页面）
app.use(express.static(path.join(__dirname, '../frontend')));

// 初始化 API
const doubao = new DoubaoAPI(
    process.env.DOUBAO_API_KEY,
    process.env.DOUBAO_ENDPOINT_ID
);
const imageSearch = new ImageSearchAPI();

// ========================================
// 健康检查
// ========================================
app.get('/health', async (req, res) => {
    const status = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        apis: {
            doubao: '未检测'
        }
    };
    
    // 检查AI服务
    try {
        await doubao.chat([{ role: 'user', content: 'hi' }]);
        status.apis.doubao = '✅ 正常';
    } catch (error) {
        status.apis.doubao = `❌ 错误: ${error.message}`;
    }
    
    res.json(status);
});

// ========================================
// API: 生成旅行方案（仅豆包AI）
// ========================================
app.post('/api/generate-plan', async (req, res) => {
    const { userInput } = req.body;
    
    if (!userInput) {
        return res.status(400).json({
            success: false,
            error: '请提供用户输入'
        });
    }
    
    console.log(`\n📝 收到请求: ${userInput}`);
    
    try {
        // 步骤1: 解析用户需求
        console.log('🤔 解析用户需求...');
        const profile = await doubao.parseUserIntent(userInput);
        console.log('✅ 需求解析完成:', profile);
        
        // 步骤2: 直接让AI生成方案
        console.log('\n🤖 AI生成旅行方案...');
        const plan = await doubao.generateTravelPlanDirect(userInput, profile);
        console.log('✅ 方案生成完成');
        
        // 返回结果
        res.json({
            success: true,
            data: {
                profile,
                plan
            }
        });
        
    } catch (error) {
        console.error('❌ 生成方案失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// API: 搜索功能已移除（仅使用豆包AI）
// ========================================

// ========================================
// API: 仅AI生成（不搜索）
// ========================================
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({
            success: false,
            error: '请提供消息内容'
        });
    }
    
    try {
        const response = await doubao.chat([
            { role: 'user', content: message }
        ]);
        
        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// API: 批量搜索图片
// ========================================
app.post('/api/search-images', async (req, res) => {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            error: '请提供有效的items数组'
        });
    }
    
    console.log(`\n🖼️ 搜索图片: ${items.length}个项目`);
    
    try {
        const results = await imageSearch.batchGetImages(items);
        
        res.json({
            success: true,
            data: results
        });
        
        console.log(`✅ 图片搜索完成`);
        
    } catch (error) {
        console.error('❌ 图片搜索失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// 辅助函数已移除（不再需要搜索查询生成）
// ========================================

// ========================================
// 启动服务器
// ========================================
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ Karry旅行家服务启动成功！');
    console.log('🌐 服务地址:', `http://localhost:${PORT}`);
    console.log('📝 健康检查:', `http://localhost:${PORT}/health`);
    console.log('='.repeat(50) + '\n');
    
    // 检查环境变量
    if (!process.env.DOUBAO_API_KEY) {
        console.warn('⚠️ 警告: 未设置 API_KEY');
    }
    if (!process.env.DOUBAO_ENDPOINT_ID) {
        console.warn('⚠️ 警告: 未设置 ENDPOINT_ID');
    }
});
