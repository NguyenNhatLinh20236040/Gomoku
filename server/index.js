// =============================================
// index.js — Express Server Entry Point
// =============================================
// Gomoku Backend Server
// Port: 3001 (tránh trùng Vite dev server 5173)

import express from 'express';
import cors from 'cors';
import matchesRouter from './routes/matches.js';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ===== REQUEST LOGGING =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====
app.use('/api/matches', matchesRouter);
app.use('/api/ai', aiRouter);

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== ROOT =====
app.get('/', (req, res) => {
  res.json({
    name: 'Gomoku API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      matches: 'GET /api/matches',
      createMatch: 'POST /api/matches',
      matchDetail: 'GET /api/matches/:id',
      addMove: 'POST /api/matches/:id/moves',
      aiMove: 'POST /api/ai/move',
      aiHint: 'POST /api/ai/hint'
    }
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ data: null, error: `Route ${req.method} ${req.path} not found` });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ data: null, error: 'Internal server error' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`\n🎮 Gomoku Server running at http://localhost:${PORT}`);
  console.log(`📋 API docs: http://localhost:${PORT}/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
});
