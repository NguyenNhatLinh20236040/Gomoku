// ==========================================
// aiEngine.js - AI Engine cho Gomoku
// ==========================================
// Cung cấp 2 level AI:
//   Easy   — chọn random ô gần các quân đã có
//   Medium — minimax + alpha-beta + heuristic
// ==========================================

import { BOARD_SIZE, WIN_COUNT, checkWin } from './checkWin';

// ===== CONSTANTS =====
const DIRECTIONS = [
  [0, 1],   // ngang →
  [1, 0],   // dọc ↓
  [1, 1],   // chéo chính ↘
  [1, -1],  // chéo phụ ↗
];

// Điểm heuristic cho từng pattern
const SCORES = {
  FIVE:       100000,   // 5 liên tiếp → thắng
  OPEN_FOUR:  10000,    // 4 mở 2 đầu → gần thắng
  HALF_FOUR:  1000,     // 4 bịt 1 đầu
  OPEN_THREE: 1000,     // 3 mở 2 đầu
  HALF_THREE: 100,      // 3 bịt 1 đầu
  OPEN_TWO:   100,      // 2 mở 2 đầu
  HALF_TWO:   10,       // 2 bịt 1 đầu
};

const MINIMAX_DEPTH = 3;      // Độ sâu minimax
const CANDIDATE_RADIUS = 2;   // Bán kính tìm ô ứng viên

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Kiểm tra tọa độ có nằm trong bàn cờ không
 */
function inBounds(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

/**
 * Tìm các ô trống gần quân đã đặt (bán kính radius)
 * Giúp giảm search space đáng kể
 */
function getCandidateMoves(board, radius = CANDIDATE_RADIUS) {
  const candidates = new Set();
  let hasAnyPiece = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        hasAnyPiece = true;
        // Tìm ô trống xung quanh
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (inBounds(nr, nc) && board[nr][nc] === null) {
              candidates.add(`${nr},${nc}`);
            }
          }
        }
      }
    }
  }

  // Nếu bàn cờ trống, đánh vào giữa
  if (!hasAnyPiece) {
    const center = Math.floor(BOARD_SIZE / 2);
    return [{ row: center, col: center }];
  }

  return Array.from(candidates).map(key => {
    const [r, c] = key.split(',').map(Number);
    return { row: r, col: c };
  });
}

/**
 * Đếm pattern theo 1 hướng từ vị trí (row, col)
 * Trả về { count, openEnds }
 *   count    = số quân liên tiếp (bao gồm vị trí hiện tại)
 *   openEnds = số đầu mở (0, 1, hoặc 2)
 */
function countDirection(board, row, col, dr, dc, player) {
  let count = 1;
  let openEnds = 0;

  // Đếm hướng thuận
  let r = row + dr;
  let c = col + dc;
  while (inBounds(r, c) && board[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }
  // Kiểm tra đầu mở hướng thuận
  if (inBounds(r, c) && board[r][c] === null) {
    openEnds++;
  }

  // Đếm hướng ngược
  r = row - dr;
  c = col - dc;
  while (inBounds(r, c) && board[r][c] === player) {
    count++;
    r -= dr;
    c -= dc;
  }
  // Kiểm tra đầu mở hướng ngược
  if (inBounds(r, c) && board[r][c] === null) {
    openEnds++;
  }

  return { count, openEnds };
}

/**
 * Đánh giá điểm cho 1 quân tại (row, col) theo tất cả hướng
 */
function evaluateCell(board, row, col, player) {
  if (board[row][col] !== player) return 0;

  let score = 0;

  for (const [dr, dc] of DIRECTIONS) {
    const { count, openEnds } = countDirection(board, row, col, dr, dc, player);

    if (count >= WIN_COUNT) {
      score += SCORES.FIVE;
    } else if (count === 4) {
      score += openEnds === 2 ? SCORES.OPEN_FOUR : openEnds === 1 ? SCORES.HALF_FOUR : 0;
    } else if (count === 3) {
      score += openEnds === 2 ? SCORES.OPEN_THREE : openEnds === 1 ? SCORES.HALF_THREE : 0;
    } else if (count === 2) {
      score += openEnds === 2 ? SCORES.OPEN_TWO : openEnds === 1 ? SCORES.HALF_TWO : 0;
    }
  }

  return score;
}

/**
 * Đánh giá toàn bộ bàn cờ cho 1 người chơi
 * Điểm dương = có lợi cho aiPlayer
 */
function evaluateBoard(board, aiPlayer) {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  let score = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === aiPlayer) {
        score += evaluateCell(board, r, c, aiPlayer);
      } else if (board[r][c] === humanPlayer) {
        score -= evaluateCell(board, r, c, humanPlayer) * 1.1; // Phòng thủ quan trọng hơn tấn công 1 chút
      }
    }
  }

  return score;
}

