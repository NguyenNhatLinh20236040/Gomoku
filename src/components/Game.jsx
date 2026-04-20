// ==========================================
// Game.jsx - Component logic chính của game
// ==========================================
// Quản lý toàn bộ state: board, lượt chơi,
// thắng/thua/hòa, lịch sử nước đi.
// Tích hợp: AI, Timer (border animation), Smart Hint.

import { useState, useCallback, useEffect, useRef } from 'react';
import Board from './Board';
import VictoryModal from './VictoryModal';
import { checkWin, checkDraw, createEmptyBoard } from '../utils/checkWin';
import { getEasyMove, getMediumMove } from '../utils/aiEngine';
import { getHint } from '../utils/hintEngine';
import useTimer from '../hooks/useTimer';

const TURN_TIME = 30;     // Giây mỗi lượt
const MAX_HINTS = 3;      // Số lần gợi ý tối đa mỗi game

/**
 * Random quân AI: 'X' hoặc 'O'
 */
function randomAISide() {
  return Math.random() < 0.5 ? 'X' : 'O';
}

/**
 * @param {function} onBack - Quay về trang chủ
 * @param {string} gameMode - 'local' | 'ai'
 * @param {string|null} aiLevel - 'easy' | 'medium' | null
 */
export default function Game({ onBack, gameMode = 'local', aiLevel = null }) {
  // ===== STATE =====
  const [board, setBoard] = useState(createEmptyBoard);     // Bàn cờ 15x15
  const [isXTurn, setIsXTurn] = useState(true);              // true = lượt X, false = lượt O
  const [lastMove, setLastMove] = useState(null);            // Nước đi cuối [row, col]
  const [winCells, setWinCells] = useState(null);            // Các ô thắng
  const [winner, setWinner] = useState(null);                // 'X', 'O', hoặc null
  const [isDraw, setIsDraw] = useState(false);               // Hòa?
  const [moveCount, setMoveCount] = useState(0);             // Đếm số nước đi
  const [hintCell, setHintCell] = useState(null);            // Ô gợi ý [row, col]
  const [hintsRemaining, setHintsRemaining] = useState(MAX_HINTS); // Gợi ý còn lại
  const [isAIThinking, setIsAIThinking] = useState(false);   // AI đang tính toán?
  const [aiSide, setAiSide] = useState(() => randomAISide()); // AI đánh quân nào (random mỗi trận)

  // Quân người chơi là quân còn lại
  const playerSide = aiSide === 'X' ? 'O' : 'X';

  // Ref để tránh stale closure trong timer callback
  const boardRef = useRef(board);
  const isXTurnRef = useRef(isXTurn);
  const gameOverRef = useRef(false);
  const aiSideRef = useRef(aiSide);
  boardRef.current = board;
  isXTurnRef.current = isXTurn;
  aiSideRef.current = aiSide;

  // Game đã kết thúc?
  const gameOver = winner !== null || isDraw;
  gameOverRef.current = gameOver;

  // Kiểm tra có phải lượt AI không
  const isAITurn = gameMode === 'ai' && ((aiSide === 'X' && isXTurn) || (aiSide === 'O' && !isXTurn));

  // ===== TIMER =====
  const handleTimeout = useCallback(() => {
    if (gameOverRef.current) return;
    // Không timeout lượt AI
    const currentIsAI = gameMode === 'ai' &&
      ((aiSideRef.current === 'X' && isXTurnRef.current) || (aiSideRef.current === 'O' && !isXTurnRef.current));
    if (currentIsAI) return;

    // Hết giờ → đặt random cho người hết giờ, tự động chuyển lượt
    const currentBoard = boardRef.current;
    const emptyCells = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (currentBoard[r][c] === null) {
          emptyCells.push([r, c]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      handleCellClickInternal(row, col);
    }
  }, [gameMode]);

  const { timeLeft, isRunning, start, pause, reset } = useTimer(TURN_TIME, handleTimeout);

  // Start timer khi game bắt đầu (chỉ khi không phải lượt AI)
  useEffect(() => {
    if (gameMode === 'ai' && aiSide === 'X') {
      // AI đi trước, không start timer
      return;
    }
    start();
  }, []);

  // ===== Tính toán timer progress cho border animation =====
  const timerPercentage = (timeLeft / TURN_TIME) * 100;
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 10;

  // Màu viền timer
  const getTimerBorderColor = () => {
    if (isUrgent) return '#ef4444';   // red-500
    if (isWarning) return '#f59e0b';  // amber-500
    return '#10b981';                  // emerald-500
  };

  // ===== XỬ LÝ NƯỚC ĐI (internal - dùng chung cho player và AI) =====
  const handleCellClickInternal = useCallback((row, col) => {
    const currentBoard = boardRef.current;
    if (currentBoard[row][col] || gameOverRef.current) return;

    const currentPlayer = isXTurnRef.current ? 'X' : 'O';

    // Cập nhật bàn cờ (tạo bản sao mới - immutable)
    const newBoard = currentBoard.map(r => [...r]);
    newBoard[row][col] = currentPlayer;

    setBoard(newBoard);
    setLastMove([row, col]);
    setMoveCount(prev => prev + 1);
    setHintCell(null); // Xóa hint khi đặt quân

    // Kiểm tra thắng
    const winResult = checkWin(newBoard, row, col, currentPlayer);
    if (winResult) {
      setWinCells(winResult);
      setWinner(currentPlayer);
      pause(); // Dừng timer
      return;
    }

    // Kiểm tra hòa
    if (checkDraw(newBoard)) {
      setIsDraw(true);
      pause();
      return;
    }

    // Đổi lượt chơi
    const nextIsX = !isXTurnRef.current;
    setIsXTurn(nextIsX);
    isXTurnRef.current = nextIsX;
    boardRef.current = newBoard;

    // Kiểm tra lượt tiếp có phải AI không
    const nextIsAI = gameMode === 'ai' &&
      ((aiSideRef.current === 'X' && nextIsX) || (aiSideRef.current === 'O' && !nextIsX));

    if (nextIsAI) {
      pause(); // Pause timer khi AI đánh
    } else {
      reset(TURN_TIME);
    }
  }, [gameMode, pause, reset]);

  // ===== XỬ LÝ CLICK Ô CỜ (player) =====
  const handleCellClick = useCallback((row, col) => {
    // Không cho click nếu game kết thúc hoặc AI đang thinking
    if (gameOver || isAIThinking) return;
    // Trong mode AI, chỉ cho đánh khi lượt player
    if (gameMode === 'ai' && isAITurn) return;

    handleCellClickInternal(row, col);
  }, [gameOver, isAIThinking, gameMode, isAITurn, handleCellClickInternal]);

  // ===== AI TỰ ĐỘNG ĐÁNH =====
  useEffect(() => {
    if (gameMode !== 'ai') return;
    if (!isAITurn) return;
    if (gameOver) return;

    setIsAIThinking(true);

    // Delay 400ms để người chơi thấy quân vừa đặt trước
    const timer = setTimeout(() => {
      const currentBoard = boardRef.current;
      let move;

      if (aiLevel === 'easy') {
        move = getEasyMove(currentBoard);
      } else {
        move = getMediumMove(currentBoard, aiSide);
      }

      if (move) {
        handleCellClickInternal(move.row, move.col);
      }

      setIsAIThinking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [isXTurn, gameOver, gameMode, aiLevel, isAITurn, aiSide, handleCellClickInternal]);

  // ===== SMART HINT (chỉ dùng trong chế độ AI) =====
  const handleHint = useCallback(() => {
    if (gameOver || isAIThinking || hintsRemaining <= 0) return;
    if (gameMode !== 'ai') return; // Không cho hint ở local mode
    const currentPlayer = isXTurn ? 'X' : 'O';
    const hint = getHint([...board.map(r => [...r])], currentPlayer);
    if (hint) {
      setHintCell([hint.row, hint.col]);
      setHintsRemaining(prev => prev - 1);
    }
  }, [board, isXTurn, gameOver, isAIThinking, hintsRemaining, gameMode]);

  // ===== RESTART GAME =====
  const handleRestart = () => {
    const newAiSide = randomAISide();
    setBoard(createEmptyBoard());
    setIsXTurn(true);
    isXTurnRef.current = true;
    setLastMove(null);
    setWinCells(null);
    setWinner(null);
    setIsDraw(false);
    setMoveCount(0);
    setHintCell(null);
    setHintsRemaining(MAX_HINTS);
    setIsAIThinking(false);
    setAiSide(newAiSide);
    aiSideRef.current = newAiSide;

    // Nếu AI đánh X (đi trước), không start timer
    if (gameMode === 'ai' && newAiSide === 'X') {
      pause();
    } else {
      reset(TURN_TIME);
    }
  };

  // Lấy tên hiển thị cho AI level
  const aiLevelLabel = aiLevel === 'easy' ? 'Easy 🟢' : 'Medium 🟡';

  // Tên hiển thị cho player X và O
  const playerXLabel = gameMode === 'ai'
    ? (aiSide === 'X' ? 'AI 🤖' : 'Bạn')
    : 'Người chơi 1';
  const playerOLabel = gameMode === 'ai'
    ? (aiSide === 'O' ? 'AI 🤖' : 'Bạn')
    : 'Người chơi 2';

  // Xác dịnh player nào đang active (để vẽ border timer)
  const isXActive = isXTurn && !gameOver;
  const isOActive = !isXTurn && !gameOver;

  // Kiểm tra player active có phải AI không (nếu là AI thì không hiển thị timer border)
  const isXAI = gameMode === 'ai' && aiSide === 'X';
  const isOAI = gameMode === 'ai' && aiSide === 'O';
  const showXTimer = isXActive && !(isXAI);
  const showOTimer = isOActive && !(isOAI);

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
          {gameMode === 'ai' && (
            <span className="block text-xs font-normal text-pink-600 text-center">
              vs AI {aiLevelLabel}
            </span>
          )}
        </h1>

        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-all cursor-pointer shadow-lg shadow-pink-300/40"
        >
          <span>↻</span>
          <span className="hidden sm:inline">Ván mới</span>
        </button>
      </div>

      {/* ===== THÔNG TIN LƯỢT CHƠI VỚI BORDER TIMER ===== */}
      <div className="mb-4 flex items-center gap-4">
        {/* Player X với border timer */}
        <div className="player-timer-wrapper">
          {showXTimer && (
            <svg className="player-timer-border" overflow="visible">
              <rect
                x="0" y="0" width="100%" height="100%" rx="9" ry="9"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3.5"
              />
              <rect
                x="0" y="0" width="100%" height="100%" rx="9" ry="9"
                fill="none"
                stroke={getTimerBorderColor()}
                strokeWidth="4"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={`${100 - timerPercentage}`}
                className={`timer-border-progress ${isUrgent && isRunning ? 'timer-urgent' : ''}`}
              />
            </svg>
          )}
          <div className={`
            player-indicator
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${isXTurn && !gameOver
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-300/40 scale-105'
              : 'bg-white/70 text-pink-500/70'}
          `}>
            <span className="text-lg font-bold">X</span>
            <span className="text-sm">{playerXLabel}</span>
          </div>
        </div>

        <span className="text-pink-400 text-sm">VS</span>

        {/* Player O với border timer */}
        <div className="player-timer-wrapper">
          {showOTimer && (
            <svg className="player-timer-border" overflow="visible">
              <rect
                x="0" y="0" width="100%" height="100%" rx="9" ry="9"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3.5"
              />
              <rect
                x="0" y="0" width="100%" height="100%" rx="9" ry="9"
                fill="none"
                stroke={getTimerBorderColor()}
                strokeWidth="4"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={`${100 - timerPercentage}`}
                className={`timer-border-progress ${isUrgent && isRunning ? 'timer-urgent' : ''}`}
              />
            </svg>
          )}
          <div className={`
            player-indicator
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${!isXTurn && !gameOver
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-300/40 scale-105'
              : 'bg-white/70 text-pink-500/70'}
          `}>
            <span className="text-lg font-bold">O</span>
            <span className="text-sm">{playerOLabel}</span>
          </div>
        </div>
      </div>

      {/* ===== AI THINKING INDICATOR ===== */}
      {isAIThinking && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg shadow-sm animate-slide-in">
          <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-ai-thinking" />
          <span className="text-pink-600 text-sm font-medium">AI đang suy nghĩ...</span>
        </div>
      )}

      {/* ===== MODAL KẾT QUẢ (THẮNG / HÒA) ===== */}
      {(winner || isDraw) && (
        <VictoryModal
          winner={winner}
          isDraw={isDraw}
          gameMode={gameMode}
          aiSide={aiSide}
          onBack={onBack}
          onRestart={handleRestart}
        />
      )}

      {/* Số nước đi + Nút Hint (chỉ hiện hint trong chế độ AI) */}
      <div className="mb-3 flex items-center gap-4">
        <span className="text-pink-700 text-sm">
          Nước đi: {moveCount}
        </span>

        {/* Nút gợi ý - CHỈ hiện trong chế độ AI, khi lượt player */}
        {gameMode === 'ai' && !gameOver && !isAITurn && (
          <button
            onClick={handleHint}
            disabled={isAIThinking || hintsRemaining <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg shadow-md shadow-blue-300/30 hover:shadow-blue-300/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>💡</span>
            <span>Gợi ý ({hintsRemaining}/{MAX_HINTS})</span>
          </button>
        )}
      </div>

      {/* ===== BÀN CỜ ===== */}
      <div className="overflow-auto max-w-full">
        <Board
          board={board}
          onCellClick={handleCellClick}
          lastMove={lastMove}
          winCells={winCells}
          hintCell={hintCell}
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
