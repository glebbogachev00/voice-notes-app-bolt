#!/bin/bash

# Build script for Vercel deployment
echo "Building VoiceInk for Vercel deployment..."

# Install dependencies
npm ci

# Build the frontend
echo "Building frontend..."
npm run build

# Create deployment structure
echo "Setting up deployment structure..."
mkdir -p dist/client
cp -r client/dist/* dist/client/

echo "Build completed successfully!"