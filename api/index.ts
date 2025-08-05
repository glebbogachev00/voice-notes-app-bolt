// Vercel serverless function entry point
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for Vercel deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Notes API endpoints (if you want server-side storage)
app.get('/api/notes', (req, res) => {
  // For now, return empty array since you're using localStorage
  // You can implement database storage here later
  res.json([]);
});

app.post('/api/notes', (req, res) => {
  // For now, just acknowledge the request
  // You can implement database storage here later
  res.json({ success: true, message: 'Note saved (client-side storage)' });
});

// Export for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};