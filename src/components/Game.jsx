// ==========================================
// Game.jsx - Component logic chính của game
// ==========================================
// Quản lý toàn bộ state: board, lượt chơi,
// thắng/thua/hòa, lịch sử nước đi.

import { useState, useCallback } from 'react';
import Board from './Board';
import { checkWin, checkDraw, createEmptyBoard } from '../utils/checkWin';

/**
 * @param {function} onBack - Quay về trang chủ
 */
export default function Game({ onBack }) {
  // ===== STATE =====
  const [board, setBoard] = useState(createEmptyBoard);     // Bàn cờ 15x15
  const [isXTurn, setIsXTurn] = useState(true);              // true = lượt X, false = lượt O
  const [lastMove, setLastMove] = useState(null);            // Nước đi cuối [row, col]
  const [winCells, setWinCells] = useState(null);            // Các ô thắng
  const [winner, setWinner] = useState(null);                // 'X', 'O', hoặc null
  const [isDraw, setIsDraw] = useState(false);               // Hòa?
  const [moveCount, setMoveCount] = useState(0);             // Đếm số nước đi

  // Game đã kết thúc?
  const gameOver = winner !== null || isDraw;

  // ===== XỬ LÝ CLICK Ô CỜ =====
  const handleCellClick = useCallback((row, col) => {
    // Không cho click nếu ô đã có quân hoặc game kết thúc
    if (board[row][col] || gameOver) return;

    const currentPlayer = isXTurn ? 'X' : 'O';

    // Cập nhật bàn cờ (tạo bản sao mới - immutable)
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;

    setBoard(newBoard);
    setLastMove([row, col]);
    setMoveCount(prev => prev + 1);

    // Kiểm tra thắng
    const winResult = checkWin(newBoard, row, col, currentPlayer);
    if (winResult) {
      setWinCells(winResult);
      setWinner(currentPlayer);
      return; // Kết thúc, không đổi lượt
    }

    // Kiểm tra hòa
    if (checkDraw(newBoard)) {
      setIsDraw(true);
      return;
    }

    // Đổi lượt chơi
    setIsXTurn(!isXTurn);
  }, [board, isXTurn, gameOver]);

  // ===== RESTART GAME =====
  const handleRestart = () => {
    setBoard(createEmptyBoard());
    setIsXTurn(true);
    setLastMove(null);
    setWinCells(null);
    setWinner(null);
    setIsDraw(false);
    setMoveCount(0);
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 flex flex-col items-center py-4 px-2 text-pink-900">

      {/* ===== HEADER ===== */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white/90 text-pink-900 rounded-lg transition-all cursor-pointer shadow-sm"
        >
          <span>←</span>
          <span className="hidden sm:inline">Trang chủ</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-pink-900 tracking-wide">
          ⚔️ GOMOKU
        </h1>

        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-all cursor-pointer shadow-lg shadow-pink-300/40"
        >
          <span>↻</span>
          <span className="hidden sm:inline">Ván mới</span>
        </button>
      </div>

      {/* ===== THÔNG TIN LƯỢT CHƠI ===== */}
      <div className="mb-4 flex items-center gap-4">
        {/* Player X */}
        <div className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all
          ${isXTurn && !gameOver
            ? 'bg-pink-600 text-white shadow-lg shadow-pink-300/40 scale-105'
            : 'bg-white/70 text-pink-500/70'}
        `}>
          <span className="text-lg font-bold">X</span>
          <span className="text-sm">Người chơi 1</span>
        </div>

        <span className="text-pink-400 text-sm">VS</span>

        {/* Player O */}
        <div className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all
          ${!isXTurn && !gameOver
            ? 'bg-pink-500 text-white shadow-lg shadow-pink-300/40 scale-105'
            : 'bg-white/70 text-pink-500/70'}
        `}>
          <span className="text-lg font-bold">O</span>
          <span className="text-sm">Người chơi 2</span>
        </div>
      </div>

      {/* ===== THÔNG BÁO KẾT QUẢ ===== */}
      {gameOver && (
        <div className="mb-4 animate-fade-in">
          {winner ? (
            <div className={`
              px-6 py-3 rounded-xl text-lg font-bold shadow-lg
              ${winner === 'X'
                ? 'bg-pink-600 text-white shadow-pink-300/40'
                : 'bg-pink-500 text-white shadow-pink-300/40'}
            `}>
              🎉 {winner === 'X' ? 'Người chơi 1' : 'Người chơi 2'} (
              {winner}) CHIẾN THẮNG!
            </div>
          ) : (
            <div className="px-6 py-3 rounded-xl text-lg font-bold bg-amber-500 text-white shadow-lg">
              🤝 HÒA! Không còn ô trống.
            </div>
          )}
        </div>
      )}

      {/* Số nước đi */}
      <div className="mb-3 text-pink-700 text-sm">
        Nước đi: {moveCount}
      </div>

      {/* ===== BÀN CỜ ===== */}
      <div className="overflow-auto max-w-full">
        <Board
          board={board}
          onCellClick={handleCellClick}
          lastMove={lastMove}
          winCells={winCells}
          gameOver={gameOver}
        />
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-4 text-pink-700 text-xs">
         Click vào ô trống để đặt quân
      </div>
    </div>
  );
}
