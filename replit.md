# VoiceInk Application

## Project Overview
VoiceInk is a voice-to-text notes application with multi-user support and profile management. The app allows users to record audio, transcribe it to text, and manage multiple profiles with optional password protection.

## Architecture
- **Frontend**: React with TypeScript using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: In-memory storage (MemStorage) for development
- **Authentication**: Profile-based system with optional passwords

## Key Features
- Voice recording and transcription using Web Speech API
- Multi-profile support with optional password protection
- Dark/light theme switching
- Local storage for notes and profiles
- Real-time transcription display
- Note saving and management

## Recent Changes
- Migrated from Bolt to Replit environment
- Fixed syntax errors in component files caused by HTML parameter tags
- Enhanced voice recording error handling with clear user guidance
- Rebranded application from "Voice Notes" to "VoiceInk"
- Updated all localStorage keys and branding throughout the app

## User Preferences
- No specific preferences recorded yet

## Development Notes
- Uses localStorage for data persistence
- Client-side only application with minimal backend
- Follows Replit fullstack JavaScript guidelines