// ==========================================
// PauseModal.jsx - Game paused overlay
// ==========================================

/**
 * @param {function} onResume  - Continue playing
 * @param {function} onRestart - New game
 * @param {function} onBack    - Back to menu
 */
export default function PauseModal({ onResume, onRestart, onBack }) {
  const buttons = [
    { label: 'Resume', emoji: '▶️', onClick: onResume, color: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-300/40 hover:shadow-emerald-300/60' },
    { label: 'Restart', emoji: '↻', onClick: onRestart, color: 'bg-amber-500 hover:bg-amber-400 shadow-amber-300/40 hover:shadow-amber-300/60' },
    { label: 'Menu', emoji: '🏠', onClick: onBack, color: 'bg-pink-500 hover:bg-pink-400 shadow-pink-300/40 hover:shadow-pink-300/60' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="animate-modal-in bg-white/95 rounded-xl shadow-2xl shadow-pink-300/30 px-8 py-10 mx-4 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">⏸️</div>
        <h2 className="text-2xl font-extrabold text-pink-800 mb-2">PAUSED</h2>
        <p className="text-pink-500 text-sm mb-8">Game is paused</p>

        <div className="space-y-3">
          {buttons.map(btn => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className={`w-full py-3.5 px-6 ${btn.color} text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-4`}
            >
              <span className="text-2xl w-8 text-center shrink-0">{btn.emoji}</span>
              <span className="text-lg">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
