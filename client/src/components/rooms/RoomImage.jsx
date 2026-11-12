import { useState } from 'react';
import getImageUrl from '../../utils/getImageUrl.js';

// Ảnh phòng. Không có ảnh hoặc ảnh lỗi thì hiện khối màu xám trung tính.
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
        className={`flex items-center justify-center bg-slate-200 text-slate-400 ${className}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="M21 16l-5-5-8 8" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailedUrl(url)}
      className={`bg-slate-200 object-cover ${className}`}
    />
  );
}
