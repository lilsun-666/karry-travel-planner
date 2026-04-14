#!/bin/bash

echo "======================================"
echo "豆包AI旅行规划系统 - 快速启动"
echo "======================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js"
    echo "请访问 https://nodejs.org/ 下载安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️ 未找到 .env 文件"
    echo "正在创建 .env 文件..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo ""
    echo "⚠️ 请编辑 .env 文件，填入你的 API Keys："
    echo "   DOUBAO_API_KEY=你的豆包API_Key"
    echo "   DOUBAO_ENDPOINT_ID=你的Endpoint_ID"
    echo "   BAIDU_API_KEY=你的百度API_Key"
    echo "   BAIDU_SECRET_KEY=你的百度Secret_Key"
    echo ""
    read -p "填写完成后按 Enter 继续..."
fi

# 安装依赖
if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd backend
    npm install
    cd ..
    echo "✅ 依赖安装完成"
    echo ""
fi

# 启动后端
echo "🚀 启动后端服务器..."
cd backend
node server.js
