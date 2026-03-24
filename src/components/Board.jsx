// ==========================================
// Board.jsx - Component bàn cờ 15x15
// ==========================================
// Render lưới 15x15. Mỗi ô là 1 Cell component.
// Nhận props từ Game để xử lý click, highlight.

import Cell from './Cell';
import { BOARD_SIZE } from '../utils/checkWin';

/**
 * @param {Array} board - Mảng 2D trạng thái bàn cờ
 * @param {function} onCellClick - Hàm xử lý khi click ô
 * @param {Array|null} lastMove - [row, col] nước đi cuối
 * @param {Array|null} winCells - Mảng tọa độ 5 quân thắng
 * @param {boolean} gameOver - Game đã kết thúc chưa
 */
export default function Board({ board, onCellClick, lastMove, winCells, gameOver }) {
  const CELL_SIZE = 42; // Kích thước ô cố định để bảng hiển thị đầy đủ ngay từ đầu
  const gridStyle = {
    gridTemplateColumns: `28px repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
    gridAutoRows: `${CELL_SIZE}px`,
  };

  // Kiểm tra 1 ô có phải nước đi cuối không
  const isLastMove = (row, col) => {
    return lastMove && lastMove[0] === row && lastMove[1] === col;
  };

  // Kiểm tra 1 ô có nằm trong đường thắng không
  const isWinCell = (row, col) => {
    if (!winCells) return false;
    return winCells.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="inline-block p-2 bg-pink-50 rounded-lg shadow-xl border-2 border-pink-200">
      {/* Header cột: A B C ... O */}
      <div
        className="grid gap-0"
        style={gridStyle}
      >
        <div /> {/* Ô trống góc trên trái */}
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div key={i} className="text-center text-xs text-pink-400 font-mono pb-1">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {/* Bàn cờ + header hàng */}
      {board.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="grid gap-0"
          style={gridStyle}
        >
          {/* Số hàng bên trái */}
          <div className="flex items-center justify-center text-xs text-pink-400 font-mono pr-1">
            {rowIdx + 1}
          </div>

          {/* Các ô trong hàng */}
          {row.map((cell, colIdx) => (
            <Cell
              key={`${rowIdx}-${colIdx}`}
              value={cell}
              onClick={() => onCellClick(rowIdx, colIdx)}
              isLastMove={isLastMove(rowIdx, colIdx)}
              isWinCell={isWinCell(rowIdx, colIdx)}
              disabled={gameOver}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
