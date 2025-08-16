Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Frontend Update Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Updating frontend files..." -ForegroundColor Yellow

# Copy files to github-pages-deploy directory
Write-Host "Copying index.html..." -ForegroundColor Yellow
Copy-Item "index.html" "github-pages-deploy/" -Force

Write-Host "Copying style.css..." -ForegroundColor Yellow
Copy-Item "style.css" "github-pages-deploy/" -Force

Write-Host "Copying script.js..." -ForegroundColor Yellow
Copy-Item "script.js" "github-pages-deploy/frontend/" -Force

Write-Host ""
Write-Host "Committing frontend changes..." -ForegroundColor Yellow
Set-Location "github-pages-deploy"

git add .
git commit -m "Update frontend with form validation fixes"
git push origin main

Set-Location ".."

Write-Host ""
Write-Host "Frontend updated successfully!" -ForegroundColor Green
Write-Host "GitHub Pages will automatically deploy the changes." -ForegroundColor Blue
Write-Host ""
pause