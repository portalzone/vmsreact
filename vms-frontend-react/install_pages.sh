#!/bin/bash

# Quick Install Script for Missing React Pages
# This script copies all missing page files to your React project

echo "🚀 Installing Missing React Pages..."
echo ""

# Check if we're in the React project directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from your vms-frontend-react directory"
    echo ""
    echo "Example:"
    echo "  cd /Users/portalzone/Desktop/reactvms/vms/vms-frontend-react"
    echo "  bash install_pages.sh"
    exit 1
fi

# Check if src/pages directory exists
if [ ! -d "src/pages" ]; then
    echo "📁 Creating src/pages directory..."
    mkdir -p src/pages
fi

# Create all subdirectories
echo "📁 Creating page directories..."
mkdir -p src/pages/Drivers
mkdir -p src/pages/Vehicles
mkdir -p src/pages/CheckIns
mkdir -p src/pages/Maintenance
mkdir -p src/pages/Expenses
mkdir -p src/pages/Income
mkdir -p src/pages/Trips
mkdir -p src/pages/Users
mkdir -p src/pages/Audit
mkdir -p src/pages/Profile

echo "✅ Directories created!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Extract the missing-react-pages.tar.gz file you downloaded"
echo "2. Copy all .jsx files from the extracted 'missing-pages' folder to src/pages/"
echo ""
echo "Or manually copy files following the structure in INSTALL_MISSING_PAGES.md"
echo ""
echo "Directory structure ready:"
tree src/pages -L 2 2>/dev/null || ls -R src/pages

echo ""
echo "🎉 Done! Now copy the page files and run: npm run dev"
