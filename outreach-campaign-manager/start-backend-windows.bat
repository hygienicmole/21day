@echo off
REM Multi-Channel Outreach Campaign Manager - Start Backend (Batch)

echo ================================================
echo Starting Outreach Campaign Manager - BACKEND
echo ================================================
echo.

cd /d "%~dp0backend"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo ERROR: Dependencies not installed!
    echo.
    echo Please run the setup script first:
    echo   setup-windows.bat
    echo.
    pause
    exit /b 1
)

REM Check if database exists
if not exist "database.db" (
    echo Database not found. Initializing...
    node src\db.js
    node src\seed.js
    echo.
)

echo Starting backend server...
echo Backend will be available at: http://localhost:3000
echo API endpoints at: http://localhost:3000/api
echo.
echo Press Ctrl+C to stop
echo ================================================
echo.

npm start
