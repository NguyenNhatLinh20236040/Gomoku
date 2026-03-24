// ==========================================
// HomePage.jsx - Trang chủ
// ==========================================
// Giao diện chào mừng với các nút lựa chọn
// chế độ chơi. Milestone 1: chỉ có Local 2P.

export default function HomePage({ onStartGame }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 flex flex-col items-center justify-center px-4 text-pink-900">

      {/* ===== LOGO & TITLE ===== */}
      <div className="text-center mb-10 animate-fade-in">
        {/* Icon bàn cờ */}
        <div className="w-24 h-24 mx-auto mb-6 bg-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-300/60">
          <div className="grid grid-cols-3 gap-1">
            {['X', '', 'O', '', 'X', '', 'O', '', 'X'].map((v, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold
                  ${v === 'X' ? 'bg-white text-pink-600' : ''}
                  ${v === 'O' ? 'bg-pink-400 text-white' : ''}
                  ${!v ? 'bg-pink-200/60' : ''}
                `}
              >
                {v}
              </div>
            ))}
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl font-black text-pink-900 tracking-tight mb-3">
          GOMOKU
        </h1>
        <p className="text-pink-700 text-lg">
          Cờ Caro - Năm quân liên tiếp để chiến thắng
        </p>
      </div>

      {/* ===== CÁC CHẾ ĐỘ CHƠI ===== */}
      <div className="w-full max-w-md space-y-4 animate-fade-in">

        {/* Chơi 2 người - Local */}
        <button
          onClick={onStartGame}
          className="w-full py-4 px-6 bg-pink-600 hover:bg-pink-500 text-white text-xl font-bold rounded-xl shadow-lg shadow-pink-400/40 hover:shadow-pink-400/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
           Chơi 2 Người (Local)
        </button>

        {/* Chơi với AI - sẽ thêm ở milestone 2 */}
        <button
          disabled
          className="w-full py-4 px-6 bg-white/70 text-pink-300 text-xl font-bold rounded-xl border border-white/80 cursor-not-allowed"
        >
           Chơi với AI
          <span className="block text-sm font-normal mt-1 text-pink-300">
            Sắp ra mắt - Milestone 2
          </span>
        </button>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-12 text-pink-700 text-sm">
        <p>© 2023 Gomoku Game. All rights reserved.</p>
      </div>
    </div>
  );
}
