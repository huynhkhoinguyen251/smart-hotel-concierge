import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Khoảng trống chừa lại cạnh tab đang chọn khi cuộn (px).
const TAB_MARGIN = 32;

// Hàng tab lọc gạch chân (trạng thái, loại dịch vụ). Mỗi tab là một link,
// nên lựa chọn nằm trên địa chỉ trang. tabs: [{ value, label }]; getLink(value) trả đường dẫn.
// Trên điện thoại các tab cuộn ngang bên trong khung (không hiện thanh cuộn), trang không bị cuộn ngang.
export default function FilterTabs({ tabs, active, getLink, label, className = '' }) {
  const scrollerRef = useRef(null);

  // Tab đang chọn nằm ngoài khung nhìn thì cuộn khung (không cuộn trang) cho thấy nó.
  // Làm lại khi font tải xong, vì lúc đó chữ mới có độ rộng thật.
  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      const scroller = scrollerRef.current;
      const current = scroller?.querySelector('[aria-current]');
      if (cancelled || !current) return;
      const box = scroller.getBoundingClientRect();
      const tab = current.getBoundingClientRect();
      if (tab.right > box.right) scroller.scrollLeft += tab.right - box.right + TAB_MARGIN;
      else if (tab.left < box.left) scroller.scrollLeft -= box.left - tab.left + TAB_MARGIN;
    };
    reveal();
    document.fonts?.ready.then(reveal);
    return () => {
      cancelled = true;
    };
  }, [active]);

  return (
    <nav
      ref={scrollerRef}
      aria-label={label}
      className={`-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      <ul className="flex w-max min-w-full gap-6 border-b border-line-soft">
        {tabs.map((tab) => {
          const isActive = tab.value === active;
          return (
            <li key={tab.value || 'all'} className="-mb-px">
              <Link
                to={getLink(tab.value)}
                aria-current={isActive ? 'page' : undefined}
                className={`block border-b-2 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:-outline-offset-2 ${
                  isActive
                    ? 'border-sea text-sea'
                    : 'border-transparent text-ink-soft hover:border-sea-line hover:text-ink'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
