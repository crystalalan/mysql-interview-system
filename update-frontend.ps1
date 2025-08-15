Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   更新前端到Netlify" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 检查Railway后端状态..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://web-production-19806.up.railway.app/api/health" -Method Get
    Write-Host "✅ 后端状态: $($response.status)" -ForegroundColor Green
    Write-Host "✅ 数据库: $($response.database)" -ForegroundColor Green
} catch {
    Write-Host "❌ 后端连接失败，请等待Railway部署完成" -ForegroundColor Red
}

Write-Host ""
Write-Host "📦 准备前端文件..." -ForegroundColor Yellow
Set-Location "github-pages-deploy"

Write-Host ""
Write-Host "📋 前端文件列表：" -ForegroundColor Cyan
Get-ChildItem -Path "frontend" -Name

Write-Host ""
Write-Host "🌐 部署说明：" -ForegroundColor Cyan
Write-Host "1. 打开 https://app.netlify.com/sites/remarkable-conkies-39365e/deploys"
Write-Host "2. 将 github-pages-deploy/frontend 文件夹拖拽到部署区域"
Write-Host "3. 等待部署完成"
Write-Host ""
Write-Host "📱 部署完成后访问: https://remarkable-conkies-39365e.netlify.app" -ForegroundColor Blue
Write-Host "👤 管理员账户: crystalalan / [你的密码]" -ForegroundColor Blue
Write-Host ""
Write-Host "🎉 系统功能：" -ForegroundColor Green
Write-Host "✅ 用户注册登录"
Write-Host "✅ 面试问卷提交"
Write-Host "✅ 管理员审核功能"
Write-Host "✅ 多设备访问支持"
Write-Host "✅ 中文完美显示"
Write-Host ""

# 自动打开Netlify部署页面
Write-Host "🚀 正在打开Netlify部署页面..." -ForegroundColor Yellow
Start-Process "https://app.netlify.com/sites/remarkable-conkies-39365e/deploys"

Set-Location ".."
Read-Host "按回车键继续..."