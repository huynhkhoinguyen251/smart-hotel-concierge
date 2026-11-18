import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/admin/tourism', label: 'Tour bookings' },
  { to: '/admin/tourism/transport', label: 'Transport' },
];

// Tab phụ của mục Tourism: đơn tour và đơn vận chuyển là hai trang riêng.
export default function TourismTabs() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Tourism sections" className="mb-4 border-b border-slate-200">
      <ul className="-mb-px flex gap-4">
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                aria-current={active ? 'page' : undefined}
                className={`inline-block border-b-2 px-1 pb-2 text-sm font-semibold ${
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
