
const BOARD_SIZE = 15;
const WIN_COUNT = 5;

/**
 * Kiểm tra có người thắng sau nước đi tại (row, col)
 * @param {Array<Array<string|null>>} board - Bàn cờ
 * @param {number} row - Hàng vừa đặt
 * @param {number} col - Cột vừa đặt
 * @param {string} player - Người chơi ('X' hoặc 'O')
 * @param {number} winCount - Số quân liên tiếp để thắng (3 hoặc 5)
 * @returns {Array|null} - Mảng tọa độ quân thắng, hoặc null
 */
export function checkWin(board, row, col, player, winCount = WIN_COUNT) {
  const boardSize = board.length;
  const directions = [
    [0, 1],   // ngang
    [1, 0],   // dọc
    [1, 1],   // chéo chính (\)
    [1, -1],  // chéo phụ (/)
  ];

  for (const [dr, dc] of directions) {
    const cells = [[row, col]];

    // Đếm theo hướng thuận
    for (let i = 1; i < winCount; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) break;
      if (board[r][c] !== player) break;
      cells.push([r, c]);
    }

    // Đếm theo hướng ngược
    for (let i = 1; i < winCount; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) break;
      if (board[r][c] !== player) break;
      cells.push([r, c]);
    }

    if (cells.length >= winCount) {
      return cells;
    }
  }

  return null;
}

/**
 * Kiểm tra bàn cờ đã đầy chưa (hòa)
 */
export function checkDraw(board) {
  return board.every(row => row.every(cell => cell !== null));
}

/**
 * Tạo bàn cờ trống theo kích thước
 * @param {number} size - Kích thước bàn cờ (3 hoặc 15)
 */
export function createEmptyBoard(size = BOARD_SIZE) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );
}

export { BOARD_SIZE, WIN_COUNT };
