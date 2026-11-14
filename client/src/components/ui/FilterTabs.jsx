import { Link } from 'react-router-dom';

// Hàng nút lọc dạng viên thuốc (tab trạng thái, loại dịch vụ). Mỗi nút là một link,
// nên lựa chọn nằm trên địa chỉ trang. tabs: [{ value, label }]; getLink(value) trả đường dẫn.
// Trên điện thoại các nút cuộn ngang bên trong khung, trang không bị cuộn ngang.
export default function FilterTabs({ tabs, active, getLink, label, className = '' }) {
  return (
    <nav aria-label={label} className={`-mx-4 overflow-x-auto px-4 ${className}`}>
      <ul className="flex w-max gap-2">
        {tabs.map((tab) => {
          const isActive = tab.value === active;
          return (
            <li key={tab.value || 'all'}>
              <Link
                to={getLink(tab.value)}
                aria-current={isActive ? 'page' : undefined}
                className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-teal-700 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
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