// ==========================================
// EASY AI — Smart Random
// ==========================================

/**
 * AI Easy: chọn random 1 ô trong các ô gần quân đã đặt
 * @param {Array} board - Bàn cờ 15x15
 * @returns {{ row: number, col: number }}
 */
export function getEasyMove(board) {
  const candidates = getCandidateMoves(board, 1); // Bán kính nhỏ hơn để tự nhiên

  if (candidates.length === 0) {
    // Fallback: tìm ô trống bất kỳ
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === null) return { row: r, col: c };
      }
    }
  }

  // Chọn random
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

// ==========================================
// MEDIUM AI — Minimax + Alpha-Beta
// ==========================================

/**
 * Minimax với alpha-beta pruning
 */
function minimax(board, depth, alpha, beta, isMaximizing, aiPlayer) {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  // Terminal conditions
  if (depth === 0) {
    return { score: evaluateBoard(board, aiPlayer) };
  }

  const candidates = getCandidateMoves(board);
  if (candidates.length === 0) {
    return { score: 0 };
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = candidates[0];

    for (const { row, col } of candidates) {
      board[row][col] = aiPlayer;

      // Kiểm tra thắng ngay
      const win = checkWin(board, row, col, aiPlayer);
      if (win) {
        board[row][col] = null;
        return { score: SCORES.FIVE * (depth + 1), move: { row, col } };
      }

      const result = minimax(board, depth - 1, alpha, beta, false, aiPlayer);
      board[row][col] = null;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = { row, col };
      }

      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break; // Cắt tỉa
    }

    return { score: bestScore, move: bestMove };

  } else {
    let bestScore = Infinity;
    let bestMove = candidates[0];

    for (const { row, col } of candidates) {
      board[row][col] = humanPlayer;

      // Kiểm tra người chơi thắng
      const win = checkWin(board, row, col, humanPlayer);
      if (win) {
        board[row][col] = null;
        return { score: -SCORES.FIVE * (depth + 1), move: { row, col } };
      }

      const result = minimax(board, depth - 1, alpha, beta, true, aiPlayer);
      board[row][col] = null;

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = { row, col };
      }

      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break; // Cắt tỉa
    }

    return { score: bestScore, move: bestMove };
  }
}

/**
 * AI Medium: sử dụng minimax + heuristic
 * @param {Array} board - Bàn cờ 15x15
 * @param {string} aiPlayer - 'X' hoặc 'O' (AI đánh quân nào)
 * @returns {{ row: number, col: number }}
 */
export function getMediumMove(board, aiPlayer = 'O') {
  // Tạo bản sao để minimax mutate tạm
  const boardCopy = board.map(r => [...r]);

  // Kiểm tra nước thắng ngay lập tức
  const candidates = getCandidateMoves(boardCopy);
  for (const { row, col } of candidates) {
    boardCopy[row][col] = aiPlayer;
    if (checkWin(boardCopy, row, col, aiPlayer)) {
      boardCopy[row][col] = null;
      return { row, col };
    }
    boardCopy[row][col] = null;
  }

  // Kiểm tra nước block đối thủ thắng
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  for (const { row, col } of candidates) {
    boardCopy[row][col] = humanPlayer;
    if (checkWin(boardCopy, row, col, humanPlayer)) {
      boardCopy[row][col] = null;
      return { row, col };
    }
    boardCopy[row][col] = null;
  }

  // Dùng minimax cho nước đi tốt nhất
  const result = minimax(boardCopy, MINIMAX_DEPTH, -Infinity, Infinity, true, aiPlayer);

  return result.move || candidates[0];
}

// Export heuristic cho hint system sử dụng lại
export { evaluateBoard, getCandidateMoves, evaluateCell };
