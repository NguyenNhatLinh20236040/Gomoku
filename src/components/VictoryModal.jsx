// ==========================================
// VictoryModal.jsx - Victory / Draw result popup
// ==========================================

/**
 * @param {string}   winner    - 'X' or 'O' (null if draw)
 * @param {boolean}  isDraw    - true if draw
 * @param {string}   gameMode  - 'local' | 'ai'
 * @param {string}   aiSide    - 'X' | 'O'
 * @param {function} onBack    - Go to menu
 * @param {function} onRestart - Play again
 */
export default function VictoryModal({ winner, isDraw, gameMode, aiSide, onBack, onRestart }) {
  const getPlayerName = () => {
    if (gameMode === 'ai') {
      return winner === aiSide ? 'AI 🤖' : 'You';
    }
    return winner === 'X' ? 'Player 1' : 'Player 2';
  };

  const playerName = winner ? getPlayerName() : '';
  const isPlayerWin = gameMode === 'ai' && winner !== aiSide;
  const isAIWin = gameMode === 'ai' && winner === aiSide;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">

      {/* Confetti on player win */}
      {isPlayerWin && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                backgroundColor: ['#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'][i % 6],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="animate-modal-in bg-white/95 rounded-xl shadow-2xl shadow-pink-300/30 px-8 py-10 mx-4 max-w-sm w-full text-center relative">
        <div className="text-5xl mb-4">
          {isDraw ? '🤝' : isAIWin ? '😔' : '🎉'}
        </div>

        {isDraw ? (
          <>
            <h2 className="text-2xl font-extrabold text-amber-600 mb-1">DRAW!</h2>
            <p className="text-lg font-bold text-amber-500 mb-8 tracking-wide">No empty cells left.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-pink-700 mb-1">
              {playerName} {winner && `(${winner})`}
            </h2>
            <p className="text-lg font-bold text-pink-600 mb-8 tracking-wide">
              {isAIWin ? 'AI WINS!' : 'WINS!'}
            </p>
          </>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-lg bg-white border-2 border-pink-300 text-pink-700 font-semibold hover:bg-pink-50 hover:border-pink-400 transition-all cursor-pointer"
          >
            Menu
          </button>
          <button
            onClick={onRestart}
            className="px-6 py-2.5 rounded-lg bg-pink-600 text-white font-semibold shadow-lg shadow-pink-300/40 hover:bg-pink-500 hover:shadow-pink-300/60 transition-all cursor-pointer"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
