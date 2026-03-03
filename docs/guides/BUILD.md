# Building Aether

This guide explains how to build Aether for distribution across all platforms.

## Prerequisites

### All Platforms
- Node.js 18+ and npm 9+
- Git

### macOS
- Xcode Command Line Tools: `xcode-select --install`
- (Optional) Apple Developer Account for code signing

### Windows
- Visual Studio Build Tools or Visual Studio with C++ support
- (Optional) Windows SDK for signing

### Linux
- Standard build tools: `sudo apt-get install build-essential`

## Quick Build

```bash
# Install dependencies
npm install

# Build for your current platform
npm run build:mac      # macOS only
npm run build:win      # Windows only
npm run build:linux    # Linux only

# Build for all platforms (requires proper setup)
npm run build:all
```

## Detailed Build Instructions

### 1. Prepare Icons

First, generate app icons for all platforms:

```bash
# Requires ImageMagick
brew install imagemagick  # macOS
# or
sudo apt-get install imagemagick  # Linux

# Generate icons
npm run icons
```

This creates:
- `build/icon.icns` (macOS)
- `build/icon.ico` (Windows)
- `build/icons/*.png` (Linux)

### 2. Build for macOS

```bash
npm run build:mac
```

**Output:**
- `release/Aether-1.0.0-mac-x64.dmg` (Intel)
- `release/Aether-1.0.0-mac-arm64.dmg` (Apple Silicon)
- `release/Aether-1.0.0-mac.zip` (Universal)

**Code Signing (Optional):**
1. Get Apple Developer Certificate
2. Set environment variables:
   ```bash
   export APPLE_ID="your-apple-id@example.com"
   export APPLE_ID_PASSWORD="app-specific-password"
   export APPLE_TEAM_ID="YOUR_TEAM_ID"
   ```
3. Run: `npm run build:mac`

**Notarization:**
- Automatic if environment variables are set
- See `scripts/notarize.js` for details

### 3. Build for Windows

```bash
npm run build:win
```

**Output:**
- `release/Aether-Setup-1.0.0-x64.exe` (Installer)
- `release/Aether-1.0.0-x64.exe` (Portable)
- `release/Aether-Setup-1.0.0-ia32.exe` (32-bit)

**Code Signing (Optional):**
1. Get Code Signing Certificate (.pfx)
2. Set environment variables:
   ```bash
   set CSC_LINK=C:\path\to\certificate.pfx
   set CSC_KEY_PASSWORD=certificate-password
   ```
3. Run: `npm run build:win`

### 4. Build for Linux

```bash
npm run build:linux
```

**Output:**
- `release/Aether-1.0.0-x64.AppImage` (Universal)
- `release/aether_1.0.0_amd64.deb` (Debian/Ubuntu)
- `release/aether-1.0.0.x86_64.rpm` (Red Hat/Fedora)

**Installation:**
```bash
# AppImage
chmod +x Aether-1.0.0-x64.AppImage
./Aether-1.0.0-x64.AppImage

# Debian/Ubuntu
sudo dpkg -i aether_1.0.0_amd64.deb

# Red Hat/Fedora
sudo rpm -i aether-1.0.0.x86_64.rpm
```

## Build Configuration

### electron-builder.json

The main build configuration file. Key sections:

```json
{
  "appId": "com.aether.app",
  "productName": "Aether",
  "compression": "maximum",
  "directories": {
    "output": "release"
  }
}
```

### Customization

Edit `electron-builder.json` to customize:
- App ID and name
- File associations
- Install locations
- Update server URLs
- Build targets

## Publishing Releases

### Manual Release

1. Build for all platforms:
   ```bash
   npm run build:all
   ```

2. Upload files from `release/` to your distribution platform

### Automated Release (GitHub Actions)

1. Push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions automatically:
   - Builds for all platforms
   - Creates a draft release
   - Uploads installers

3. Review and publish the draft release

## Auto-Updates

### Setup

1. Choose update provider (GitHub, S3, etc.)

2. Update `electron-builder.json`:
   ```json
   "publish": {
     "provider": "github",
     "owner": "code-wiki",
     "repo": "aether"
   }
   ```

3. In your app, use `electron-updater`:
   ```javascript
   const { autoUpdater } = require('electron-updater');
   autoUpdater.checkForUpdatesAndNotify();
   ```

### Testing Updates

1. Build version 1.0.0: `npm run build:mac`
2. Install and run
3. Bump version to 1.0.1 in package.json
4. Build version 1.0.1: `npm run build:mac`
5. Publish v1.0.1
6. App should auto-update

## Troubleshooting

### macOS: "App is damaged"
- Disable Gatekeeper temporarily: `sudo spctl --master-disable`
- Or sign the app properly with a Developer Certificate

### Windows: SmartScreen warning
- Code sign the app with a valid certificate
- Or users can click "More info" → "Run anyway"

### Linux: AppImage won't run
- Make executable: `chmod +x Aether-*.AppImage`
- Install FUSE: `sudo apt-get install fuse`

### Build fails with native modules
- Rebuild for Electron: `npm rebuild --runtime=electron --target=28.2.0`

### "Command not found: electron-builder"
- Reinstall: `npm install --save-dev electron-builder`

## Build Sizes

Approximate installer sizes:
- **macOS**: ~150-200 MB (DMG)
- **Windows**: ~120-150 MB (EXE)
- **Linux**: ~130-160 MB (AppImage)

## Performance Tips

1. **Smaller builds:**
   - Use `compression: "maximum"` in electron-builder.json
   - Remove unused dependencies
   - Use `--publish never` during development

2. **Faster builds:**
   - Build for single platform during development
   - Use `npm run pack` to skip compression
   - Cache dependencies in CI/CD

3. **Cross-platform builds:**
   - macOS can build for all platforms
   - Windows can build for Windows and Linux
   - Linux can build for Linux and Windows only

## Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Test on all target platforms
- [ ] Generate fresh icons
- [ ] Update screenshots/documentation
- [ ] Build for all platforms
- [ ] Test installers
- [ ] Code sign (macOS/Windows)
- [ ] Notarize (macOS)
- [ ] Create GitHub release
- [ ] Update website/download links

## Resources

- [electron-builder docs](https://www.electron.build/)
- [Code signing guide](https://www.electron.build/code-signing)
- [Auto-updates guide](https://www.electron.build/auto-update)
- [Publishing guide](https://www.electron.build/configuration/publish)

## Support

For build issues, check:
1. Build logs in `release/builder-*.log`
2. GitHub Actions logs (if using CI/CD)
3. electron-builder documentation

---

**Happy Building! 🚀**
