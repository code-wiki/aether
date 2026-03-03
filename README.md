<div align="center">

# Aether

**Privacy-first multi-provider AI desktop client**

[![GitHub release](https://img.shields.io/github/v/release/code-wiki/aether?style=flat-square)](https://github.com/code-wiki/aether/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-28.2-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)

[Download](https://github.com/code-wiki/aether/releases) • [Documentation](./QUICKSTART.md) • [Report Bug](https://github.com/code-wiki/aether/issues)

</div>

---

## Overview

Aether is a native desktop application that provides a unified interface for multiple AI providers with complete data privacy. Built for professionals who value control, performance, and design.

**Why Aether exists:**

I built this because existing AI chat applications don't respect your privacy or give you real choice. Your conversations are too valuable to live on someone else's server, and you shouldn't be locked into a single AI provider.

Aether keeps everything local, lets you switch between the best AI models (Gemini, Claude, OpenAI), and gets out of your way with a clean, focused interface.

---

## Quick Start

### Installation

**macOS / Windows / Linux**
```bash
# Download the latest release
# https://github.com/code-wiki/aether/releases

# Or build from source
git clone https://github.com/code-wiki/aether.git
cd aether
npm install
npm run dev
```

### Configuration

**Option 1: Gemini (Free via GCP)**
```bash
gcloud auth application-default login
# Add your GCP Project ID in Settings → Providers
```

**Option 2: OpenAI**
```
Add your API key in Settings → Providers
```

Full setup guide: [`QUICKSTART.md`](./QUICKSTART.md)

---

## What You Get

**Three AI providers in one place**
- Gemini (with free GCP tier)
- Claude 3.5 Sonnet
- OpenAI GPT-4 and GPT-3.5

Switch between them instantly, or use different models for different tasks.

**Complete privacy**
- Everything stored locally using IndexedDB
- No cloud syncing, no telemetry, no tracking
- Works offline with full conversation search

**Built for daily use**
- Streaming responses so you see answers as they come in
- Attach files — images, PDFs, documents
- Export conversations to Markdown, HTML, or JSON
- Create custom AI personas for different workflows
- Keyboard shortcuts for everything
- Dark mode that syncs with your system

---

## Packages

### npm

```bash
npm install aether
```

### Desktop Releases

Platform-specific builds available on [GitHub Releases](https://github.com/code-wiki/aether/releases):

| Platform | Package | Architecture |
|----------|---------|--------------|
| **macOS** | `.dmg` | Intel + Apple Silicon (Universal) |
| **Windows** | `.exe` | x64 |
| **Linux** | `.AppImage` | x64 |

**Build commands:**
```bash
npm run build:mac     # macOS DMG
npm run build:win     # Windows Installer
npm run build:linux   # Linux AppImage
npm run build:all     # All platforms
```

---

## Architecture

```
electron/          Main process & IPC handlers
src/
  ├─ components/   React UI components
  ├─ services/     AI providers & storage layer
  ├─ context/      Application state
  └─ hooks/        Custom React hooks
```

**Key technologies:**
- Electron 28.2 — native desktop runtime
- React 18.2 + Vite — modern frontend tooling
- Tailwind CSS 3.4 — utility-first styling
- IndexedDB — persistent local storage
- Framer Motion — spring-based animations

---

## Development

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run pack             # Create distributable package
npm run release          # Build and publish release

npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run test             # Run test suite
```

---

## Documentation

- [`QUICKSTART.md`](./QUICKSTART.md) — Setup guide
- [`FEATURES.md`](./FEATURES.md) — Detailed feature list
- [`KEYBOARD_SHORTCUTS.md`](./KEYBOARD_SHORTCUTS.md) — Hotkey reference
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Development guidelines

---

## License

MIT © 2024 Aether

---

<div align="center">

**[↑ Back to top](#aether)**

</div>
