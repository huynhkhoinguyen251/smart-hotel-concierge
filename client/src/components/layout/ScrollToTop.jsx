import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Mở trang khác thì lên đầu trang. Bấm Back/Forward thì giữ nguyên, và đổi bộ lọc
// (cùng đường dẫn, chỉ khác phần sau dấu ?) thì không cuộn.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
