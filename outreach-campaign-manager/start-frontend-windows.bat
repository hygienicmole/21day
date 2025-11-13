@echo off
REM Multi-Channel Outreach Campaign Manager - Start Frontend (Batch)

echo ================================================
echo Starting Outreach Campaign Manager - FRONTEND
echo ================================================
echo.

cd /d "%~dp0frontend"

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

echo Starting frontend development server...
echo Frontend will be available at: http://localhost:5173
echo.
echo Make sure the backend is running first!
echo   (Run start-backend-windows.bat in another terminal)
echo.
echo Login credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Press Ctrl+C to stop
echo ================================================
echo.

npm run dev
