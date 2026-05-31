
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
  FIVE: 100000,   // 5 liên tiếp → thắng
  OPEN_FOUR: 10000,    // 4 mở 2 đầu → gần thắng
  HALF_FOUR: 1000,     // 4 bịt 1 đầu
  OPEN_THREE: 1000,     // 3 mở 2 đầu
  HALF_THREE: 100,      // 3 bịt 1 đầu
  OPEN_TWO: 100,      // 2 mở 2 đầu
  HALF_TWO: 10,       // 2 bịt 1 đầu
};

const MINIMAX_DEPTH = 3;      // Độ sâu minimax (Medium)
const CANDIDATE_RADIUS = 2;   // Bán kính tìm ô ứng viên

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Kiểm tra tọa độ có nằm trong bàn cờ không
 */
function inBounds(r, c, size) {
  return r >= 0 && r < size && c >= 0 && c < size;
}

/**
 * Tìm các ô trống gần quân đã đặt (bán kính radius)
 * Giúp giảm search space đáng kể
 */
function getCandidateMoves(board, radius = CANDIDATE_RADIUS) {
  const size = board.length;
  const candidates = new Set();
  let hasAnyPiece = false;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) {
        hasAnyPiece = true;
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (inBounds(nr, nc, size) && board[nr][nc] === null) {
              candidates.add(`${nr},${nc}`);
            }
          }
        }
      }
    }
  }

  if (!hasAnyPiece) {
    const center = Math.floor(size / 2);
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
  const size = board.length;
  let count = 1;
  let openEnds = 0;

  let r = row + dr;
  let c = col + dc;
  while (inBounds(r, c, size) && board[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }
  if (inBounds(r, c, size) && board[r][c] === null) {
    openEnds++;
  }

  r = row - dr;
  c = col - dc;
  while (inBounds(r, c, size) && board[r][c] === player) {
    count++;
    r -= dr;
    c -= dc;
  }
  if (inBounds(r, c, size) && board[r][c] === null) {
    openEnds++;
  }

  return { count, openEnds };
}

/**
 * Chấm điểm cho 1 pattern (count + openEnds)
 */
function scorePattern(count, openEnds, winCount = WIN_COUNT) {
  if (count >= winCount) return SCORES.FIVE;
  if (count === winCount - 1) return openEnds === 2 ? SCORES.OPEN_FOUR : openEnds === 1 ? SCORES.HALF_FOUR : 0;
  if (count === winCount - 2 && winCount >= 4) return openEnds === 2 ? SCORES.OPEN_THREE : openEnds === 1 ? SCORES.HALF_THREE : 0;
  if (count === winCount - 3 && winCount >= 5) return openEnds === 2 ? SCORES.OPEN_TWO : openEnds === 1 ? SCORES.HALF_TWO : 0;
  return 0;
}

/**
 * Đánh giá điểm cho 1 quân tại (row, col) theo tất cả hướng
 * (Dùng cho move ordering và hint — per-cell evaluation)
 */
function evaluateCell(board, row, col, player, winCount = WIN_COUNT) {
  if (board[row][col] !== player) return 0;

  let score = 0;

  for (const [dr, dc] of DIRECTIONS) {
    const { count, openEnds } = countDirection(board, row, col, dr, dc, player);
    score += scorePattern(count, openEnds, winCount);
  }

  return score;
}

/**
 * Quét theo 4 hướng, mỗi chuỗi quân chỉ được tính 1 lần.
 * Cách thức: với mỗi hướng, duyệt từng ô — chỉ bắt đầu đánh giá
 * khi ô phía trước (theo hướng ngược) KHÔNG phải cùng player
 * (tức là ô hiện tại là đầu chuỗi).
 */
function evaluateBoard(board, aiPlayer, winCount = WIN_COUNT) {
  const size = board.length;
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  let score = 0;

  for (const [dr, dc] of DIRECTIONS) {
    // Xác định phạm vi duyệt để quét tất cả các line theo hướng (dr, dc)
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = board[r][c];
        if (cell === null) continue;

        // Kiểm tra có phải đầu chuỗi không:
        // Ô ngay phía trước (hướng ngược) không phải cùng player
        const prevR = r - dr;
        const prevC = c - dc;
        if (inBounds(prevR, prevC, size) && board[prevR][prevC] === cell) {
          continue; // Không phải đầu chuỗi → bỏ qua
        }

        // Đây là đầu chuỗi → đếm theo hướng thuận
        let count = 1;
        let nr = r + dr;
        let nc = c + dc;
        while (inBounds(nr, nc, size) && board[nr][nc] === cell) {
          count++;
          nr += dr;
          nc += dc;
        }

        // Kiểm tra openEnds
        let openEnds = 0;
        // Đầu trước chuỗi (hướng ngược)
        if (inBounds(prevR, prevC, size) && board[prevR][prevC] === null) {
          openEnds++;
        }
        // Đầu sau chuỗi (hướng thuận)
        if (inBounds(nr, nc, size) && board[nr][nc] === null) {
          openEnds++;
        }

        const patternScore = scorePattern(count, openEnds, winCount);

        if (cell === aiPlayer) {
          score += patternScore;
        } else {
          score -= patternScore * 1.1; // Phòng thủ quan trọng hơn tấn công
        }
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
function minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, winCount = WIN_COUNT) {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  // Terminal conditions
  if (depth === 0) {
    return { score: evaluateBoard(board, aiPlayer, winCount) };
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
      const win = checkWin(board, row, col, aiPlayer, winCount);
      if (win) {
        board[row][col] = null;
        return { score: SCORES.FIVE * (depth + 1), move: { row, col } };
      }

      const result = minimax(board, depth - 1, alpha, beta, false, aiPlayer, winCount);
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
      const win = checkWin(board, row, col, humanPlayer, winCount);
      if (win) {
        board[row][col] = null;
        return { score: -SCORES.FIVE * (depth + 1), move: { row, col } };
      }

      const result = minimax(board, depth - 1, alpha, beta, true, aiPlayer, winCount);
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
export function getMediumMove(board, aiPlayer = 'O', winCount = WIN_COUNT) {
  // Tạo bản sao để minimax mutate tạm
  const boardCopy = board.map(r => [...r]);

  // Kiểm tra nước thắng ngay lập tức
  const candidates = getCandidateMoves(boardCopy);
  for (const { row, col } of candidates) {
    boardCopy[row][col] = aiPlayer;
    if (checkWin(boardCopy, row, col, aiPlayer, winCount)) {
      boardCopy[row][col] = null;
      return { row, col };
    }
    boardCopy[row][col] = null;
  }

  // Kiểm tra nước block đối thủ thắng
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  for (const { row, col } of candidates) {
    boardCopy[row][col] = humanPlayer;
    if (checkWin(boardCopy, row, col, humanPlayer, winCount)) {
      boardCopy[row][col] = null;
      return { row, col };
    }
    boardCopy[row][col] = null;
  }

  // Dùng minimax cho nước đi tốt nhất
  const result = minimax(boardCopy, MINIMAX_DEPTH, -Infinity, Infinity, true, aiPlayer, winCount);

  return result.move || candidates[0];
}

// ==========================================
// HARD AI — Enhanced Minimax + Move Ordering
// ==========================================

const HARD_DEPTH = 4;

/**
 * Sắp xếp nước đi theo heuristic score (nước tốt trước → cắt tỉa hiệu quả)
 */
function orderMoves(board, candidates, aiPlayer, winCount = WIN_COUNT) {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  const scored = candidates.map(({ row, col }) => {
    let score = 0;

    // Thử đặt AI — chỉ dùng evaluateCell (nhanh hơn checkWin)
    board[row][col] = aiPlayer;
    score += evaluateCell(board, row, col, aiPlayer, winCount) * 2;
    board[row][col] = null;

    // Thử đặt đối thủ
    board[row][col] = humanPlayer;
    score += evaluateCell(board, row, col, humanPlayer, winCount) * 1.5;
    board[row][col] = null;

    return { row, col, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Giới hạn số nước đi xem xét để tránh quá chậm
  return scored.slice(0, 15);
}

/**
 * Thêm kiểm tra terminal state (thắng/thua) trước khi đệ quy tiếp.
 */
function minimaxHard(board, depth, alpha, beta, isMaximizing, aiPlayer, winCount = WIN_COUNT) {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  if (depth === 0) {
    return { score: evaluateBoard(board, aiPlayer, winCount) };
  }

  const rawCandidates = getCandidateMoves(board);
  if (rawCandidates.length === 0) {
    return { score: 0 };
  }

  // Move ordering — chỉ ở depth cao để tiết kiệm thời gian
  const candidates = depth >= 2
    ? orderMoves(board, rawCandidates, aiPlayer, winCount)
    : rawCandidates.slice(0, 12);

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = candidates[0];

    for (const { row, col } of candidates) {
      board[row][col] = aiPlayer;

      const win = checkWin(board, row, col, aiPlayer, winCount);
      if (win) {
        board[row][col] = null;
        return { score: SCORES.FIVE * (depth + 1), move: { row, col } };
      }

      const result = minimaxHard(board, depth - 1, alpha, beta, false, aiPlayer, winCount);
      board[row][col] = null;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = { row, col };
      }

      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }

    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = candidates[0];

    for (const { row, col } of candidates) {
      board[row][col] = humanPlayer;

      const win = checkWin(board, row, col, humanPlayer, winCount);
      if (win) {
        board[row][col] = null;
        return { score: -SCORES.FIVE * (depth + 1), move: { row, col } };
      }

      const result = minimaxHard(board, depth - 1, alpha, beta, true, aiPlayer, winCount);
      board[row][col] = null;

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = { row, col };
      }

      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }

    return { score: bestScore, move: bestMove };
  }
}

/**
 * Tính threat score cho 1 nước đi của player
 */
function getThreatScore(board, row, col, player, winCount = WIN_COUNT) {
  let threatCount = 0;
  for (const [dr, dc] of DIRECTIONS) {
    const { count, openEnds } = countDirection(board, row, col, dr, dc, player);
    // open "four" = winCount-1 quân mở 2 đầu
    if (count === winCount - 1 && openEnds === 2) threatCount += 3;
    // open "three" = winCount-2 quân mở 2 đầu (chỉ khi winCount >= 4)
    if (winCount >= 4 && count === winCount - 2 && openEnds === 2) threatCount += 1;
  }
  return threatCount;
}

/**
 * Threat detection giờ kiểm tra CẢ đối thủ (block) trước khi tạo threat của mình.
 * @param {Array} board - Bàn cờ
 * @param {string} aiPlayer - 'X' hoặc 'O'
 * @returns {{ row: number, col: number }}
 */
export function getHardMove(board, aiPlayer = 'O', winCount = WIN_COUNT) {
  const boardCopy = board.map(r => [...r]);
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const candidates = getCandidateMoves(boardCopy);

  // 1. Nước thắng ngay
  for (const { row, col } of candidates) {
    boardCopy[row][col] = aiPlayer;
    if (checkWin(boardCopy, row, col, aiPlayer, winCount)) {
      boardCopy[row][col] = null;
      return { row, col };
    }
    boardCopy[row][col] = null;
  }

  // 2. Block đối thủ thắng
  for (const { row, col } of candidates) {
    boardCopy[row][col] = humanPlayer;
    if (checkWin(boardCopy, row, col, humanPlayer, winCount)) {
      boardCopy[row][col] = null;
      return { row, col };
    }
    boardCopy[row][col] = null;
  }

  // Kiểm tra xem đối thủ có nước nào tạo double-threat không
  for (const { row, col } of candidates) {
    boardCopy[row][col] = humanPlayer;
    const enemyThreat = getThreatScore(boardCopy, row, col, humanPlayer, winCount);
    boardCopy[row][col] = null;
    if (enemyThreat >= 2) return { row, col }; // Block ngay
  }

  // 3b. Tạo double-threat cho AI
  for (const { row, col } of candidates) {
    boardCopy[row][col] = aiPlayer;
    const aiThreat = getThreatScore(boardCopy, row, col, aiPlayer, winCount);
    boardCopy[row][col] = null;
    if (aiThreat >= 2) return { row, col };
  }

  // 4. Minimax nâng cao
  const result = minimaxHard(boardCopy, HARD_DEPTH, -Infinity, Infinity, true, aiPlayer, winCount);
  return result.move || candidates[0];
}

// Export heuristic cho hint system sử dụng lại
export { evaluateBoard, getCandidateMoves, evaluateCell, countDirection };
