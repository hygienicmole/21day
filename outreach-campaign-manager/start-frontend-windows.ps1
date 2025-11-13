# Multi-Channel Outreach Campaign Manager - Start Frontend (PowerShell)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting Outreach Campaign Manager - FRONTEND" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory and navigate to frontend
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\frontend"

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "❌ ERROR: Dependencies not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run the setup script first:" -ForegroundColor Yellow
    Write-Host "  .\setup-windows.ps1" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🚀 Starting frontend development server..." -ForegroundColor Green
Write-Host "📍 Frontend will be available at: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Make sure the backend is running first!" -ForegroundColor Yellow
Write-Host "   (Run .\start-backend-windows.ps1 in another terminal)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 Login credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
