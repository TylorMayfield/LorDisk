@echo off
setlocal enabledelayedexpansion

REM LorDisk Build Script for Windows
REM This script helps build LorDisk for different platforms on Windows

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to check if command exists
:command_exists
where %1 >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 0
) else (
    exit /b 1
)

REM Function to check prerequisites
:check_prerequisites
call :print_status "Checking prerequisites..."

call :command_exists node
if %errorlevel% neq 0 (
    call :print_error "Node.js is not installed"
    exit /b 1
)

call :command_exists npm
if %errorlevel% neq 0 (
    call :print_error "npm is not installed"
    exit /b 1
)

call :print_success "Prerequisites check passed"
goto :eof

REM Function to install dependencies
:install_dependencies
call :print_status "Installing dependencies..."
call npm ci
if %errorlevel% neq 0 (
    call :print_error "Failed to install dependencies"
    exit /b 1
)
call :print_success "Dependencies installed"
goto :eof

REM Function to build Next.js app
:build_nextjs
call :print_status "Building Next.js app..."
call npm run build
if %errorlevel% neq 0 (
    call :print_error "Failed to build Next.js app"
    exit /b 1
)
call :print_success "Next.js app built"
goto :eof

REM Function to build for specific platform
:build_platform
set "platform=%~1"
call :print_status "Building for %platform%..."

if "%platform%"=="win" goto :build_win
if "%platform%"=="windows" goto :build_win
if "%platform%"=="mac" goto :build_mac
if "%platform%"=="macos" goto :build_mac
if "%platform%"=="linux" goto :build_linux
if "%platform%"=="all" goto :build_all

call :print_error "Unknown platform: %platform%"
call :print_status "Available platforms: win, mac, linux, all"
exit /b 1

:build_win
call npm run electron:build:win
goto :build_done

:build_mac
call npm run electron:build:mac
goto :build_done

:build_linux
call npm run electron:build:linux
goto :build_done

:build_all
call npm run electron:build
goto :build_done

:build_done
if %errorlevel% neq 0 (
    call :print_error "Build failed for %platform%"
    exit /b 1
)
call :print_success "Build completed for %platform%"
goto :eof

REM Function to clean build artifacts
:clean_build
call :print_status "Cleaning build artifacts..."
if exist dist rmdir /s /q dist
if exist out rmdir /s /q out
if exist .next rmdir /s /q .next
call :print_success "Build artifacts cleaned"
goto :eof

REM Function to show help
:show_help
echo LorDisk Build Script for Windows
echo.
echo Usage: %0 [OPTIONS] [PLATFORM]
echo.
echo Options:
echo   -h, --help     Show this help message
echo   -c, --clean    Clean build artifacts before building
echo   -i, --install  Install dependencies before building
echo   -p, --platform Specify platform to build for
echo.
echo Platforms:
echo   win, windows   Build for Windows
echo   mac, macos     Build for macOS
echo   linux          Build for Linux
echo   all            Build for all platforms
echo.
echo Examples:
echo   %0 -i -p win     Install deps and build for Windows
echo   %0 -c -p mac     Clean and build for macOS
echo   %0 -p all        Build for all platforms
echo   %0 -i -c -p linux Install, clean, and build for Linux
goto :eof

REM Main script
set "clean=false"
set "install=false"
set "platform=all"

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :main_logic
if "%~1"=="-h" goto :show_help
if "%~1"=="--help" goto :show_help
if "%~1"=="-c" (
    set "clean=true"
    shift
    goto :parse_args
)
if "%~1"=="--clean" (
    set "clean=true"
    shift
    goto :parse_args
)
if "%~1"=="-i" (
    set "install=true"
    shift
    goto :parse_args
)
if "%~1"=="--install" (
    set "install=true"
    shift
    goto :parse_args
)
if "%~1"=="-p" (
    set "platform=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--platform" (
    set "platform=%~2"
    shift
    shift
    goto :parse_args
)
set "platform=%~1"
shift
goto :parse_args

:main_logic
REM Check prerequisites
call :check_prerequisites
if %errorlevel% neq 0 exit /b 1

REM Clean if requested
if "%clean%"=="true" (
    call :clean_build
)

REM Install dependencies if requested
if "%install%"=="true" (
    call :install_dependencies
    if %errorlevel% neq 0 exit /b 1
)

REM Build Next.js app
call :build_nextjs
if %errorlevel% neq 0 exit /b 1

REM Build for platform
call :build_platform "%platform%"
if %errorlevel% neq 0 exit /b 1

call :print_success "Build process completed successfully!"
call :print_status "Check the 'dist' directory for build artifacts"
goto :eof 