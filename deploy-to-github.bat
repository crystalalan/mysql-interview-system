@echo off
echo ================================
echo   GitHub 部署脚本
echo ================================
echo.

echo 1. 添加所有文件到 Git...
git add .

echo 2. 提交更改...
set /p commit_msg="请输入提交信息 (默认: Update project): "
if "%commit_msg%"=="" set commit_msg=Update project
git commit -m "%commit_msg%"

echo 3. 推送到 GitHub...
git push origin main

echo.
echo ================================
echo   部署完成！
echo ================================
echo.
echo 接下来的步骤:
echo 1. 访问 Railway.app 部署后端
echo 2. 访问 Netlify.com 部署前端
echo 3. 查看 DEPLOYMENT_GUIDE.md 获取详细指南
echo.
pause