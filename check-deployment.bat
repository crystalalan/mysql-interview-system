@echo off
echo ========================================
echo    部署状态检查
echo ========================================
echo.

echo 🔍 检查Railway后端健康状态...
echo 请求地址: https://web-production-19806.up.railway.app/api/health
curl -s https://web-production-19806.up.railway.app/api/health
echo.
echo.

echo 🔍 检查Netlify前端状态...
echo 前端地址: https://remarkable-conkies-39365e.netlify.app
curl -s -I https://remarkable-conkies-39365e.netlify.app | findstr "HTTP"
echo.

echo 📋 系统访问信息：
echo ==========================================
echo 🌐 前端地址: https://remarkable-conkies-39365e.netlify.app
echo 🔧 后端地址: https://web-production-19806.up.railway.app
echo 🩺 健康检查: https://web-production-19806.up.railway.app/api/health
echo.
echo 👤 管理员账户:
echo    用户名: crystalalan
echo    密码: [你设置的密码]
echo.
echo 🎯 测试步骤:
echo 1. 访问前端地址
echo 2. 注册新用户测试
echo 3. 填写面试表单
echo 4. 用管理员账户登录
echo 5. 审核面试申请
echo.
echo ✅ 如果所有功能正常，部署就成功了！
echo.
pause