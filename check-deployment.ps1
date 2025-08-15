Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   部署状态检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 检查Railway后端健康状态..." -ForegroundColor Yellow
Write-Host "请求地址: https://web-production-19806.up.railway.app/api/health"
try {
    $backendResponse = Invoke-RestMethod -Uri "https://web-production-19806.up.railway.app/api/health" -Method Get
    Write-Host "✅ 后端状态: $($backendResponse.status)" -ForegroundColor Green
    Write-Host "✅ 数据库: $($backendResponse.database)" -ForegroundColor Green
} catch {
    Write-Host "❌ 后端连接失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 检查Netlify前端状态..." -ForegroundColor Yellow
Write-Host "前端地址: https://remarkable-conkies-39365e.netlify.app"
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://remarkable-conkies-39365e.netlify.app" -Method Head
    Write-Host "✅ 前端状态: $($frontendResponse.StatusCode) $($frontendResponse.StatusDescription)" -ForegroundColor Green
} catch {
    Write-Host "❌ 前端连接失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 系统访问信息：" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🌐 前端地址: https://remarkable-conkies-39365e.netlify.app" -ForegroundColor Blue
Write-Host "🔧 后端地址: https://web-production-19806.up.railway.app" -ForegroundColor Blue
Write-Host "🩺 健康检查: https://web-production-19806.up.railway.app/api/health" -ForegroundColor Blue
Write-Host ""
Write-Host "👤 管理员账户：" -ForegroundColor Yellow
Write-Host "   用户名: crystalalan"
Write-Host "   密码: [你设置的密码]"
Write-Host ""
Write-Host "🎯 测试步骤:" -ForegroundColor Green
Write-Host "1. 访问前端地址"
Write-Host "2. 注册新用户测试"
Write-Host "3. 填写面试表单"
Write-Host "4. 用管理员账户登录"
Write-Host "5. 审核面试申请"
Write-Host ""
Write-Host "✅ 如果所有功能正常，部署就成功了！" -ForegroundColor Green
Write-Host ""

# 自动打开系统页面
Write-Host "🚀 正在打开系统页面..." -ForegroundColor Yellow
Start-Process "https://remarkable-conkies-39365e.netlify.app"

Read-Host "按回车键继续..."