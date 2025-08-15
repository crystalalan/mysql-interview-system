@echo off
echo ========================================
echo    更新前端到Netlify
echo ========================================
echo.

echo 🔍 检查Railway后端状态...
curl -s https://web-production-19806.up.railway.app/api/health
echo.

echo 📦 准备前端文件...
cd github-pages-deploy

echo.
echo 📋 前端文件列表：
dir /b frontend

echo.
echo 🌐 部署说明：
echo 1. 打开 https://app.netlify.com/sites/remarkable-conkies-39365e/deploys
echo 2. 将 github-pages-deploy/frontend 文件夹拖拽到部署区域
echo 3. 等待部署完成
echo.
echo 📱 部署完成后访问: https://remarkable-conkies-39365e.netlify.app
echo 👤 管理员账户: crystalalan / [你的密码]
echo.
echo 🎉 系统功能：
echo ✅ 用户注册登录
echo ✅ 面试问卷提交
echo ✅ 管理员审核功能
echo ✅ 多设备访问支持
echo ✅ 中文完美显示
echo.
pause