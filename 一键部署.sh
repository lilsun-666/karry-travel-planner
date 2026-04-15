#!/bin/bash

# Karry旅行家 - 终极部署向导
# 一键完成所有准备工作

clear

cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        🌏 Karry旅行家 - Railway部署向导 🚀               ║
║                                                          ║
║        让你的AI旅行助手走向世界！                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF

echo ""
echo "📋 准备检查..."
echo ""

# 进入项目目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查git
if ! command -v git &> /dev/null; then
    echo "❌ Git未安装，请先安装Git"
    exit 1
fi
echo "✅ Git已安装"

# 检查git仓库
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误：不是git仓库"
    exit 1
fi
echo "✅ Git仓库已初始化"

# 检查是否有提交
if ! git log > /dev/null 2>&1; then
    echo "❌ 错误：没有提交记录"
    exit 1
fi
echo "✅ 代码已提交"

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️  警告：.env文件不存在"
else
    echo "✅ 环境变量配置存在"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🎯 部署Railway需要3个步骤："
echo ""
echo "   第1步：上传代码到GitHub"
echo "   第2步：在Railway连接仓库"
echo "   第3步：配置环境变量"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

read -p "准备好了吗？按回车开始... " 

echo ""
echo "📝 第1步：上传代码到GitHub"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 检查是否已有远程仓库
if git remote get-url origin > /dev/null 2>&1; then
    REMOTE_URL=$(git remote get-url origin)
    echo "✅ 已配置远程仓库："
    echo "   $REMOTE_URL"
    echo ""
    read -p "需要更改吗？(y/N) " CHANGE_REMOTE
    
    if [[ $CHANGE_REMOTE =~ ^[Yy]$ ]]; then
        read -p "输入新的仓库地址: " NEW_REPO_URL
        if [ -n "$NEW_REPO_URL" ]; then
            git remote set-url origin "$NEW_REPO_URL"
            REMOTE_URL="$NEW_REPO_URL"
            echo "✅ 已更新远程仓库"
        fi
    fi
else
    echo "需要创建GitHub仓库："
    echo ""
    echo "1. 访问 https://github.com/new"
    echo "2. 仓库名：karry-travel-planner"
    echo "3. 可见性：Private（推荐）"
    echo "4. 点击 Create repository"
    echo ""
    read -p "创建完成后，输入仓库地址: " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo "❌ 仓库地址不能为空"
        exit 1
    fi
    
    git remote add origin "$REPO_URL"
    REMOTE_URL="$REPO_URL"
    echo "✅ 已添加远程仓库"
fi

echo ""
echo "📤 推送代码到GitHub..."
echo ""

git branch -M main

if git push -u origin main 2>&1; then
    echo ""
    echo "✅ 代码推送成功！"
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "可能需要GitHub Personal Access Token："
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 点击 Generate new token (classic)"
    echo "3. 勾选 repo 权限"
    echo "4. 复制Token"
    echo "5. 使用Token替代密码"
    echo ""
    echo "然后执行：git push -u origin main"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🚂 第2步：部署到Railway"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "请在浏览器中操作："
echo ""
echo "1. 访问 https://railway.app"
echo "2. 点击 Login with GitHub"
echo "3. 点击 New Project"
echo "4. 选择 Deploy from GitHub repo"
echo "5. 选择仓库: $(basename $REMOTE_URL .git)"
echo "6. 点击 Deploy Now"
echo ""

read -p "部署完成后按回车继续... " 

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🔧 第3步：配置环境变量"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 读取.env文件
if [ -f ".env" ]; then
    API_KEY=$(grep DOUBAO_API_KEY .env | cut -d '=' -f2)
    ENDPOINT_ID=$(grep DOUBAO_ENDPOINT_ID .env | cut -d '=' -f2)
    
    echo "在Railway项目页面 → Variables 标签，添加："
    echo ""
    echo "变量1："
    echo "  Name:  DOUBAO_API_KEY"
    echo "  Value: $API_KEY"
    echo ""
    echo "变量2："
    echo "  Name:  DOUBAO_ENDPOINT_ID"
    echo "  Value: $ENDPOINT_ID"
    echo ""
else
    echo "在Railway项目页面 → Variables 标签，添加："
    echo ""
    echo "变量1："
    echo "  Name:  DOUBAO_API_KEY"
    echo "  Value: （从你的.env文件复制）"
    echo ""
    echo "变量2："
    echo "  Name:  DOUBAO_ENDPOINT_ID"
    echo "  Value: （从你的.env文件复制）"
    echo ""
fi

read -p "配置完成后按回车继续... " 

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🌐 第4步：获取访问地址"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "在Railway项目页面："
echo "1. 点击 Settings 标签"
echo "2. 找到 Domains 部分"
echo "3. 点击 Generate Domain"
echo "4. 复制生成的域名"
echo ""

read -p "生成域名后，粘贴到这里: " RAILWAY_URL

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║                  🎉 部署完成！                           ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "✨ 你的旅行助手已上线："
echo ""

if [ -n "$RAILWAY_URL" ]; then
    echo "   🌐 $RAILWAY_URL"
else
    echo "   🌐 https://你的项目名.up.railway.app"
fi

echo ""
echo "📱 现在可以分享给朋友使用了！"
echo ""
echo "分享消息模板："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "嘿！试试这个AI旅行规划助手："

if [ -n "$RAILWAY_URL" ]; then
    echo "$RAILWAY_URL"
else
    echo "https://你的项目名.up.railway.app"
fi

echo ""
echo "输入你想去的地方，AI会帮你定制个性化旅行方案！"
echo "包括景点、美食、酒店推荐，还有真实图片哦 📸"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示："
echo "   - 首次访问可能需要5-10秒唤醒"
echo "   - 支持电脑和手机浏览器"
echo "   - 完全免费使用"
echo ""
echo "📚 更多信息："
echo "   - 查看 Railway部署图文教程.md"
echo "   - 查看 收藏导出功能说明.md"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✨ Karry旅行家 - 智能定制您的旅程 ✈️"
echo ""
