# Railway & Backend Ops Helper Script for Goldmans Gambit Backend
param (
    [string]$BackendUrl = "https://your-railway-backend-url.up.railway.app"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Goldmans Gambit Backend Operational Check " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n1. Testing Backend /health endpoint at $BackendUrl/health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/health" -Method Get -TimeoutSec 5
    Write-Host "Status: ONLINE" -ForegroundColor Green
    Write-Host "Response:" ($response | ConvertTo-Json -Compress) -ForegroundColor Green
} catch {
    Write-Host "Status: DOWN or UNREACHABLE" -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
}

Write-Host "`n2. Railway Troubleshooting Checklist & Commands:" -ForegroundColor Yellow
Write-Host "  a) Check status & logs:" -ForegroundColor White
Write-Host "     railway status" -ForegroundColor Gray
Write-Host "     railway logs" -ForegroundColor Gray
Write-Host "  b) Restart service:" -ForegroundColor White
Write-Host "     railway restart" -ForegroundColor Gray
Write-Host "  c) Redeploy service:" -ForegroundColor White
Write-Host "     railway up" -ForegroundColor Gray

Write-Host "`n3. Database Reset Command (Wipes old data & seeds 17 Goldmans Gambit stocks):" -ForegroundColor Yellow
Write-Host "  npm run db:reset" -ForegroundColor Gray
