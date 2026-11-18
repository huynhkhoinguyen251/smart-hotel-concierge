import { useId, useState } from 'react';
import { MAX_RATING, MIN_RATING } from '../../config/reviews.js';

const STAR_PATH =
  'M10 1.6l2.57 5.2 5.74.84-4.15 4.05.98 5.71L10 14.7l-5.14 2.7.98-5.71L1.69 7.64l5.74-.84z';
const STARS = Array.from({ length: MAX_RATING - MIN_RATING + 1 }, (_, index) => MIN_RATING + index);

// Chọn điểm 1–5 sao. Mỗi sao là một radio có nhãn "4 stars", nên dùng được bằng bàn phím
// (Tab vào nhóm, phím mũi tên để đổi) và trình đọc màn hình. Rê chuột thì sáng tạm các sao.
// value: 0 nghĩa là chưa chọn.
export default function StarRatingInput({ value, onChange, label = 'Your rating', error, disabled = false }) {
  const name = useId();
  const errorId = `${name}-error`;
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <fieldset aria-describedby={error ? errorId : undefined} disabled={disabled}>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">{label}</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
        {STARS.map((star) => (
          <label
            key={star}
            className={`rounded ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onMouseEnter={() => !disabled && setHovered(star)}
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="peer sr-only"
            />
            <span className="sr-only">{`${star} ${star === 1 ? 'star' : 'stars'}`}</span>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className={`h-8 w-8 rounded transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700 ${
                star <= shown ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              <path d={STAR_PATH} />
            </svg>
          </label>
        ))}
        <span className="ml-2 text-sm text-slate-600" aria-hidden="true">
          {shown ? `${shown} / ${MAX_RATING}` : ''}
        </span>
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
