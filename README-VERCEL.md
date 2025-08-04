# VoiceInk - Vercel Deployment Guide

## Overview
VoiceInk is a voice-to-text notes application with profile management, designed to work seamlessly on Vercel's platform.

## Deployment Steps

### 1. Prerequisites
- GitHub account with your VoiceInk repository
- Vercel account (free tier works)

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Choose deployment settings
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

### 3. Environment Variables
If your app requires any environment variables, add them in:
- Vercel Dashboard → Project → Settings → Environment Variables

### 4. Custom Domain (Optional)
- In Vercel Dashboard → Project → Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

## Project Structure
```
voiceink/
├── client/           # React frontend
├── server/          # Express backend (not used in Vercel)
├── api/             # Vercel serverless functions
├── vercel.json      # Vercel configuration
├── .vercelignore    # Files to ignore during deployment
└── build.sh         # Build script
```

## Features
- ✅ Voice recording and transcription
- ✅ Multi-profile support with password protection
- ✅ Dark/light theme switching
- ✅ Local storage for data persistence
- ✅ Responsive design
- ✅ Works offline (except voice transcription)

## Technical Notes
- **Frontend Only**: VoiceInk is primarily a client-side application
- **Local Storage**: All data is stored locally in the browser
- **Voice API**: Uses Web Speech API (requires HTTPS - Vercel provides this)
- **No Database**: No server-side database required
- **Static Hosting**: Perfect for Vercel's static hosting with serverless functions

## Browser Compatibility
- ✅ Chrome (recommended for voice features)
- ✅ Safari
- ✅ Edge
- ⚠️ Firefox (limited voice support)

## Support
For deployment issues, check:
1. Vercel deployment logs
2. Browser console for client-side errors
3. Ensure HTTPS is enabled for voice features