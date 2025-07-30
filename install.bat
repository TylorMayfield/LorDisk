@echo off
echo Installing LorDisk - Cross-Platform Disk Space Analyzer & Cleanup Tool
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo SUCCESS: Node.js detected: 
node --version

REM Install dependencies
echo.
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo SUCCESS: Dependencies installed successfully

REM Build the application
echo.
echo Building application...
call npm run build

if %errorlevel% neq 0 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)

echo SUCCESS: Application built successfully

echo.
echo LorDisk installation completed!
echo.
echo To start the application in development mode:
echo   npm run dev
echo.
echo To build for distribution:
echo   npm run dist
echo.
echo For more information, see README.md
pause 