// ==========================================
// Game.jsx - Component logic chính của game
// ==========================================
// Quản lý toàn bộ state: board, lượt chơi,
// thắng/thua/hòa, lịch sử nước đi.
// Tích hợp: AI, Timer (border animation), Smart Hint,
// Multiple Rule Systems, Pause/Resume.
// Kết nối Database: lưu trận đấu + nước đi qua API.

import { useState, useCallback, useEffect, useRef } from 'react';
import Board from './Board';
import VictoryModal from './VictoryModal';
import PauseModal from './PauseModal';
import { checkWin, checkDraw, createEmptyBoard } from '../utils/checkWin';
import { getEasyMove, getMediumMove, getHardMove } from '../utils/aiEngine';
import { getHint } from '../utils/hintEngine';
import { createMatch, endMatch, addMove } from '../utils/apiClient';
import useTimer from '../hooks/useTimer';

const TURN_TIME = 30;     // Giây mỗi lượt
const MAX_HINTS = 3;      // Số lần gợi ý tối đa mỗi game

// Mapping ruleSet → winCount & boardSize & API rule name
const RULE_WIN_COUNT = { '3row': 3, '5row': 5 };
const RULE_BOARD_SIZE = { '3row': 3, '5row': 15 };
const RULE_LABELS = { '3row': '3×3 ⚡', '5row': '15×15 ⭐' };
const RULE_TO_API = { '3row': 'gomoku3', '5row': 'gomoku5' };

/**
 * Random quân AI: 'X' hoặc 'O'
 */
function randomAISide() {
  return Math.random() < 0.5 ? 'X' : 'O';
}

/**
 * @param {function} onBack - Quay về trang chủ
 * @param {string} gameMode - 'local' | 'ai'
 * @param {string|null} aiLevel - 'easy' | 'medium' | 'hard' | null
 * @param {string} ruleSet - '3row' | '5row'
 */
