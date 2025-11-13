@echo off
REM Multi-Channel Outreach Campaign Manager - Windows Setup Script
REM Command Prompt Version

echo ==========================================================
echo   Multi-Channel Outreach Campaign Manager - SETUP
echo ==========================================================
echo.

REM Get script directory
cd /d "%~dp0"

echo Working directory: %CD%
echo.

REM Check Node.js installation
echo 1. Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js version: %NODE_VERSION%
echo.

REM Backend setup
echo 2. Setting up BACKEND...
cd backend

if exist "node_modules\" (
    echo node_modules already exists, skipping installation
) else (
    echo Installing backend dependencies (this may take a minute)...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Backend dependency installation failed!
        pause
        exit /b 1
    )
)

echo Backend dependencies installed
echo.

REM Initialize database
echo 3. Setting up DATABASE...
if exist "database.db" (
    echo Database already exists
    set /p RESET="   Do you want to reset it? (y/N): "
    if /i "%RESET%"=="y" (
        del database.db
        echo Deleted old database
        node src\db.js
        node src\seed.js
    )
) else (
    echo Initializing database...
    node src\db.js
    echo.
    echo Seeding database with sample data...
    node src\seed.js
)

echo Database ready
echo.

REM Frontend setup
echo 4. Setting up FRONTEND...
cd ..\frontend

if exist "node_modules\" (
    echo node_modules already exists, skipping installation
) else (
    echo Installing frontend dependencies (this may take a minute)...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Frontend dependency installation failed!
        pause
        exit /b 1
    )
)

echo Frontend dependencies installed
echo.

REM Final summary
cd ..

echo ==========================================================
echo   SETUP COMPLETE!
echo ==========================================================
echo.
echo How to start the application:
echo.
echo Option 1 - Use the startup scripts (RECOMMENDED):
echo   Terminal 1: start-backend-windows.bat
echo   Terminal 2: start-frontend-windows.bat
echo.
echo Option 2 - PowerShell scripts:
echo   Terminal 1: .\start-backend-windows.ps1
echo   Terminal 2: .\start-frontend-windows.ps1
echo.
echo Option 3 - Manual startup:
echo   Terminal 1:
echo     cd backend
echo     npm start
echo.
echo   Terminal 2:
echo     cd frontend
echo     npm run dev
echo.
echo ==========================================================
echo After starting both servers:
echo    Open: http://localhost:5173
echo    Login: admin / admin123
echo ==========================================================
echo.
pause
