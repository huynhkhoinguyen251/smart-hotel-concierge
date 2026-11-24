import { Link, useLocation } from 'react-router-dom';

// Thanh chuyển mục bên trong một phần, ví dụ Rooms / Room types (admin), Tours / Transport (khách).
// Dạng khối liền, khác hẳn hàng tab gạch chân của trạng thái.
// tabs: [{ to, label, match?(pathname) }]; không có match thì mục đang chọn khi đường dẫn trùng khít.
// Trên điện thoại hàng này cuộn ngang bên trong khung, trang không bị cuộn ngang.
export default function SectionNav({ tabs, label }) {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label={label}
      className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-1 rounded-panel bg-line-soft p-1">
        {tabs.map((tab) => {
          const active = tab.match ? tab.match(pathname) : pathname === tab.to;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-control px-4 py-2.5 text-sm font-medium whitespace-nowrap sm:py-1.5 transition-colors duration-150 ${
                  active ? 'bg-white text-sea shadow-quiet' : 'text-ink-soft hover:text-ink'
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
