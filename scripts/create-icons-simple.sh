#!/bin/bash

# Simple icon creation script using macOS built-in tools
# Works without ImageMagick - uses sips (built into macOS)

echo "Creating Aether app icons..."

# Source icon
SOURCE_ICON="public/logos/aether-logo.png"

# Check if source exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon not found at $SOURCE_ICON"
    exit 1
fi

# Create build directories
mkdir -p build/icons
mkdir -p build/icon.iconset

echo "Generating macOS icons..."
# macOS iconset - required sizes
sips -z 16 16     "$SOURCE_ICON" --out build/icon.iconset/icon_16x16.png > /dev/null 2>&1
sips -z 32 32     "$SOURCE_ICON" --out build/icon.iconset/icon_16x16@2x.png > /dev/null 2>&1
sips -z 32 32     "$SOURCE_ICON" --out build/icon.iconset/icon_32x32.png > /dev/null 2>&1
sips -z 64 64     "$SOURCE_ICON" --out build/icon.iconset/icon_32x32@2x.png > /dev/null 2>&1
sips -z 128 128   "$SOURCE_ICON" --out build/icon.iconset/icon_128x128.png > /dev/null 2>&1
sips -z 256 256   "$SOURCE_ICON" --out build/icon.iconset/icon_128x128@2x.png > /dev/null 2>&1
sips -z 256 256   "$SOURCE_ICON" --out build/icon.iconset/icon_256x256.png > /dev/null 2>&1
sips -z 512 512   "$SOURCE_ICON" --out build/icon.iconset/icon_256x256@2x.png > /dev/null 2>&1
sips -z 512 512   "$SOURCE_ICON" --out build/icon.iconset/icon_512x512.png > /dev/null 2>&1
sips -z 1024 1024 "$SOURCE_ICON" --out build/icon.iconset/icon_512x512@2x.png > /dev/null 2>&1

# Create .icns file (macOS)
if command -v iconutil &> /dev/null; then
    iconutil -c icns build/icon.iconset -o build/icon.icns
    echo "✓ macOS icon created: build/icon.icns"
else
    echo "Error: iconutil not found (should be built into macOS)"
    exit 1
fi

echo "Generating Linux icons..."
# Linux icons (various sizes)
for size in 16 24 32 48 64 128 256 512; do
    sips -z $size $size "$SOURCE_ICON" --out "build/icons/${size}x${size}.png" > /dev/null 2>&1
done
echo "✓ Linux icons created: build/icons/"

# For Windows .ico, we'll need to install a package
echo ""
echo "Note: Windows .ico file requires additional tooling."
echo "Installing png-to-ico package..."
npm install --save-dev png-to-ico

echo ""
echo "Icon generation complete!"
echo "Files created:"
echo "  - build/icon.icns (macOS)"
echo "  - build/icons/*.png (Linux)"
echo ""
echo "To create Windows icon, run: npm run create-ico"
