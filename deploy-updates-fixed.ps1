# Set UTF-8 encoding for PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MySQL Interview System - Auto Deploy Updates" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Checking Git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "📝 Adding all modified files..." -ForegroundColor Yellow
git add .

Write-Host ""
$commitMessage = Read-Host "Enter commit message (press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Fix form submission and admin review functionality"
}

Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Railway will automatically detect code updates and redeploy backend"
Write-Host "2. Wait 2-3 minutes for Railway to complete deployment"
Write-Host "3. Then run .\update-frontend.ps1 to update frontend"
Write-Host ""
Write-Host "🌐 Railway project: https://railway.app/dashboard" -ForegroundColor Blue
Write-Host "📊 Check deployment status: https://web-production-19806.up.railway.app/api/health" -ForegroundColor Blue
Write-Host ""
Read-Host "Press Enter to continue..."