import { useCallback, useSyncExternalStore } from 'react';

// true khi màn hình khớp điều kiện CSS, ví dụ '(min-width: 64rem)'. Tự cập nhật khi đổi kích thước.
export default function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

// Màn hình rộng (giống điểm chia "lg" của Tailwind).
export const DESKTOP_QUERY = '(min-width: 64rem)';
