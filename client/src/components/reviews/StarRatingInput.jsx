import { cloneElement, useId, useState } from 'react';
import { Rate } from 'antd';
import { MAX_RATING, MIN_RATING } from '../../config/reviews.js';

const STARS = Array.from({ length: MAX_RATING - MIN_RATING + 1 }, (_, index) => MIN_RATING + index);

// Sao của antd chỉ dùng cho chuột và màn hình cảm ứng, nên bỏ khỏi thứ tự Tab (xem ghi chú bên dưới).
const renderStar = (star) => cloneElement(star, {}, cloneElement(star.props.children, { tabIndex: -1 }));

// Không để cú bấm chuột đưa con trỏ bàn phím vào phần sao (phần này ẩn với trình đọc màn hình).
const keepFocus = (event) => event.preventDefault();

// Chọn điểm 1–5 sao. Rê chuột thì sáng tạm các sao. value: 0 nghĩa là chưa chọn.
// Nhóm radio ẩn lo phần bàn phím (Tab vào nhóm, phím mũi tên để đổi) và trình đọc màn hình
// (mỗi lựa chọn đọc "4 stars"), vì Rate của antd không có nhãn cho từng sao và tốn 6 lần bấm Tab.
export default function StarRatingInput({ value, onChange, label = 'Your rating', error, disabled = false }) {
  const name = useId();
  const errorId = `${name}-error`;
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <fieldset aria-describedby={error ? errorId : undefined} disabled={disabled}>
      <legend className="mb-1 text-sm font-medium text-ink">{label}</legend>
      <div className="relative flex w-fit items-center gap-2 rounded-control outline-offset-2 outline-sea has-[:focus-visible]:outline-2">
        <div className="sr-only">
          {STARS.map((star) => (
            <label key={star}>
              <input
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
              />
              {`${star} ${star === 1 ? 'star' : 'stars'}`}
            </label>
          ))}
        </div>
        <div aria-hidden="true" onMouseDown={keepFocus}>
          <Rate
            count={MAX_RATING}
            value={value}
            onChange={onChange}
            onHoverChange={(star) => setHovered(star ?? 0)}
            allowClear={false}
            keyboard={false}
            disabled={disabled}
            tabIndex={-1}
            characterRender={renderStar}
            className="-ml-1.5 text-3xl [&_.ant-rate-star]:m-0 [&_.ant-rate-star>div]:p-1.5"
          />
        </div>
        <span className="min-w-10 text-sm text-ink-soft" aria-hidden="true">
          {shown ? `${shown} / ${MAX_RATING}` : ''}
        </span>
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
