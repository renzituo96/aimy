@echo off

:: 后端代理服务启动脚本
:: 用于Windows环境下快速启动后端服务

echo ================================
echo 后端代理服务启动脚本
 echo ================================

:: 检查Node.js是否已安装
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo 检测到Node.js已安装

:: 检查.env文件是否存在
if not exist ".env" (
    echo 警告: .env文件不存在，将创建默认配置
    if exist ".env.example" (
        copy ".env.example" ".env" > nul
        echo 已从.env.example创建.env文件
        echo 请编辑.env文件，设置正确的Supabase配置
        pause
    ) else (
        echo 错误: 找不到.env.example文件，请手动创建.env文件
        pause
        exit /b 1
    )
)

:: 安装依赖
echo 正在安装依赖...
npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo 依赖安装成功

:: 启动服务
echo 正在启动后端代理服务...
echo 服务地址: http://localhost:3000
echo 按 Ctrl+C 停止服务

echo. 
npm start