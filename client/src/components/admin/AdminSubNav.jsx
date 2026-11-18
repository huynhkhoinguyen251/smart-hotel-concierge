import { Link, useLocation } from 'react-router-dom';

// Thanh điều hướng phụ dạng tab (gạch chân) bên trong một mục admin, ví dụ Rooms / Room types / Amenities.
// tabs: [{ to, label, match?(pathname) }]; không có match thì tab đang chọn khi đường dẫn trùng khít.
// Trên điện thoại các tab cuộn ngang bên trong khung, trang không bị cuộn ngang.
// overflow-y-hidden: -mb-px của danh sách làm khung dư 1px theo chiều dọc và hiện thanh cuộn dọc thừa.
export default function AdminSubNav({ tabs, label }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label={label} className="-mx-4 mb-4 overflow-x-auto overflow-y-hidden border-b border-slate-200 px-4 sm:mx-0 sm:px-0">
      <ul className="-mb-px flex w-max gap-4">
        {tabs.map((tab) => {
          const active = tab.match ? tab.match(pathname) : pathname === tab.to;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                aria-current={active ? 'page' : undefined}
                className={`inline-block border-b-2 px-1 pb-2 text-sm font-semibold whitespace-nowrap ${
                  active ? 'border-teal-700 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'
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
