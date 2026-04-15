#!/bin/bash

# Karry旅行家 - Railway部署快速命令
# 执行这个脚本，按提示操作即可完成部署

set -e

echo "======================================"
echo "  🚀 Karry旅行家 - Railway部署向导"
echo "======================================"
echo ""

# 进入项目目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查git状态
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误：不是git仓库"
    exit 1
fi

# 检查远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "📝 第1步：上传到GitHub"
    echo "======================================"
    echo ""
    echo "请先在GitHub创建仓库："
    echo "1. 访问 https://github.com/new"
    echo "2. 仓库名称：karry-travel-planner（或其他）"
    echo "3. 可见性：Private（推荐）或Public"
    echo "4. 点击 Create repository"
    echo ""
    read -p "创建完成后，输入仓库地址（如 https://github.com/username/repo.git）: " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo "❌ 仓库地址不能为空"
        exit 1
    fi
    
    git remote add origin "$REPO_URL"
    echo "✅ 已添加远程仓库"
fi

# 推送代码
echo ""
echo "📤 第2步：推送代码到GitHub"
echo "======================================"
echo ""

REMOTE_URL=$(git remote get-url origin)
echo "远程仓库: $REMOTE_URL"
echo ""

git branch -M main

echo "正在推送代码..."
if git push -u origin main; then
    echo "✅ 代码推送成功！"
else
    echo ""
    echo "❌ 推送失败，可能需要GitHub Personal Access Token"
    echo ""
    echo "如何获取Token："
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 点击 Generate new token (classic)"
    echo "3. 勾选 repo 权限"
    echo "4. 生成并复制Token"
    echo "5. 使用Token替代密码"
    echo ""
    echo "然后重新执行：git push -u origin main"
    exit 1
fi

echo ""
echo "======================================"
echo "  🎉 GitHub代码上传完成！"
echo "======================================"
echo ""
echo "📋 第3步：部署到Railway"
echo "======================================"
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 访问 https://railway.app"
echo "2. 点击 Login with GitHub"
echo "3. 点击 New Project"
echo "4. 选择 Deploy from GitHub repo"
echo "5. 选择仓库: $(basename $REMOTE_URL .git)"
echo "6. 点击 Deploy Now"
echo ""
echo "⏳ 等待部署完成（约2-3分钟）..."
echo ""
echo "======================================"
echo "  🔧 第4步：配置环境变量"
echo "======================================"
echo ""
echo "在Railway项目页面："
echo "1. 点击 Variables 标签"
echo "2. 添加以下环境变量："
echo ""
echo "   变量1: DOUBAO_API_KEY"
echo "   值: 26563a50-fc35-4e05-b885-c88ba22b90ca"
echo ""
echo "   变量2: DOUBAO_ENDPOINT_ID"
echo "   值: ep-20260408181203-jw4gt"
echo ""
echo "3. 点击 Add 保存"
echo "4. 等待自动重新部署（1-2分钟）"
echo ""
echo "======================================"
echo "  🌐 第5步：获取访问地址"
echo "======================================"
echo ""
echo "在Railway项目页面："
echo "1. 点击 Settings 标签"
echo "2. 找到 Domains 部分"
echo "3. 点击 Generate Domain"
echo "4. 复制生成的域名"
echo ""
echo "✅ 完成！现在可以分享链接给朋友使用了！"
echo ""
echo "======================================"
echo ""
echo "📚 详细教程：查看 Railway一键部署教程.md"
echo ""
