const STAR_PATH =
  'M10 1.6l2.57 5.2 5.74.84-4.15 4.05.98 5.71L10 14.7l-5.14 2.7.98-5.71L1.69 7.64l5.74-.84z';

const SIZES = { sm: 'h-4 w-4', md: 'h-5 w-5' };

function StarIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path d={STAR_PATH} />
    </svg>
  );
}

// fill: 0 (rỗng), 0.5 (nửa sao) hoặc 1 (đầy).
function Star({ fill, sizeClass }) {
  return (
    <span className={`relative inline-block shrink-0 ${sizeClass}`}>
      <StarIcon className={`absolute inset-0 ${sizeClass} text-slate-300`} />
      {fill > 0 && (
        <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
          <StarIcon className={`${sizeClass} text-amber-400`} />
        </span>
      )}
    </span>
  );
}

// Sao chỉ để xem. Điểm thập phân được làm tròn tới nửa sao gần nhất (4.3 thành 4.5 sao),
// còn con số hiện bên cạnh giữ nguyên giá trị thật.
export default function RatingStars({ rating, size = 'sm', showValue = true, className = '' }) {
  const value = Number(rating) || 0;
  const rounded = Math.round(value * 2) / 2;
  const sizeClass = SIZES[size] ?? SIZES.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="img"
      aria-label={`Rated ${value} out of 5`}
    >
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((position) => (
          <Star
            key={position}
            sizeClass={sizeClass}
            fill={Math.min(1, Math.max(0, rounded - position + 1))}
          />
        ))}
      </span>
      {showValue && <span className="text-sm font-semibold text-slate-800">{value.toFixed(1)}</span>}
    </span>
  );
}
