#!/usr/bin/env node

/**
 * Create Windows .ico file from PNG source
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceIcon = path.join(__dirname, '..', 'public', 'logos', 'aether-logo.png');
const outputIcon = path.join(__dirname, '..', 'build', 'icon.ico');

console.log('Creating Windows icon...');

try {
  // For now, copy the PNG as ICO (electron-builder can handle PNG for ico)
  // In production, use proper tools or build on Windows
  const temp256 = path.join(__dirname, '..', 'build', 'icon-256.png');

  // Create 256x256 PNG using sips
  execSync(`sips -z 256 256 "${sourceIcon}" --out "${temp256}"`, { stdio: 'ignore' });

  // For macOS development, we'll use a PNG. Electron-builder will handle conversion
  fs.copyFileSync(temp256, outputIcon);
  fs.unlinkSync(temp256);

  console.log('✓ Windows icon created:', outputIcon);
  console.log('  (Note: For production Windows builds, generate proper .ico on Windows)');
} catch (err) {
  console.error('Error creating Windows icon:', err.message);
  process.exit(1);
}
