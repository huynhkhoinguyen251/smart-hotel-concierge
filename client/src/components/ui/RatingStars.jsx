import { Rate } from 'antd';

const SIZES = { sm: 'text-base', md: 'text-xl' };

// Sao chỉ để xem. Điểm thập phân được làm tròn tới nửa sao gần nhất (4.3 thành 4.5 sao),
// còn con số hiện bên cạnh giữ nguyên giá trị thật.
export default function RatingStars({ rating, size = 'sm', showValue = true, className = '' }) {
  const value = Number(rating) || 0;
  const rounded = Math.round(value * 2) / 2;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="img"
      aria-label={`Rated ${value} out of 5`}
    >
      <Rate disabled allowHalf value={rounded} className={`leading-none ${SIZES[size] ?? SIZES.sm}`} />
      {showValue && <span className="text-sm font-semibold text-ink">{value.toFixed(1)}</span>}
    </span>
  );
}
