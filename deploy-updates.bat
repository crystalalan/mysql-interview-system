@echo off
echo ========================================
echo    MySQL面试系统 - 自动部署更新
echo ========================================
echo.

echo 🔍 检查Git状态...
git status

echo.
echo 📝 添加所有修改的文件...
git add .

echo.
echo 💾 提交修改...
set /p commit_message="请输入提交信息 (直接回车使用默认): "
if "%commit_message%"=="" set commit_message=修复表单提交和管理员审核功能

git commit -m "%commit_message%"

echo.
echo 🚀 推送到GitHub...
git push origin main

echo.
echo ✅ 代码已推送到GitHub！
echo.
echo 📋 接下来的步骤：
echo 1. Railway会自动检测到代码更新并重新部署后端
echo 2. 等待2-3分钟让Railway完成部署
echo 3. 然后运行 update-frontend.bat 更新前端
echo.
echo 🌐 Railway项目地址: https://railway.app/dashboard
echo 📊 查看部署状态: https://web-production-19806.up.railway.app/api/health
echo.
pause