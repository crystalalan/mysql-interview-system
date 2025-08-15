@echo off
echo 测试Railway API...
echo.

echo 1. 测试健康检查:
curl https://web-production-19806.up.railway.app/api/health
echo.
echo.

echo 2. 测试管理员登录:
curl -X POST https://web-production-19806.up.railway.app/api/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
echo.
echo.

echo 测试完成！
pause