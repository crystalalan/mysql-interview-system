@echo off
echo ================================
echo 线上面试系统 - 部署助手
echo ================================
echo.

echo 选择部署方式：
echo 1. Heroku 部署（推荐）
echo 2. GitHub Pages 部署
echo 3. 生成部署包
echo 4. 查看部署指南
echo.

set /p choice="请输入选择 (1-4): "

if "%choice%"=="1" goto heroku
if "%choice%"=="2" goto github
if "%choice%"=="3" goto package
if "%choice%"=="4" goto guide
goto end

:heroku
echo.
echo 正在准备 Heroku 部署...
echo.
echo 请按以下步骤操作：
echo 1. 确保已安装 Heroku CLI
echo 2. 执行以下命令：
echo.
echo heroku login
echo git init
echo git add .
echo git commit -m "Deploy to Heroku"
echo heroku create your-interview-system
echo git push heroku main
echo heroku open
echo.
echo 详细步骤请查看 heroku-deploy.md
echo.
pause
goto end

:github
echo.
echo 正在准备 GitHub Pages 部署...
echo.
echo 请按以下步骤操作：
echo 1. 确保已安装 Git
echo 2. 在 GitHub 创建新仓库 'interview-system'
echo 3. 执行以下命令：
echo.
echo git init
echo git add .
echo git commit -m "Initial commit"
echo git branch -M main
echo git remote add origin https://github.com/你的用户名/interview-system.git
echo git push -u origin main
echo.
echo 4. 在 GitHub 仓库设置中启用 Pages
echo 5. 访问: https://你的用户名.github.io/interview-system/
echo.
pause
goto end

:package
echo.
echo 正在生成部署包...
mkdir deploy 2>nul
copy index.html deploy\ >nul
xcopy frontend deploy\frontend\ /E /I /Y >nul
echo.
echo 部署包已生成到 'deploy' 文件夹
echo 你可以将此文件夹上传到任何静态网站托管服务
echo.
pause
goto end

:guide
echo.
echo 打开部署指南...
start heroku-deploy.md
goto end

:end
echo.
echo 感谢使用！
pause