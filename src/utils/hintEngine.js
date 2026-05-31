
import { BOARD_SIZE, checkWin } from './checkWin';
import { getCandidateMoves, evaluateBoard } from './aiEngine';

/**
 * Tìm nước đi tốt nhất cho player hiện tại
 * @param {Array} board - Bàn cờ 15x15
 * @param {string} player - 'X' hoặc 'O'
 * @param {number} winCount - Số quân cần liên tiếp để thắng
 * @returns {{ row: number, col: number, score: number } | null}
 */
export function getHint(board, player, winCount = 5) {
  const candidates = getCandidateMoves(board);

  if (candidates.length === 0) return null;

  let bestMove = null;
  let bestScore = -Infinity;

  for (const { row, col } of candidates) {
    // Thử đặt quân
    board[row][col] = player;

    // Nước thắng ngay → ưu tiên tuyệt đối
    if (checkWin(board, row, col, player, winCount)) {
      board[row][col] = null;
      return { row, col, score: Infinity };
    }

    // Đánh giá bàn cờ sau nước đi này
    const score = evaluateBoard(board, player);
    board[row][col] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = { row, col, score };
    }
  }

  // Kiểm tra nước block đối thủ thắng
  const opponent = player === 'X' ? 'O' : 'X';
  for (const { row, col } of candidates) {
    board[row][col] = opponent;
    if (checkWin(board, row, col, opponent, winCount)) {
      board[row][col] = null;
      // Nếu đối thủ có thể thắng, ưu tiên block
      return { row, col, score: 99999 };
    }
    board[row][col] = null;
  }

  return bestMove;
}
