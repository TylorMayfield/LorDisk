#!/bin/bash

# LorDisk Build Script
# This script helps build LorDisk for different platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Function to build Next.js app
build_nextjs() {
    print_status "Building Next.js app..."
    npm run build
    print_success "Next.js app built"
}

# Function to build for specific platform
build_platform() {
    local platform=$1
    print_status "Building for $platform..."
    
    case $platform in
        "win"|"windows")
            npm run electron:build:win
            ;;
        "mac"|"macos")
            npm run electron:build:mac
            ;;
        "linux")
            npm run electron:build:linux
            ;;
        "all")
            npm run electron:build
            ;;
        *)
            print_error "Unknown platform: $platform"
            print_status "Available platforms: win, mac, linux, all"
            exit 1
            ;;
    esac
    
    print_success "Build completed for $platform"
}

# Function to clean build artifacts
clean_build() {
    print_status "Cleaning build artifacts..."
    rm -rf dist/
    rm -rf out/
    rm -rf .next/
    print_success "Build artifacts cleaned"
}

# Function to show help
show_help() {
    echo "LorDisk Build Script"
    echo ""
    echo "Usage: $0 [OPTIONS] [PLATFORM]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -c, --clean    Clean build artifacts before building"
    echo "  -i, --install  Install dependencies before building"
    echo "  -p, --platform Specify platform to build for"
    echo ""
    echo "Platforms:"
    echo "  win, windows   Build for Windows"
    echo "  mac, macos     Build for macOS"
    echo "  linux          Build for Linux"
    echo "  all            Build for all platforms"
    echo ""
    echo "Examples:"
    echo "  $0 -i -p win     Install deps and build for Windows"
    echo "  $0 -c -p mac     Clean and build for macOS"
    echo "  $0 -p all        Build for all platforms"
    echo "  $0 -i -c -p linux Install, clean, and build for Linux"
}

# Main script
main() {
    local clean=false
    local install=false
    local platform="all"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--clean)
                clean=true
                shift
                ;;
            -i|--install)
                install=true
                shift
                ;;
            -p|--platform)
                platform="$2"
                shift 2
                ;;
            *)
                platform="$1"
                shift
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    # Clean if requested
    if [ "$clean" = true ]; then
        clean_build
    fi
    
    # Install dependencies if requested
    if [ "$install" = true ]; then
        install_dependencies
    fi
    
    # Build Next.js app
    build_nextjs
    
    # Build for platform
    build_platform "$platform"
    
    print_success "Build process completed successfully!"
    print_status "Check the 'dist' directory for build artifacts"
}

# Run main function with all arguments
main "$@" 