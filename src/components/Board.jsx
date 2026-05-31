// ==========================================
// Board.jsx - Dynamic board (3x3 or 15x15)
// ==========================================

import Cell from './Cell';

/**
 * @param {Array} board - 2D board state
 * @param {function} onCellClick - Cell click handler
 * @param {Array|null} lastMove - [row, col] last move
 * @param {Array|null} winCells - Winning cell coordinates
 * @param {Array|null} hintCell - [row, col] hint cell
 * @param {boolean} gameOver - Game ended
 */
export default function Board({ board, onCellClick, lastMove, winCells, hintCell, gameOver }) {
  const boardSize = board.length;
  const CELL_SIZE = boardSize <= 3 ? 100 : 42;
  const HEADER_SIZE = 28; // left column width for row numbers

  const gridStyle = {
    gridTemplateColumns: `${HEADER_SIZE}px repeat(${boardSize}, ${CELL_SIZE}px)`,
    gridAutoRows: `${CELL_SIZE}px`,
  };

  const isLastMove = (row, col) => {
    return lastMove && lastMove[0] === row && lastMove[1] === col;
  };

  const isWinCell = (row, col) => {
    if (!winCells) return false;
    return winCells.some(([r, c]) => r === row && c === col);
  };

  const isHintCell = (row, col) => {
    return hintCell && hintCell[0] === row && hintCell[1] === col;
  };

  // Calculate win-line SVG coordinates
  const getWinLine = () => {
    if (!winCells || winCells.length < 2) return null;

    // Sort cells to get endpoints
    const sorted = [...winCells].sort((a, b) => {
      if (a[0] !== b[0]) return a[0] - b[0];
      return a[1] - b[1];
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    // Center of each cell:  HEADER_SIZE + colIdx * CELL_SIZE + CELL_SIZE/2
    const x1 = HEADER_SIZE + first[1] * CELL_SIZE + CELL_SIZE / 2;
    const y1 = first[0] * CELL_SIZE + CELL_SIZE / 2;
    const x2 = HEADER_SIZE + last[1] * CELL_SIZE + CELL_SIZE / 2;
    const y2 = last[0] * CELL_SIZE + CELL_SIZE / 2;

    return { x1, y1, x2, y2 };
  };

  const winLine = getWinLine();

  // Total board width/height for SVG overlay
  const totalWidth = HEADER_SIZE + boardSize * CELL_SIZE;
  const totalHeight = boardSize * CELL_SIZE;

  return (
    <div className="inline-block p-2 bg-pink-50 rounded-lg shadow-xl border-2 border-pink-200">
      {/* Column headers: A B C ... */}
      <div
        className="grid gap-0"
        style={gridStyle}
      >
        <div /> {/* Empty top-left corner */}
        {Array.from({ length: boardSize }, (_, i) => (
          <div key={i} className="text-center text-xs text-pink-400 font-mono pb-1">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {/* Board grid with win line overlay */}
      <div className="relative">
        {board.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid gap-0"
            style={gridStyle}
          >
            {/* Row number */}
            <div className="flex items-center justify-center text-xs text-pink-400 font-mono pr-1">
              {rowIdx + 1}
            </div>

            {/* Cells */}
            {row.map((cell, colIdx) => (
              <Cell
                key={`${rowIdx}-${colIdx}`}
                value={cell}
                onClick={() => onCellClick(rowIdx, colIdx)}
                isLastMove={isLastMove(rowIdx, colIdx)}
                isWinCell={isWinCell(rowIdx, colIdx)}
                isHintCell={isHintCell(rowIdx, colIdx)}
                disabled={gameOver}
                large={boardSize <= 3}
              />
            ))}
          </div>
        ))}

        {/* Win line SVG overlay */}
        {winLine && (
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={totalWidth}
            height={totalHeight}
            style={{ zIndex: 10 }}
          >
            {/* Shadow / glow behind line */}
            <line
              x1={winLine.x1} y1={winLine.y1}
              x2={winLine.x2} y2={winLine.y2}
              stroke="rgba(236, 72, 153, 0.3)"
              strokeWidth={boardSize <= 3 ? 14 : 8}
              strokeLinecap="round"
            />
            {/* Main animated line */}
            <line
              x1={winLine.x1} y1={winLine.y1}
              x2={winLine.x2} y2={winLine.y2}
              stroke="#ec4899"
              strokeWidth={boardSize <= 3 ? 6 : 4}
              strokeLinecap="round"
              className="animate-win-line"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
