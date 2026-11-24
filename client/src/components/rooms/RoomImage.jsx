import { useState } from 'react';
import getImageUrl from '../../utils/getImageUrl.js';

// Hình thay thế khi chưa có ảnh: bờ biển vẽ bằng vài mảng màu phẳng, vừa với mọi kích thước.
function CoastDrawing() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="size-full" aria-hidden="true">
      <rect width="400" height="300" fill="#e6f0f4" />
      <path
        d="M0 176c44-6 72-40 112-46 30-4 48 22 78 26 34 4 52-30 92-34 46-4 76 40 118 48v30H0z"
        fill="#cfe0e8"
      />
      <rect y="176" width="400" height="124" fill="#b4d0dc" />
      <path
        d="M36 206h84M168 196h120M318 212h56M70 236h128M250 240h96M24 266h70M140 272h150"
        fill="none"
        stroke="#e6f0f4"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Ảnh phòng, dịch vụ, món ăn, tour. Không có ảnh hoặc ảnh lỗi thì hiện hình vẽ thay thế.
// className quyết định kích thước, ví dụ "aspect-[4/3] w-full".
export default function RoomImage({ src, alt, className = '' }) {
  const url = getImageUrl(src);
  // Nhớ đường dẫn bị lỗi, nên khi đổi sang ảnh khác thì tự thử lại.
  const [failedUrl, setFailedUrl] = useState(null);

  if (!url || failedUrl === url) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} (no image)` : 'No image'}
        className={`overflow-hidden bg-sea-tint ${className}`}
      >
        <CoastDrawing />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedUrl(url)}
      className={`bg-sea-tint object-cover ${className}`}
    />
  );
}