export default function Game({ onBack, gameMode = 'local', aiLevel = null, ruleSet = '5row' }) {
  // ===== DERIVED =====
  const winCount = RULE_WIN_COUNT[ruleSet] || 5;
  const boardSize = RULE_BOARD_SIZE[ruleSet] || 15;

  // ===== STATE =====
  const [board, setBoard] = useState(() => createEmptyBoard(boardSize));     // Bàn cờ
  const [isXTurn, setIsXTurn] = useState(true);              // true = lượt X, false = lượt O
  const [lastMove, setLastMove] = useState(null);            // Nước đi cuối [row, col]
  const [winCells, setWinCells] = useState(null);            // Các ô thắng
  const [winner, setWinner] = useState(null);                // 'X', 'O', hoặc null
  const [isDraw, setIsDraw] = useState(false);               // Hòa?
  const [moveCount, setMoveCount] = useState(0);             // Đếm số nước đi
  const [hintCell, setHintCell] = useState(null);            // Ô gợi ý [row, col]
  const [hintsRemaining, setHintsRemaining] = useState(MAX_HINTS); // Gợi ý còn lại
  const [isAIThinking, setIsAIThinking] = useState(false);   // AI đang tính toán?
  const [aiSide, setAiSide] = useState(() => randomAISide()); // AI đánh quân nào
  const [isPaused, setIsPaused] = useState(false);           // Tạm dừng?
  const [showVictoryModal, setShowVictoryModal] = useState(false); // Delayed victory popup

  // ===== SCORE (Local mode) =====
  const [scoreX, setScoreX] = useState(0);       // Player 1 (X) score
  const [scoreO, setScoreO] = useState(0);       // Player 2 (O) score

  // ===== DATABASE STATE =====
  const [matchId, setMatchId] = useState(null);              // ID trận đấu trên DB
  const matchStartTime = useRef(Date.now());                 // Thời điểm bắt đầu trận

  // Quân người chơi là quân còn lại
  const playerSide = aiSide === 'X' ? 'O' : 'X';

  // Ref để tránh stale closure trong timer callback
  const boardRef = useRef(board);
  const isXTurnRef = useRef(isXTurn);
  const gameOverRef = useRef(false);
  const aiSideRef = useRef(aiSide);
  const matchIdRef = useRef(null);
  const moveCountRef = useRef(0);
  boardRef.current = board;
  isXTurnRef.current = isXTurn;
  aiSideRef.current = aiSide;
  matchIdRef.current = matchId;
  moveCountRef.current = moveCount;

  // Game đã kết thúc?
  const gameOver = winner !== null || isDraw;
  gameOverRef.current = gameOver;

  // Kiểm tra có phải lượt AI không
  const isAITurn = gameMode === 'ai' && ((aiSide === 'X' && isXTurn) || (aiSide === 'O' && !isXTurn));

  // ===== TẠO TRẬN ĐẤU TRÊN DB KHI BẮT ĐẦU =====
  useEffect(() => {
    const initMatch = async () => {
      try {
        const apiRule = RULE_TO_API[ruleSet] || 'gomoku5';
        const result = await createMatch(gameMode, apiRule, aiLevel, aiSide);
        if (result.data) {
          setMatchId(result.data.id);
          matchIdRef.current = result.data.id;
        }
      } catch (err) {
        console.error('Failed to create match in DB:', err);
      }
    };
    initMatch();
    matchStartTime.current = Date.now();
  }, []); // Chỉ chạy 1 lần khi mount

  // ===== TIMER =====
  const handleTimeout = useCallback(() => {
    if (gameOverRef.current) return;
    const currentIsAI = gameMode === 'ai' &&
      ((aiSideRef.current === 'X' && isXTurnRef.current) || (aiSideRef.current === 'O' && !isXTurnRef.current));
    if (currentIsAI) return;

    const currentBoard = boardRef.current;
    const emptyCells = [];
    const size = currentBoard.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
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

  // Start timer khi game bắt đầu
  useEffect(() => {
    if (gameMode === 'ai' && aiSide === 'X') {
      return; // AI đi trước, không start timer
    }
    start();
  }, []);

  // ===== Tính toán timer progress cho border animation =====
  const timerPercentage = (timeLeft / TURN_TIME) * 100;
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 10;

  const getTimerBorderColor = () => {
    if (isUrgent) return '#ef4444';
    if (isWarning) return '#f59e0b';
    return '#10b981';
  };

  // ===== GHI NƯỚC ĐI VÀO DB =====
  const saveMoveToDB = useCallback(async (row, col, player, turnNumber) => {
    const currentMatchId = matchIdRef.current;
    if (!currentMatchId) return; // Chưa có matchId
    try {
      await addMove(currentMatchId, turnNumber, player, row, col);
    } catch (err) {
      console.error('Failed to save move:', err);
    }
  }, []);

  // ===== GHI KẾT QUẢ VÀO DB =====
  const saveResultToDB = useCallback(async (winnerValue) => {
    const currentMatchId = matchIdRef.current;
    if (!currentMatchId) return;
    try {
      const durationSeconds = Math.round((Date.now() - matchStartTime.current) / 1000);
      await endMatch(currentMatchId, winnerValue, durationSeconds);
    } catch (err) {
      console.error('Failed to save result:', err);
    }
  }, []);

  // ===== XỬ LÝ NƯỚC ĐI (internal) =====
  const handleCellClickInternal = useCallback((row, col) => {
    const currentBoard = boardRef.current;
    if (currentBoard[row][col] || gameOverRef.current) return;

    const currentPlayer = isXTurnRef.current ? 'X' : 'O';
    const turnNumber = moveCountRef.current + 1;

    // Cập nhật bàn cờ (immutable)
    const newBoard = currentBoard.map(r => [...r]);
    newBoard[row][col] = currentPlayer;

    setBoard(newBoard);
    setLastMove([row, col]);
    setMoveCount(prev => prev + 1);
    setHintCell(null);

    // Ghi nước đi vào DB (async, không block gameplay)
    saveMoveToDB(row, col, currentPlayer, turnNumber);

    // Kiểm tra thắng (dùng winCount động)
    const winResult = checkWin(newBoard, row, col, currentPlayer, winCount);
    if (winResult) {
      setWinCells(winResult);
      setWinner(currentPlayer);
      pause();
      // Cập nhật tỉ số
      if (currentPlayer === 'X') setScoreX(prev => prev + 1);
      else setScoreO(prev => prev + 1);
      // Ghi kết quả vào DB
      saveResultToDB(currentPlayer);
      return;
    }

    // Kiểm tra hòa
    if (checkDraw(newBoard)) {
      setIsDraw(true);
      pause();
      // Cập nhật tỉ số: hòa +0.5 mỗi bên
      setScoreX(prev => prev + 0.5);
      setScoreO(prev => prev + 0.5);
      // Ghi kết quả hòa vào DB
      saveResultToDB('DRAW');
      return;
    }

    // Đổi lượt chơi
    const nextIsX = !isXTurnRef.current;
    setIsXTurn(nextIsX);
    isXTurnRef.current = nextIsX;
    boardRef.current = newBoard;

    const nextIsAI = gameMode === 'ai' &&
      ((aiSideRef.current === 'X' && nextIsX) || (aiSideRef.current === 'O' && !nextIsX));

    if (nextIsAI) {
      pause();
    } else {
      reset(TURN_TIME);
    }
  }, [gameMode, pause, reset, winCount, saveMoveToDB, saveResultToDB]);

  // ===== XỬ LÝ CLICK Ô CỜ (player) =====
  const handleCellClick = useCallback((row, col) => {
    if (gameOver || isAIThinking || isPaused) return;
    if (gameMode === 'ai' && isAITurn) return;
    handleCellClickInternal(row, col);
  }, [gameOver, isAIThinking, gameMode, isAITurn, handleCellClickInternal, isPaused]);

  // ===== AI TỰ ĐỘNG ĐÁNH =====
  useEffect(() => {
    if (gameMode !== 'ai') return;
    if (!isAITurn) return;
    if (gameOver || isPaused) return;

    setIsAIThinking(true);

    const delay = aiLevel === 'hard' ? 600 : 400;

    const timer = setTimeout(() => {
      const currentBoard = boardRef.current;
      let move;

      if (aiLevel === 'easy') {
        move = getEasyMove(currentBoard);
      } else if (aiLevel === 'medium') {
        move = getMediumMove(currentBoard, aiSide, winCount);
      } else {
        move = getHardMove(currentBoard, aiSide, winCount);
      }

      if (move) {
        handleCellClickInternal(move.row, move.col);
      }

      setIsAIThinking(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [isXTurn, gameOver, gameMode, aiLevel, isAITurn, aiSide, handleCellClickInternal, isPaused]);

  // ===== SMART HINT =====
  const handleHint = useCallback(() => {
    if (gameOver || isAIThinking || hintsRemaining <= 0 || isPaused) return;
    if (gameMode !== 'ai') return;
    const currentPlayer = isXTurn ? 'X' : 'O';
    const hint = getHint([...board.map(r => [...r])], currentPlayer, winCount);
    if (hint) {
      setHintCell([hint.row, hint.col]);
      setHintsRemaining(prev => prev - 1);
    }
  }, [board, isXTurn, gameOver, isAIThinking, hintsRemaining, gameMode, isPaused, winCount]);

  // ===== DELAYED VICTORY MODAL =====
  useEffect(() => {
    if (!winner && !isDraw) return;
    // Wait for win-line animation before showing modal
    const delay = winner ? 1500 : 800; // longer for win (see line), shorter for draw
    const timer = setTimeout(() => setShowVictoryModal(true), delay);
    return () => clearTimeout(timer);
  }, [winner, isDraw]);

  // ===== PAUSE / RESUME =====
  const handlePause = () => {
    if (gameOver || isAIThinking) return;
    setIsPaused(true);
    pause(); // Dừng timer
  };

  const handleResume = () => {
    setIsPaused(false);
    if (!isAITurn) {
      start(); // Tiếp tục timer từ thời gian còn lại
    }
  };

  // ===== RESTART GAME =====
  const handleRestart = () => {
    const newAiSide = randomAISide();
    setBoard(createEmptyBoard(boardSize));
    setIsXTurn(true);
    isXTurnRef.current = true;
    setLastMove(null);
    setWinCells(null);
    setWinner(null);
    setIsDraw(false);
    setMoveCount(0);
    moveCountRef.current = 0;
    setHintCell(null);
    setHintsRemaining(MAX_HINTS);
    setIsAIThinking(false);
    setAiSide(newAiSide);
    aiSideRef.current = newAiSide;
    setIsPaused(false);
    setShowVictoryModal(false);

    if (gameMode === 'ai' && newAiSide === 'X') {
      pause();
    } else {
      reset(TURN_TIME);
    }

    // Tạo trận mới trên DB
    const initNewMatch = async () => {
      try {
        const apiRule = RULE_TO_API[ruleSet] || 'gomoku5';
        const result = await createMatch(gameMode, apiRule, aiLevel, newAiSide);
        if (result.data) {
          setMatchId(result.data.id);
          matchIdRef.current = result.data.id;
        }
      } catch (err) {
        console.error('Failed to create new match:', err);
      }
    };
    initNewMatch();
    matchStartTime.current = Date.now();
  };

  // Labels
  const aiLevelLabel = aiLevel === 'easy' ? 'Easy 🟢' : aiLevel === 'medium' ? 'Medium 🟡' : 'Hard 🔴';

  const playerXLabel = gameMode === 'ai'
    ? (aiSide === 'X' ? 'AI 🤖' : 'You')
    : 'Player 1';
  const playerOLabel = gameMode === 'ai'
    ? (aiSide === 'O' ? 'AI 🤖' : 'You')
    : 'Player 2';

  const isXActive = isXTurn && !gameOver;
  const isOActive = !isXTurn && !gameOver;

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
          <span className="hidden sm:inline">Home</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-pink-900 tracking-wide">
          ⚔️ GOMOKU
          {gameMode === 'ai' && (
            <span className="block text-xs font-normal text-pink-600 text-center">
              vs AI {aiLevelLabel}
            </span>
          )}
        </h1>

        {!gameOver ? (
          <button
            onClick={handlePause}
            disabled={isAIThinking}
            className="flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white/90 text-pink-900 rounded-lg transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>⏸️</span>
            <span className="hidden sm:inline">Pause</span>
          </button>
        ) : (
          <div className="px-4 py-2 opacity-0 pointer-events-none">⏸️</div>
        )}
      </div>

      {/* ===== LUẬT CHƠI BADGE ===== */}
      <div className="mb-2">
        <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-semibold text-pink-600 border border-pink-200">
          {RULE_LABELS[ruleSet]}
        </span>
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
            {gameMode === 'local' && (scoreX > 0 || scoreO > 0) && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-black ${
                isXTurn && !gameOver ? 'bg-white/30 text-white' : 'bg-pink-200 text-pink-700'
              }`}>{Number.isInteger(scoreX) ? scoreX : scoreX.toFixed(1)}</span>
            )}
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
            {gameMode === 'local' && (scoreX > 0 || scoreO > 0) && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-black ${
                !isXTurn && !gameOver ? 'bg-white/30 text-white' : 'bg-pink-200 text-pink-700'
              }`}>{Number.isInteger(scoreO) ? scoreO : scoreO.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>

      {/* ===== AI THINKING INDICATOR ===== */}
      {isAIThinking && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg shadow-sm animate-slide-in">
          <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-ai-thinking" />
          <span className="text-pink-600 text-sm font-medium">AI is thinking...</span>
        </div>
      )}



      {/* ===== MODAL KẾT QUẢ (THẮNG / HÒA) ===== */}
      {showVictoryModal && (
        <VictoryModal
          winner={winner}
          isDraw={isDraw}
          gameMode={gameMode}
          aiSide={aiSide}
          onBack={onBack}
          onRestart={handleRestart}
        />
      )}

      {/* ===== PAUSE MODAL ===== */}
      {isPaused && !gameOver && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onBack={onBack}
        />
      )}

      {/* Số nước đi + Nút Hint */}
      <div className="mb-3 flex items-center gap-4">
        <span className="text-pink-700 text-sm">
          Moves: {moveCount}
        </span>

        {/* Nút gợi ý - CHỈ hiện trong chế độ AI, khi lượt player */}
        {gameMode === 'ai' && !gameOver && !isAITurn && (
          <button
            onClick={handleHint}
            disabled={isAIThinking || hintsRemaining <= 0 || isPaused}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg shadow-md shadow-blue-300/30 hover:shadow-blue-300/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>💡</span>
            <span>Hint ({hintsRemaining}/{MAX_HINTS})</span>
          </button>
        )}
      </div>

      {/* ===== BÀN CỜ ===== */}
      <div className={`overflow-auto max-w-full transition-all duration-300 ${isPaused ? 'blur-md pointer-events-none' : ''}`}>
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
         Click an empty cell to place your piece
      </div>
    </div>
  );
}
