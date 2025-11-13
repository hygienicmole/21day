# Multi-Channel Outreach Campaign Manager - Windows Setup Script
# PowerShell Version

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Multi-Channel Outreach Campaign Manager - SETUP" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Working directory: $ScriptDir" -ForegroundColor Yellow
Write-Host ""

# Check Node.js installation
Write-Host "1️⃣  Checking Node.js installation..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Please install Node.js 18+ from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Backend setup
Write-Host "2️⃣  Setting up BACKEND..." -ForegroundColor Green
Set-Location "$ScriptDir\backend"

if (Test-Path "node_modules") {
    Write-Host "⚠️  node_modules already exists, skipping installation" -ForegroundColor Yellow
} else {
    Write-Host "📦 Installing backend dependencies (this may take a minute)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend dependency installation failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Initialize database
Write-Host "3️⃣  Setting up DATABASE..." -ForegroundColor Green
if (Test-Path "database.db") {
    Write-Host "⚠️  Database already exists" -ForegroundColor Yellow
    $response = Read-Host "   Do you want to reset it? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Remove-Item "database.db" -Force
        Write-Host "🗑️  Deleted old database" -ForegroundColor Yellow
        node src\db.js
        node src\seed.js
    }
} else {
    Write-Host "🔧 Initializing database..." -ForegroundColor Yellow
    node src\db.js
    Write-Host ""
    Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
    node src\seed.js
}

Write-Host "✅ Database ready" -ForegroundColor Green
Write-Host ""

# Frontend setup
Write-Host "4️⃣  Setting up FRONTEND..." -ForegroundColor Green
Set-Location "$ScriptDir\frontend"

if (Test-Path "node_modules") {
    Write-Host "⚠️  node_modules already exists, skipping installation" -ForegroundColor Yellow
} else {
    Write-Host "📦 Installing frontend dependencies (this may take a minute)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend dependency installation failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Final summary
Set-Location $ScriptDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 How to start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1 - Use the startup scripts (RECOMMENDED):" -ForegroundColor White
Write-Host "  Terminal 1: .\start-backend-windows.ps1" -ForegroundColor Cyan
Write-Host "  Terminal 2: .\start-frontend-windows.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 2 - Manual startup:" -ForegroundColor White
Write-Host "  Terminal 1:" -ForegroundColor Cyan
Write-Host "    cd backend" -ForegroundColor Gray
Write-Host "    npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "  Terminal 2:" -ForegroundColor Cyan
Write-Host "    cd frontend" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "📱 After starting both servers:" -ForegroundColor Yellow
Write-Host "   Open: http://localhost:5173" -ForegroundColor White
Write-Host "   Login: admin / admin123" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
