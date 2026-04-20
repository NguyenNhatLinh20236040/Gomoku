// ==========================================
// AILevelModal.jsx - Popup chọn độ khó AI
// ==========================================
// Hiển thị modal chọn Easy / Medium
// giống style VictoryModal.

/**
 * @param {function} onSelect - Callback chọn level: onSelect('easy') | onSelect('medium')
 * @param {function} onClose  - Đóng popup
 */
export default function AILevelModal({ onSelect, onClose }) {
  return (
    /* ===== OVERLAY ===== */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* ===== MODAL CARD ===== */}
      <div
        className="animate-modal-in bg-white/95 rounded-xl shadow-2xl shadow-pink-300/30 px-8 py-10 mx-4 max-w-sm w-full text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="text-5xl mb-4">🤖</div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-pink-800 mb-2">
          Chơi với AI
        </h2>
        <p className="text-pink-500 text-sm mb-8">
          Chọn độ khó bạn muốn thử sức
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          {/* Easy */}
          <button
            onClick={() => onSelect('easy')}
            className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold rounded-xl shadow-lg shadow-emerald-300/40 hover:shadow-emerald-300/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🟢</span>
            <div className="text-left">
              <span>Easy</span>
              <span className="block text-sm font-normal opacity-90">AI đánh ngẫu nhiên</span>
            </div>
          </button>

          {/* Medium */}
          <button
            onClick={() => onSelect('medium')}
            className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-white text-lg font-bold rounded-xl shadow-lg shadow-amber-300/40 hover:shadow-amber-300/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🟡</span>
            <div className="text-left">
              <span>Medium</span>
              <span className="block text-sm font-normal opacity-90">AI có chiến thuật</span>
            </div>
          </button>
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 text-pink-400 hover:text-pink-600 text-sm font-medium transition-colors cursor-pointer"
        >
          ← Quay lại
        </button>
      </div>
    </div>
  );
}
