// ==========================================
// MatchReplay.jsx - Xem lại trận đấu
// ==========================================
// Load moves từ DB, hiển thị bàn cờ với controls
// step-by-step forward/backward.

import { useState, useEffect, useRef, useCallback } from 'react';
import { getMatchDetail } from '../utils/apiClient';
import { createEmptyBoard, checkWin } from '../utils/checkWin';
import Board from './Board';

const MODE_LABELS = { local: '👥 Local', ai: '🤖 vs AI' };
const RULE_LABELS = { gomoku3: '3×3 ⚡', gomoku5: '15×15 ⭐' };
const AI_LEVEL_LABELS = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' };
const RULE_BOARD_SIZE = { gomoku3: 3, gomoku5: 15 };
const RULE_WIN_COUNT = { gomoku3: 3, gomoku5: 5 };



/**
 * @param {number} matchId - ID trận đấu
 * @param {function} onBack - Quay về Match History
 */
export default function MatchReplay({ matchId, onBack }) {
  const [matchData, setMatchData] = useState(null);
  const [moves, setMoves] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  // Load match detail
  useEffect(() => {
    const loadMatch = async () => {
      setLoading(true);
      try {
        const res = await getMatchDetail(matchId);
        if (res.data) {
          setMatchData(res.data.match);
          setMoves(res.data.moves || []);
        }
      } catch (err) {
        console.error('Failed to load match:', err);
      }
      setLoading(false);
    };
    loadMatch();
  }, [matchId]);

  // Derived values
  const boardSize = matchData ? (RULE_BOARD_SIZE[matchData.rule] || 15) : 15;
  const winCount = matchData ? (RULE_WIN_COUNT[matchData.rule] || 5) : 5;

  // Build board state tại currentStep
  const buildBoardAtStep = useCallback((step) => {
    const board = createEmptyBoard(boardSize);
    const visibleMoves = moves.slice(0, step);
    for (const move of visibleMoves) {
      if (move.row >= 0 && move.row < boardSize && move.col >= 0 && move.col < boardSize) {
        board[move.row][move.col] = move.player;
      }
    }
    return board;
  }, [moves, boardSize]);

  const board = buildBoardAtStep(currentStep);

  // Last move highlight
  const lastMove = currentStep > 0
    ? [moves[currentStep - 1].row, moves[currentStep - 1].col]
    : null;

  // Check win at current step
  const getWinCells = useCallback(() => {
    if (currentStep === 0) return null;
    const lastMoveData = moves[currentStep - 1];
    if (!lastMoveData) return null;
    return checkWin(board, lastMoveData.row, lastMoveData.col, lastMoveData.player, winCount);
  }, [board, currentStep, moves, winCount]);

  const winCells = getWinCells();

  // Auto-play logic (tốc độ cố định 1s)
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= moves.length) {
            setIsPlaying(false);
            clearInterval(playIntervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, moves.length]);

  // Controls
  const handlePlay = () => {
    if (currentStep >= moves.length) {
      setCurrentStep(0);
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(true);
    }
  };
  const handlePause = () => setIsPlaying(false);
  const handleFirst = () => { setIsPlaying(false); setCurrentStep(0); };
  const handleLast = () => { setIsPlaying(false); setCurrentStep(moves.length); };
  const handlePrev = () => { setIsPlaying(false); setCurrentStep(prev => Math.max(0, prev - 1)); };
  const handleNext = () => { setIsPlaying(false); setCurrentStep(prev => Math.min(moves.length, prev + 1)); };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-ai-thinking mx-auto mb-4" />
          <p className="text-pink-600 font-medium">Loading replay...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-pink-700 font-bold text-lg mb-4">Match not found</p>
          <button onClick={onBack} className="px-6 py-2 bg-pink-600 text-white rounded-lg cursor-pointer">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const currentMoveData = currentStep > 0 ? moves[currentStep - 1] : null;
  const progress = moves.length > 0 ? (currentStep / moves.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 flex flex-col items-center py-4 px-2 text-pink-900">

      {/* ===== HEADER ===== */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white/90 text-pink-900 rounded-lg transition-all cursor-pointer shadow-sm"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-pink-900 tracking-wide text-center">
          🎬 Match Replay
          <span className="block text-xs font-normal text-pink-500">
            Match #{matchData.id}
          </span>
        </h1>

        <div className="w-20" />
      </div>

      {/* ===== MATCH INFO ===== */}
      <div className="w-full max-w-2xl bg-white/70 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-center gap-3 text-xs text-pink-600 border border-pink-100 animate-fade-in">
        <span className="font-semibold">{MODE_LABELS[matchData.mode]}</span>
        <span>•</span>
        <span>{RULE_LABELS[matchData.rule]}</span>
        {matchData.ai_level && (
          <>
            <span>•</span>
            <span>{AI_LEVEL_LABELS[matchData.ai_level]}</span>
          </>
        )}
        <span>•</span>
        <span className="font-bold">
          {matchData.winner === 'DRAW' ? '🤝 Draw' : `🏆 ${matchData.winner} Wins`}
        </span>
        <span>•</span>
        <span>{matchData.total_moves} moves</span>
      </div>

      {/* ===== STEP INDICATOR ===== */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-pink-700 text-sm font-medium">
          Move: {currentStep} / {moves.length}
        </span>
        {currentMoveData && (
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-bold
            ${currentMoveData.player === 'X'
              ? 'bg-pink-600 text-white'
              : 'bg-pink-400 text-white'}
          `}>
            {currentMoveData.player} → ({currentMoveData.row + 1}, {String.fromCharCode(65 + currentMoveData.col)})
          </span>
        )}
      </div>

      {/* ===== PROGRESS BAR ===== */}
      <div className="w-full max-w-md mb-4 px-4">
        <div className="w-full h-2 bg-pink-200/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ===== BÀN CỜ ===== */}
      <div className="overflow-auto max-w-full mb-4">
        <Board
          board={board}
          onCellClick={() => {}} // Read-only
          lastMove={lastMove}
          winCells={winCells}
          hintCell={null}
          gameOver={currentStep === moves.length && matchData.winner}
        />
      </div>

      {/* ===== REPLAY CONTROLS ===== */}
      <div className="flex items-center gap-2 bg-white/80 rounded-xl px-4 py-3 shadow-sm border border-pink-100 animate-slide-in">
        {/* First */}
        <button
          onClick={handleFirst}
          disabled={currentStep === 0}
          className="replay-btn"
          title="First move"
        >
          ⏮
        </button>

        {/* Previous */}
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="replay-btn"
          title="Previous move"
        >
          ◀
        </button>

        {/* Play / Pause */}
        {isPlaying ? (
          <button
            onClick={handlePause}
            className="replay-btn-primary"
            title="Pause"
          >
            ⏸
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="replay-btn-primary"
            title="Auto Play"
          >
            ▶
          </button>
        )}

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={currentStep >= moves.length}
          className="replay-btn"
          title="Next move"
        >
          ▶
        </button>

        {/* Last */}
        <button
          onClick={handleLast}
          disabled={currentStep >= moves.length}
          className="replay-btn"
          title="Last move"
        >
          ⏭
        </button>
      </div>

      {/* ===== MOVE LIST (scrollable) ===== */}
      <div className="w-full max-w-2xl mt-4">
        <h3 className="text-sm font-bold text-pink-700 mb-2 px-2">📝 Move List</h3>
        <div className="bg-white/70 rounded-xl p-3 border border-pink-100 max-h-40 overflow-y-auto custom-scrollbar">
          <div className="flex flex-wrap gap-1.5">
            {moves.map((move, idx) => (
              <button
                key={idx}
                onClick={() => { setIsPlaying(false); setCurrentStep(idx + 1); }}
                className={`
                  px-2 py-1 rounded text-xs font-mono cursor-pointer transition-all
                  ${idx < currentStep
                    ? (move.player === 'X' ? 'bg-pink-200 text-pink-800' : 'bg-pink-100 text-pink-600')
                    : 'bg-gray-100 text-gray-400'}
                  ${idx === currentStep - 1 ? 'ring-2 ring-pink-500 ring-offset-1 font-bold' : ''}
                  hover:scale-105
                `}
              >
                {idx + 1}. {move.player}({move.row + 1},{String.fromCharCode(65 + move.col)})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
