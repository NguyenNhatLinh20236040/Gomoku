// =============================================
// matches.js — REST API routes cho matches & moves
// =============================================

import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// --- Validation helpers ---
const VALID_MODES = ['local', 'ai'];
const VALID_RULES = ['gomoku3', 'gomoku4', 'gomoku5', 'renju'];
const VALID_AI_LEVELS = ['easy', 'medium', 'hard'];
const VALID_PLAYERS = ['X', 'O'];
const BOARD_SIZE = 15;

// =============================================
// POST /api/matches — Tạo trận đấu mới
// =============================================
router.post('/', (req, res) => {
  try {
    const { mode = 'local', rule = 'gomoku5', ai_level = null } = req.body;

    // Validate mode
    if (!VALID_MODES.includes(mode)) {
      return res.status(400).json({
        data: null,
        error: `Invalid mode. Must be one of: ${VALID_MODES.join(', ')}`
      });
    }

    // Validate rule
    if (!VALID_RULES.includes(rule)) {
      return res.status(400).json({
        data: null,
        error: `Invalid rule. Must be one of: ${VALID_RULES.join(', ')}`
      });
    }

    // Validate ai_level
    if (mode === 'ai' && !VALID_AI_LEVELS.includes(ai_level)) {
      return res.status(400).json({
        data: null,
        error: `AI level required for AI mode. Must be one of: ${VALID_AI_LEVELS.join(', ')}`
      });
    }

    const stmt = db.prepare(`
      INSERT INTO matches (mode, rule, ai_level)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(mode, rule, mode === 'ai' ? ai_level : null);

    // Lấy match vừa tạo
    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ data: match, error: null });
  } catch (err) {
    console.error('POST /matches error:', err);
    res.status(500).json({ data: null, error: 'Internal server error' });
  }
});

// =============================================
// GET /api/matches — Danh sách trận đấu
// =============================================
router.get('/', (req, res) => {
  try {
    const { mode, rule, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM matches';
    const conditions = [];
    const params = [];

    if (mode) {
      conditions.push('mode = ?');
      params.push(mode);
    }
    if (rule) {
      conditions.push('rule = ?');
      params.push(rule);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY started_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const matches = db.prepare(query).all(...params);

    res.json({ data: matches, error: null });
  } catch (err) {
    console.error('GET /matches error:', err);
    res.status(500).json({ data: null, error: 'Internal server error' });
  }
});

// =============================================
// GET /api/matches/:id — Chi tiết trận + moves
// =============================================
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);

    if (!match) {
      return res.status(404).json({ data: null, error: 'Match not found' });
    }

    const moves = db.prepare(
      'SELECT turn, player, row, col, played_at FROM moves WHERE match_id = ? ORDER BY turn'
    ).all(id);

    res.json({ data: { match, moves }, error: null });
  } catch (err) {
    console.error('GET /matches/:id error:', err);
    res.status(500).json({ data: null, error: 'Internal server error' });
  }
});

// =============================================
// POST /api/matches/:id/moves — Ghi nước đi
// =============================================
router.post('/:id/moves', (req, res) => {
  try {
    const { id } = req.params;
    const { row, col, player, turn } = req.body;

    // Validate match tồn tại
    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
    if (!match) {
      return res.status(404).json({ data: null, error: 'Match not found' });
    }

    // Validate match chưa kết thúc
    if (match.winner) {
      return res.status(409).json({ data: null, error: 'Match already ended' });
    }

    // Validate player
    if (!VALID_PLAYERS.includes(player)) {
      return res.status(400).json({
        data: null,
        error: `Invalid player. Must be 'X' or 'O'`
      });
    }

    // Validate row/col
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return res.status(400).json({
        data: null,
        error: `Invalid position. Row and col must be 0-${BOARD_SIZE - 1}`
      });
    }

    // Validate ô chưa có quân
    const existingMove = db.prepare(
      'SELECT id FROM moves WHERE match_id = ? AND row = ? AND col = ?'
    ).get(id, row, col);

    if (existingMove) {
      return res.status(409).json({ data: null, error: 'Cell already occupied' });
    }

    // Ghi nước đi
    const stmt = db.prepare(`
      INSERT INTO moves (match_id, turn, player, row, col)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(id, turn, player, row, col);

    // Cập nhật total_moves
    db.prepare('UPDATE matches SET total_moves = total_moves + 1 WHERE id = ?').run(id);

    const move = db.prepare('SELECT * FROM moves WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ data: move, error: null });
  } catch (err) {
    console.error('POST /matches/:id/moves error:', err);
    res.status(500).json({ data: null, error: 'Internal server error' });
  }
});

// =============================================
// PATCH /api/matches/:id — Cập nhật kết quả trận
// =============================================
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { winner } = req.body;

    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
    if (!match) {
      return res.status(404).json({ data: null, error: 'Match not found' });
    }

    if (!['X', 'O', 'DRAW'].includes(winner)) {
      return res.status(400).json({
        data: null,
        error: "Invalid winner. Must be 'X', 'O', or 'DRAW'"
      });
    }

    db.prepare(`
      UPDATE matches SET winner = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(winner, id);

    const updated = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
    res.json({ data: updated, error: null });
  } catch (err) {
    console.error('PATCH /matches/:id error:', err);
    res.status(500).json({ data: null, error: 'Internal server error' });
  }
});

// =============================================
// DELETE /api/matches/:id — Xóa trận đấu
// =============================================
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
    if (!match) {
      return res.status(404).json({ data: null, error: 'Match not found' });
    }

    // CASCADE sẽ xóa moves liên quan
    db.prepare('DELETE FROM matches WHERE id = ?').run(id);

    res.json({ data: { deleted: true }, error: null });
  } catch (err) {
    console.error('DELETE /matches/:id error:', err);
    res.status(500).json({ data: null, error: 'Internal server error' });
  }
});

export default router;
