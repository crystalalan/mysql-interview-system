Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MySQL面试系统 - 自动部署更新" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 检查Git状态..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "📝 添加所有修改的文件..." -ForegroundColor Yellow
git add .

Write-Host ""
$commitMessage = Read-Host "请输入提交信息 (直接回车使用默认)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "修复表单提交和管理员审核功能"
}

Write-Host "💾 提交修改..." -ForegroundColor Yellow
git commit -m $commitMessage

Write-Host ""
Write-Host "🚀 推送到GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ 代码已推送到GitHub！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 接下来的步骤：" -ForegroundColor Cyan
Write-Host "1. Railway会自动检测到代码更新并重新部署后端"
Write-Host "2. 等待2-3分钟让Railway完成部署"
Write-Host "3. 然后运行 .\update-frontend.ps1 更新前端"
Write-Host ""
Write-Host "🌐 Railway项目地址: https://railway.app/dashboard" -ForegroundColor Blue
Write-Host "📊 查看部署状态: https://web-production-19806.up.railway.app/api/health" -ForegroundColor Blue
Write-Host ""
Read-Host "按回车键继续..."