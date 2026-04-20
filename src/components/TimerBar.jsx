// ==========================================
// TimerBar.jsx - Thanh đếm ngược visual
// ==========================================
// Hiển thị thời gian còn lại dạng progress bar.
// Đổi màu theo thời gian: xanh → vàng → đỏ.
// Pulse animation khi còn < 5 giây.

/**
 * @param {number} timeLeft - Số giây còn lại
 * @param {number} maxTime - Tổng thời gian mỗi lượt
 * @param {boolean} isRunning - Timer đang chạy?
 */
export default function TimerBar({ timeLeft, maxTime = 30, isRunning }) {
  const percentage = (timeLeft / maxTime) * 100;
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 10;

  // Chọn màu theo thời gian còn lại
  const getBarColor = () => {
    if (isUrgent) return 'bg-red-500';
    if (isWarning) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  const getTextColor = () => {
    if (isUrgent) return 'text-red-600';
    if (isWarning) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getGlowColor = () => {
    if (isUrgent) return 'shadow-red-400/50';
    if (isWarning) return 'shadow-amber-300/50';
    return 'shadow-emerald-300/50';
  };

  return (
    <div className="w-full max-w-md mx-auto mb-3">
      {/* Thời gian số */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-pink-500 font-medium">⏱ Thời gian</span>
        <span className={`
          text-sm font-bold tabular-nums
          ${getTextColor()}
          ${isUrgent && isRunning ? 'animate-timer-pulse' : ''}
        `}>
          {timeLeft}s
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`
            h-full rounded-full transition-all duration-1000 ease-linear
            ${getBarColor()}
            ${isUrgent && isRunning ? 'animate-timer-pulse' : ''}
            shadow-md ${getGlowColor()}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
