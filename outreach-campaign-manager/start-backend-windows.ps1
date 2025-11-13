# Multi-Channel Outreach Campaign Manager - Start Backend (PowerShell)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting Outreach Campaign Manager - BACKEND" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory and navigate to backend
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\backend"

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

# Check if database exists
if (-Not (Test-Path "database.db")) {
    Write-Host "⚠️  Database not found. Initializing..." -ForegroundColor Yellow
    node src\db.js
    node src\seed.js
    Write-Host ""
}

Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Write-Host "📍 Backend will be available at: http://localhost:3000" -ForegroundColor White
Write-Host "📊 API endpoints at: http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

npm start
