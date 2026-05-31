// ==========================================
// RuleModal.jsx - Rule selection popup
// ==========================================

/**
 * @param {function} onSelect - Callback: onSelect('3row') | '5row'
 * @param {function} onClose  - Close popup
 */
export default function RuleModal({ onSelect, onClose }) {
  const rules = [
    {
      id: '3row',
      label: '3-in-a-row',
      emoji: '⚡',
      desc: '3×3 board — Quick match',
      color: 'bg-sky-500 hover:bg-sky-400 shadow-sky-300/40 hover:shadow-sky-300/60',
    },
    {
      id: '5row',
      label: '5-in-a-row',
      emoji: '⭐',
      desc: '15×15 board — Classic Gomoku',
      color: 'bg-pink-600 hover:bg-pink-500 shadow-pink-300/40 hover:shadow-pink-300/60',
    },
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
        <div className="text-5xl mb-4">📏</div>
        <h2 className="text-2xl font-extrabold text-pink-800 mb-2">Choose Rules</h2>
        <p className="text-pink-500 text-sm mb-6">Each rule has a different way to win</p>

        <div className="space-y-3">
          {rules.map(rule => (
            <button
              key={rule.id}
              onClick={() => onSelect(rule.id)}
              className={`w-full py-3.5 px-6 ${rule.color} text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-4`}
            >
              <span className="text-2xl w-8 text-center shrink-0">{rule.emoji}</span>
              <div className="text-left">
                <span className="text-lg leading-tight">{rule.label}</span>
                <span className="block text-sm font-normal opacity-90">{rule.desc}</span>
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
