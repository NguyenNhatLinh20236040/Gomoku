// =============================================
// ai.js — AI API stubs (tuần 28-30)
// =============================================
// Stub endpoints cho AI. Sẽ implement logic thật
// ở tuần 31+ (Easy, Medium, Hard).

import { Router } from 'express';

const router = Router();
const BOARD_SIZE = 15;

// =============================================
// POST /api/ai/move — AI đánh nước
// =============================================
// Stub: Level easy = random ô trống
// TODO (tuần 31): Medium - heuristic
// TODO (tuần 34): Hard - Minimax + Alpha-Beta
router.post('/move', (req, res) => {
  try {
    const { board, currentPlayer, level = 'easy' } = req.body;

    // Validate board
    if (!board || !Array.isArray(board) || board.length !== BOARD_SIZE) {
      return res.status(400).json({
        data: null,
        error: 'Invalid board. Must be 15x15 array'
      });
    }

    // Validate player
    if (!['X', 'O'].includes(currentPlayer)) {
      return res.status(400).json({
        data: null,
        error: "Invalid currentPlayer. Must be 'X' or 'O'"
      });
    }

    // Tìm tất cả ô trống
    const emptyCells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === null || board[r][c] === '') {
          emptyCells.push({ row: r, col: c });
        }
      }
    }

    if (emptyCells.length === 0) {
      return res.status(400).json({
        data: null,
        error: 'No empty cells available'
      });
    }

    let selectedMove;

    if (level === 'easy') {
      // Easy: Random ô trống
      selectedMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else {
      // Medium/Hard: Stub — ưu tiên ô gần trung tâm hoặc gần quân đã đánh
      // TODO: Implement proper AI logic later
      selectedMove = findNearbyMove(board, emptyCells);
    }

    res.json({
      data: {
        row: selectedMove.row,
        col: selectedMove.col
      },
      error: null
    });
  } catch (err) {
    console.error('POST /ai/move error:', err);
    res.status(500).json({ data: null, error: 'Internal server error' });
  }
});

// =============================================
// POST /api/ai/hint — Gợi ý nước đi
// =============================================
// Stub: Chọn ô trống gần quân đã đánh nhất
router.post('/hint', (req, res) => {
  try {
    const { board, currentPlayer, rule = 'gomoku5' } = req.body;

    if (!board || !Array.isArray(board) || board.length !== BOARD_SIZE) {
      return res.status(400).json({
        data: null,
        error: 'Invalid board. Must be 15x15 array'
      });
    }

    // Tìm tất cả ô trống
    const emptyCells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === null || board[r][c] === '') {
          emptyCells.push({ row: r, col: c });
        }
      }
    }

    if (emptyCells.length === 0) {
      return res.status(400).json({
        data: null,
        error: 'No empty cells available'
      });
    }

    // Tìm ô gần quân đã đánh nhất
    const hint = findNearbyMove(board, emptyCells);

    res.json({
      data: {
        row: hint.row,
        col: hint.col,
        reason: 'Ô gần quân đã đánh — gợi ý cơ bản (stub)'
      },
      error: null
    });
  } catch (err) {
    console.error('POST /ai/hint error:', err);
    res.status(500).json({ data: null, error: 'Internal server error' });
  }
});

// =============================================
// Helper: Tìm ô trống gần quân đã đánh nhất
// =============================================
function findNearbyMove(board, emptyCells) {
  // Tìm các ô đã có quân
  const occupiedCells = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null && board[r][c] !== '') {
        occupiedCells.push({ row: r, col: c });
      }
    }
  }

  // Nếu bàn cờ trống, chọn trung tâm
  if (occupiedCells.length === 0) {
    return { row: 7, col: 7 };
  }

  // Tính khoảng cách nhỏ nhất từ mỗi ô trống đến quân gần nhất
  let bestCell = emptyCells[0];
  let bestDist = Infinity;

  for (const empty of emptyCells) {
    let minDist = Infinity;
    for (const occupied of occupiedCells) {
      const dist = Math.abs(empty.row - occupied.row) + Math.abs(empty.col - occupied.col);
      if (dist < minDist) minDist = dist;
    }
    if (minDist < bestDist) {
      bestDist = minDist;
      bestCell = empty;
    }
  }

  return bestCell;
}

export default router;
