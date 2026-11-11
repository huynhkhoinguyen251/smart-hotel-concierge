import { Link } from 'react-router-dom';
import { MAIN_NAV } from '../../config/navigation.js';

// Tính một lần khi tải trang, không tính lại mỗi lần render.
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-800">Smart Hotel Concierge</p>
          <p className="mt-1">Rooms, hotel services, food and local tours in one place.</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
          {MAIN_NAV.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-teal-700">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-slate-500">© {CURRENT_YEAR} Smart Hotel Concierge</p>
      </div>
    </footer>
  );
}
