# Aether

> **Next-generation AI chatbot desktop application** with multi-provider support, local-first storage, and beautiful minimalistic design.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)

## ✨ Highlights

**Aether** is a powerful desktop AI chatbot that combines the best of multiple AI providers (Gemini, Claude, OpenAI) in a single, beautiful, privacy-focused application.

### Why Aether?

- 🌐 **Multi-Provider**: Switch between Gemini, Claude, and OpenAI seamlessly
- 🔒 **Privacy-First**: All data stored locally, never leaves your computer
- 💰 **FREE to Start**: Use Gemini via GCP free tier credits
- 🎨 **Beautiful UI**: Linear.app-inspired design with premium animations
- ⚡ **Real-Time Streaming**: See AI responses appear as they're generated
- 🔍 **Full-Text Search**: Find any conversation or message instantly
- 📤 **Export Anywhere**: Export to Markdown, HTML, Text, or JSON
- 🎭 **Custom Personas**: Create AI personalities for different tasks
- 📎 **File Attachments**: Upload images, PDFs, and documents
- 🌓 **Dark Mode**: Beautiful light and dark themes

### Design Philosophy

Aether's interface draws inspiration from [Linear.app](https://linear.app)'s refined design system:

- **Subtle Motion**: Spring-based animations that feel natural and responsive
- **Premium Glows**: Accent-colored shadows and focus states for depth
- **Refined Typography**: Optimized font sizes and letter spacing for readability
- **Micro-interactions**: Delightful hover states and transitions throughout
- **Accessible First**: Keyboard navigation, ARIA labels, and reduced motion support

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **GCP Account** (for free Gemini) OR **OpenAI API key**

### Installation

```bash
# Navigate to the aether directory
cd aether

# Install dependencies (already done if you cloned)
npm install

# Start development mode
npm run dev
```

### First-Time Setup

1. **Using Gemini (FREE)**:
   - Create a GCP project at https://console.cloud.google.com
   - Enable Vertex AI API
   - Run: `gcloud auth application-default login`
   - In Aether Settings: Enter your Project ID
   - Start chatting for free!

2. **Using OpenAI**:
   - Get API key from https://platform.openai.com/api-keys
   - In Aether Settings: Paste your API key
   - Start chatting with GPT models

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## 📋 Features

### Core Features
- ✅ **Multi-Provider AI** - Gemini, Claude (via Vertex AI), OpenAI
- ✅ **Real-Time Streaming** - Watch responses appear live
- ✅ **Local Storage** - IndexedDB for offline-first experience
- ✅ **Full-Text Search** - Search across all conversations
- ✅ **Export Options** - Markdown, HTML, Text, JSON
- ✅ **File Attachments** - Images, PDFs, text files
- ✅ **Code Highlighting** - Beautiful syntax highlighting with copy
- ✅ **Keyboard Shortcuts** - Power user features
- ✅ **Light/Dark Themes** - Automatic or manual toggle

### Advanced Features
- ✅ **Custom Personas** - Create AI personalities with system prompts
- ✅ **Usage Analytics** - Track conversations, tokens, and costs
- ✅ **Import/Export** - Backup and restore all conversations
- ✅ **Conversation Management** - Organize and delete old chats
- ✅ **Error Handling** - Graceful error recovery
- ✅ **Toast Notifications** - Non-intrusive feedback
- ✅ **Accessibility** - Keyboard navigation and ARIA labels

## 🎯 Comparison

| Feature | Aether | ChatGPT Desktop | Claude Desktop |
|---------|--------|-----------------|----------------|
| Multi-Provider | ✅ 3 providers | ❌ OpenAI only | ❌ Claude only |
| Local Storage | ✅ IndexedDB | ❌ Cloud-based | ❌ Cloud-based |
| Free Tier | ✅ Gemini via GCP | ❌ Limited | ❌ Limited |
| Export Formats | ✅ 4 formats | ⚠️ Limited | ⚠️ Limited |
| Custom Personas | ✅ Unlimited | ⚠️ Limited | ⚠️ Via Projects |
| Offline Search | ✅ Full-text | ❌ Online only | ❌ Online only |
| File Attachments | ✅ Multiple types | ✅ Images | ✅ Limited |
| Open Source | ✅ Possible | ❌ Closed | ❌ Closed |

## 🛠️ Tech Stack

- **Desktop**: Electron 28.2.0
- **Frontend**: React 18.2.0, Vite 5.1.0
- **Styling**: TailwindCSS 3.4.1
- **Storage**: IndexedDB (idb 7.1.1)
- **AI SDKs**:
  - @google-cloud/vertexai 1.1.0
  - openai 4.28.0
- **Markdown**: react-markdown, remark-gfm, rehype-highlight
- **Animations**: framer-motion 11.0.3

## ⌨️ Keyboard Shortcuts

- `Cmd/Ctrl + N` - New conversation
- `Cmd/Ctrl + K` - Focus search
- `Cmd/Ctrl + ,` - Open settings (macOS)
- `Cmd/Ctrl + Shift + T` - Toggle theme
- `Enter` - Send message
- `Shift + Enter` - New line
- `Esc` - Clear input / Cancel

## 📖 Documentation

- [**QUICKSTART.md**](./QUICKSTART.md) - Detailed setup guide
- [**FEATURES.md**](./FEATURES.md) - Complete feature list
- [**KEYBOARD_SHORTCUTS.md**](./KEYBOARD_SHORTCUTS.md) - All keyboard shortcuts
- [**CONTRIBUTING.md**](./CONTRIBUTING.md) - Contributing guidelines
- [**docs/guides/**](./docs/guides/) - Architecture, design system, and build guides
- [**docs/fixes/**](./docs/fixes/) - Historical bug fixes and solutions

## 🏗️ Project Structure

```
aether/
├── electron/               # Electron main process
│   ├── main.js            # Window management, IPC
│   ├── preload.js         # Secure bridge
│   └── menu.js            # Application menu
├── src/                   # React application
│   ├── components/        # UI components
│   │   ├── Chat/          # Chat interface
│   │   ├── Sidebar/       # Navigation
│   │   ├── Settings/      # Configuration
│   │   └── UI/            # Reusable components
│   ├── context/           # React Context
│   ├── services/          # Business logic
│   │   ├── ai/            # AI providers
│   │   └── storage/       # IndexedDB
│   └── hooks/             # Custom hooks
└── public/                # Static assets
```

## 🔧 Building

### Development
```bash
npm run dev
```

### Production Build
```bash
# Build for your platform
npm run build:mac      # macOS (.dmg)
npm run build:win      # Windows (.exe)
npm run build:linux    # Linux (.AppImage)
```

## 🤝 Contributing

This is currently a personal project. Feel free to fork and customize!

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Powered by [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- AI provided by Google (Gemini), Anthropic (Claude), and OpenAI

## 📧 Support

For issues or questions, check the documentation or create an issue.

---

**Built with ❤️ using Electron + React**

*Aether - Invisible, yet omnipresent intelligence*
