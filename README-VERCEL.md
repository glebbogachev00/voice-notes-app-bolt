# Voice Notes App - Vercel Deployment

This is a voice-to-text notes application built with React, TypeScript, and Vite, optimized for deployment on Vercel.

## Features

- Voice recording and transcription using Web Speech API
- Multiple user profiles with password protection
- Dark/light theme toggle
- Local storage for notes persistence
- Responsive design with Tailwind CSS

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Deployment to Vercel

1. Push your code to a GitHub repository

2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the Vite configuration

3. Deploy settings (should be auto-detected):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Click "Deploy"

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript type definitions
│   └── index.html
├── api/                   # Vercel serverless functions
│   └── index.ts          # API routes
├── shared/               # Shared types and schemas
├── vite.config.ts        # Vite configuration
├── vercel.json          # Vercel deployment configuration
└── package.json
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/notes` - Get notes (currently returns empty array, uses localStorage)
- `POST /api/notes` - Save notes (currently acknowledges request, uses localStorage)

## Notes

- The app uses localStorage for data persistence, so notes are stored locally in the browser
- Voice transcription requires internet access for Google's Web Speech API
- All user profiles and notes are stored client-side for privacy

## Environment Variables

No environment variables are required for basic functionality. If you want to add database storage later, you can add:

- `DATABASE_URL` - For database connection
- `JWT_SECRET` - For authentication tokens