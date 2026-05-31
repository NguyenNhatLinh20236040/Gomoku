// ==========================================
// AILevelModal.jsx - AI difficulty selection popup
// ==========================================

/**
 * @param {function} onSelect - Callback: onSelect('easy') | 'medium' | 'hard'
 * @param {function} onClose  - Close popup
 */
export default function AILevelModal({ onSelect, onClose }) {
  const levels = [
    { id: 'easy', label: 'Easy', emoji: '🟢', desc: 'Random moves', color: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-300/40 hover:shadow-emerald-300/60' },
    { id: 'medium', label: 'Medium', emoji: '🟡', desc: 'Strategic AI', color: 'bg-amber-500 hover:bg-amber-400 shadow-amber-300/40 hover:shadow-amber-300/60' },
    { id: 'hard', label: 'Hard', emoji: '🔴', desc: 'Advanced algorithm', color: 'bg-red-500 hover:bg-red-400 shadow-red-300/40 hover:shadow-red-300/60' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="animate-modal-in bg-white/95 rounded-xl shadow-2xl shadow-pink-300/30 px-8 py-10 mx-4 max-w-sm w-full text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">🤖</div>
        <h2 className="text-2xl font-extrabold text-pink-800 mb-2">Play vs AI</h2>
        <p className="text-pink-500 text-sm mb-8">Choose your challenge</p>

        <div className="space-y-3">
          {levels.map(level => (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={`w-full py-3.5 px-6 ${level.color} text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-4`}
            >
              <span className="text-2xl w-8 text-center shrink-0">{level.emoji}</span>
              <div className="text-left">
                <span className="text-lg leading-tight">{level.label}</span>
                <span className="block text-sm font-normal opacity-90">{level.desc}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 text-pink-400 hover:text-pink-600 text-sm font-medium transition-colors cursor-pointer"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
