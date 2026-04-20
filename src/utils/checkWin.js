
const BOARD_SIZE = 15;
const WIN_COUNT = 5;

/**
 * Kiểm tra có người thắng sau nước đi tại (row, col)
 * @param {Array<Array<string|null>>} board - Bàn cờ 15x15
 * @param {number} row - Hàng vừa đặt
 * @param {number} col - Cột vừa đặt
 * @param {string} player - Người chơi ('X' hoặc 'O')
 * @returns {Array|null} - Mảng tọa độ 5 quân thắng, hoặc null
 */
export function checkWin(board, row, col, player) {
  // 4 hướng kiểm tra: [delta_row, delta_col]

  const directions = [
    [0, 1],   // ngang
    [1, 0],   // dọc
    [1, 1],   // chéo chính (\)
    [1, -1],  // chéo phụ (/)
  ];

  for (const [dr, dc] of directions) {
    const cells = [[row, col]]; // Bắt đầu từ ô vừa đặt

    // Đếm theo hướng thuận (dr, dc)
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
      if (board[r][c] !== player) break;
      cells.push([r, c]);
    }

    // Đếm theo hướng ngược (-dr, -dc)
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
      if (board[r][c] !== player) break;
      cells.push([r, c]);
    }

    // Nếu tổng số quân liên tiếp >= 5 → THẮNG
    if (cells.length >= WIN_COUNT) {
      return cells; // Trả về tọa độ các quân thắng để highlight
    }
  }

  return null; // Chưa có ai thắng
}

/**
 * Kiểm tra bàn cờ đã đầy chưa (hòa)
 */
export function checkDraw(board) {
  return board.every(row => row.every(cell => cell !== null));
}

/**
 * Tạo bàn cờ trống 15x15
 */
export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

export { BOARD_SIZE, WIN_COUNT };
