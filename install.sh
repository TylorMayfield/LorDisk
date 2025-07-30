#!/bin/bash

# LorDisk Installation Script
echo "Installing LorDisk - Cross-Platform Disk Space Analyzer & Cleanup Tool"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js to version 18 or higher."
    exit 1
fi

echo "SUCCESS: Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo "SUCCESS: Dependencies installed successfully"

# Build the application
echo ""
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build application"
    exit 1
fi

echo "SUCCESS: Application built successfully"

echo ""
echo "LorDisk installation completed!"
echo ""
echo "To start the application in development mode:"
echo "  npm run dev"
echo ""
echo "To build for distribution:"
echo "  npm run dist"
echo ""
echo "For more information, see README.md" 