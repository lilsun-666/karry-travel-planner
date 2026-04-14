#!/bin/bash

# Karry旅行家 - 快速分享脚本
# 使用ngrok快速分享本地服务

set -e

echo "======================================"
echo "   🌏 Karry旅行家 - 快速分享"
echo "======================================"
echo ""

# 检查ngrok
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok 未安装"
    echo ""
    echo "请先安装 ngrok："
    echo "  macOS: brew install ngrok/ngrok/ngrok"
    echo "  或访问: https://ngrok.com/download"
    echo ""
    exit 1
fi

# 检查服务是否运行
if ! curl -s http://localhost:3000/health &> /dev/null; then
    echo "⚠️  服务未运行，正在启动..."
    echo ""

    # 进入项目目录
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    cd "$SCRIPT_DIR"

    # 启动服务（后台运行）
    nohup node backend/server.js > logs/server.log 2>&1 &

    echo "⏳ 等待服务启动..."
    sleep 3

    if ! curl -s http://localhost:3000/health &> /dev/null; then
        echo "❌ 服务启动失败，请检查 logs/server.log"
        exit 1
    fi

    echo "✅ 服务已启动"
    echo ""
fi

echo "🚀 正在启动 ngrok..."
echo ""

# 启动ngrok
ngrok http 3000
