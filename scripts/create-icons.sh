#!/bin/bash

# Script to create app icons for all platforms
# Requires: ImageMagick (brew install imagemagick)

echo "Creating Aether app icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick not found. Install with: brew install imagemagick"
    exit 1
fi

# Create build directories
mkdir -p build/icons
mkdir -p build/icon.iconset

# Source icon (you'll need to create this as a 1024x1024 PNG)
SOURCE_ICON="public/logo.svg"

# Check if source exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Creating placeholder icon..."
    # Create a simple placeholder icon
    convert -size 1024x1024 xc:#00D4FF \
            -gravity center \
            -pointsize 400 \
            -fill white \
            -annotate +0+0 "A" \
            build/icon-1024.png
    SOURCE_ICON="build/icon-1024.png"
fi

echo "Generating macOS icons..."
# macOS iconset
for size in 16 32 64 128 256 512 1024; do
    convert "$SOURCE_ICON" -resize ${size}x${size} "build/icon.iconset/icon_${size}x${size}.png"
    if [ $size -le 512 ]; then
        convert "$SOURCE_ICON" -resize $((size*2))x$((size*2)) "build/icon.iconset/icon_${size}x${size}@2x.png"
    fi
done

# Create .icns file (macOS)
if command -v iconutil &> /dev/null; then
    iconutil -c icns build/icon.iconset -o build/icon.icns
    echo "✓ macOS icon created: build/icon.icns"
else
    echo "Warning: iconutil not found. Cannot create .icns file."
fi

echo "Generating Windows icon..."
# Windows .ico file (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
convert "$SOURCE_ICON" \
        \( -clone 0 -resize 256x256 \) \
        \( -clone 0 -resize 128x128 \) \
        \( -clone 0 -resize 64x64 \) \
        \( -clone 0 -resize 48x48 \) \
        \( -clone 0 -resize 32x32 \) \
        \( -clone 0 -resize 16x16 \) \
        -delete 0 build/icon.ico
echo "✓ Windows icon created: build/icon.ico"

echo "Generating Linux icons..."
# Linux icons (various sizes)
for size in 16 24 32 48 64 128 256 512; do
    convert "$SOURCE_ICON" -resize ${size}x${size} "build/icons/${size}x${size}.png"
done
echo "✓ Linux icons created: build/icons/"

echo ""
echo "Icon generation complete!"
echo "Files created:"
echo "  - build/icon.icns (macOS)"
echo "  - build/icon.ico (Windows)"
echo "  - build/icons/*.png (Linux)"
