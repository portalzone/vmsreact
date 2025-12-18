#!/bin/bash

# Simple Installation Script for Missing React Pages
# Run this from your vms-frontend-react directory

echo "🚀 Installing All Missing React Pages..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in React project directory!"
    echo ""
    echo "Please navigate to your project first:"
    echo "  cd /Users/portalzone/Desktop/reactvms/vms/vms-frontend-react"
    echo "  bash install_complete_pages.sh"
    exit 1
fi

# Check if archive exists
ARCHIVE_PATH="$HOME/Downloads/missing-react-pages-complete.tar.gz"

if [ ! -f "$ARCHIVE_PATH" ]; then
    echo "❌ Error: Archive not found at $ARCHIVE_PATH"
    echo ""
    echo "Please download missing-react-pages-complete.tar.gz first!"
    exit 1
fi

echo "📦 Extracting files..."
tar -xzf "$ARCHIVE_PATH" -C /tmp/

echo "📁 Copying pages to src/pages/..."
cp -r /tmp/missing-pages/* src/pages/

echo "🧹 Cleaning up..."
rm -rf /tmp/missing-pages

echo ""
echo "✅ Installation Complete!"
echo ""
echo "📋 Files Installed:"
echo "   - 9 main pages"
echo "   - 3 Drivers pages"
echo "   - 3 Vehicles pages"
echo "   - 2 CheckIns pages"
echo "   - 2 Maintenance pages"
echo "   - 2 Expenses pages"
echo "   - 2 Income pages"
echo "   - 2 Trips pages"
echo "   - 2 Users pages"
echo "   - 1 Audit page"
echo "   - 1 Profile page"
echo ""
echo "🎯 Next Steps:"
echo "   1. Make sure Laravel backend is running:"
echo "      cd /Users/portalzone/Desktop/reactvms/vms"
echo "      php artisan serve"
echo ""
echo "   2. Start React development server:"
echo "      npm run dev"
echo ""
echo "   3. Open http://localhost:5173"
echo ""
echo "🎉 You're all set! No more import errors!"
