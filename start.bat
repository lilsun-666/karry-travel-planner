@echo off
echo ======================================
echo 豆包AI旅行规划系统 - 快速启动
echo ======================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未安装 Node.js
    echo 请访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
echo.

REM 检查 .env 文件
if not exist ".env" (
    echo ⚠️ 未找到 .env 文件
    echo 正在创建 .env 文件...
    copy .env.example .env
    echo ✅ 已创建 .env 文件
    echo.
    echo ⚠️ 请编辑 .env 文件，填入你的 API Keys：
    echo    DOUBAO_API_KEY=你的豆包API_Key
    echo    DOUBAO_ENDPOINT_ID=你的Endpoint_ID
    echo    BAIDU_API_KEY=你的百度API_Key
    echo    BAIDU_SECRET_KEY=你的百度Secret_Key
    echo.
    pause
)

REM 安装依赖
if not exist "backend\node_modules" (
    echo 📦 安装后端依赖...
    cd backend
    call npm install
    cd ..
    echo ✅ 依赖安装完成
    echo.
)

REM 启动后端
echo 🚀 启动后端服务器...
cd backend
node server.js
