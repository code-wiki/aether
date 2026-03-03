# Aether - Quick Start Guide

Welcome to **Aether**, your next-generation AI desktop chatbot! This guide will help you get started in minutes.

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- GCP account (for free Gemini credits) OR OpenAI API key

## Installation

1. Navigate to the aether directory:
```bash
cd /Users/aditya.gautam/Desktop/Dev/Personal/aether
```

2. Dependencies are already installed! If you need to reinstall:
```bash
npm install
```

## Running the App

Start the development server:
```bash
npm run dev
```

This will:
- Start Vite dev server on port 5173
- Launch Electron desktop window
- Enable hot reload for instant updates

## Initial Setup

### Option 1: Using Gemini (FREE with GCP Credits)

1. **Create GCP Project**:
   - Go to https://console.cloud.google.com
   - Create a new project
   - Note your Project ID

2. **Enable Vertex AI API**:
   - In GCP Console, go to "APIs & Services" → "Library"
   - Search for "Vertex AI API"
   - Click "Enable"

3. **Set up Authentication** (Choose one):

   **Method A: Application Default Credentials (Easiest for development)**
   ```bash
   gcloud auth application-default login
   ```

   **Method B: Service Account (Recommended for production)**
   - Create a service account with "Vertex AI User" role
   - Download the JSON key file
   - Save it somewhere secure (e.g., `~/gcp-credentials/aether-sa.json`)

4. **Configure in Aether**:
   - Launch Aether
   - Click "Settings" (gear icon in sidebar)
   - Under "GCP Configuration":
     - Enter your Project ID
     - Select Location (default: us-central1 works great)
     - If using service account, enter the full path to your JSON file
   - Click "Done"

5. **Start Chatting**:
   - Click "+ New Chat"
   - Select Gemini from provider dropdown
   - Choose "Gemini 1.5 Flash" (fastest, free tier friendly)
   - Start typing!

### Option 2: Using OpenAI (GPT-4o)

1. **Get API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy it (starts with `sk-`)

2. **Configure in Aether**:
   - Launch Aether
   - Click "Settings"
   - Under "API Keys":
     - Paste your OpenAI API key
   - Click "Done"

3. **Start Chatting**:
   - Click "+ New Chat"
   - Select OpenAI from provider dropdown
   - Choose model (GPT-4o Mini is fast and affordable)
   - Start typing!

### Option 3: Using Claude via Vertex AI

1. Follow the GCP setup steps from Option 1
2. Claude via Vertex AI requires the same GCP credentials
3. Select "Claude" from provider dropdown
4. Choose "Claude 3.5 Sonnet" for best results

## Using Aether

### Creating Conversations
- Click "+ New Chat" in the sidebar
- Each conversation maintains its own context

### Switching Providers
- Click the provider/model dropdown in the chat header
- Switch between Gemini, Claude, and OpenAI anytime
- Each conversation remembers its provider

### Keyboard Shortcuts
- `Cmd/Ctrl + N` - New conversation
- `Cmd/Ctrl + Shift + T` - Toggle dark/light theme
- `Enter` - Send message
- `Shift + Enter` - New line in message

### Theme Toggle
- Click the moon/sun icon in sidebar
- Aether remembers your preference

## Free Tier Limits

### Gemini (via Vertex AI)
- **gemini-1.5-flash**: 15 requests/minute (free tier)
- **gemini-1.5-pro**: 5 requests/minute
- Free $300 GCP credits for new users

### Claude (via Vertex AI)
- Uses GCP credits
- No free tier, but uses your $300 free credits

### OpenAI
- Requires payment
- **gpt-4o-mini**: ~$0.15 per 1M input tokens
- **gpt-4o**: ~$2.50 per 1M input tokens

## Troubleshooting

### "GCP Project ID is required"
- Make sure you've entered your Project ID in Settings
- Verify Vertex AI API is enabled in GCP Console

### "OpenAI API key is required"
- Check that you've entered your API key in Settings
- Verify the key starts with `sk-`

### Authentication Errors (GCP)
- If using Application Default Credentials, run:
  ```bash
  gcloud auth application-default login
  ```
- If using service account, verify the path is correct
- Make sure your service account has "Vertex AI User" role

### Rate Limit Errors
- Gemini Flash: Wait 1 minute, then retry
- Reduce message frequency
- Consider upgrading to paid tier

## Building for Production

Build for your platform:

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

Installers will be in the `release/` directory.

## Tips for Best Experience

1. **Start with Gemini 1.5 Flash** - It's free and fast!
2. **Use Dark Mode** - Toggle with moon icon for eye comfort
3. **Keep conversations focused** - Create new chats for different topics
4. **Try all providers** - Each has unique strengths
5. **Watch your usage** - Check GCP Console for credit usage

## Getting Help

- Check the README.md for detailed documentation
- Review console logs in dev mode (`Cmd/Ctrl + Shift + I`)
- Ensure all dependencies are installed

## What's Next?

Explore the features:
- Multi-provider switching
- Conversation history
- Markdown rendering with syntax highlighting
- Export conversations (coming soon)
- Custom personas (coming soon)

---

Enjoy your AI-powered conversations with **Aether**! 🚀
