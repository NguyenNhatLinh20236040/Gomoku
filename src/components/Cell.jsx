// ==========================================
// Cell.jsx - Component ô cờ đơn lẻ
// ==========================================
// Mỗi Cell hiển thị: trống, X, hoặc O
// Có hiệu ứng hover, highlight nước đi cuối,
// highlight khi thắng, và highlight gợi ý.

/**
 * @param {string|null} value - 'X', 'O', hoặc null
 * @param {function} onClick - Xử lý click
 * @param {boolean} isLastMove - Có phải nước đi cuối không
 * @param {boolean} isWinCell - Có phải ô trong đường thắng không
 * @param {boolean} isHintCell - Có phải ô gợi ý không
 * @param {boolean} disabled - Không cho click (game đã kết thúc)
 */
export default function Cell({ value, onClick, isLastMove, isWinCell, isHintCell, disabled, large }) {
  const pieceClass = value === 'X'
    ? 'text-pink-600 font-extrabold'
    : 'text-pink-500 font-extrabold';

  const sizeClass = large ? 'text-4xl' : 'text-lg sm:text-xl md:text-2xl';

  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        w-full aspect-square
        border border-gray-300
        flex items-center justify-center
        ${sizeClass}
        transition-all duration-150
        cursor-pointer
        ${!value && !disabled ? 'hover:bg-pink-50' : ''}
        ${isLastMove ? 'bg-yellow-100 animate-pulse-glow' : 'bg-white'}
        ${isWinCell ? 'bg-green-200 animate-win-blink' : ''}
        ${isHintCell && !value ? 'animate-hint-glow' : ''}
        ${value ? 'cursor-default' : ''}
        ${disabled && !value ? 'cursor-not-allowed' : ''}
      `}
      aria-label={`Cell ${value || 'empty'}`}
    >
      {value && (
        <span className={`${pieceClass} animate-bounce-in select-none`}>
          {value}
        </span>
      )}
      {isHintCell && !value && (
        <span className={`${large ? 'w-5 h-5' : 'w-3 h-3'} rounded-full bg-blue-400/70 animate-bounce-in`} />
      )}
    </button>
  );
}
