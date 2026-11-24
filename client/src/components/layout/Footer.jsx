import { Link } from 'react-router-dom';
import { HOTEL_ADDRESS, HOTEL_NAME } from '../../config/hotel.js';
import { MAIN_NAV } from '../../config/navigation.js';

// Tính một lần khi tải trang, không tính lại mỗi lần render.
const CURRENT_YEAR = new Date().getFullYear();

const LINK_CLASS = 'inline-block py-1 underline-offset-4 hover:underline focus-visible:outline-white';

export default function Footer() {
  return (
    <footer className="bg-ink text-white print:hidden">
      <div className="shell grid gap-x-12 gap-y-8 py-12 text-sm md:grid-cols-[1fr_auto] lg:py-16">
        <div>
          <p className="text-xl font-bold tracking-tight">{HOTEL_NAME}</p>
          <p className="mt-2 max-w-sm text-white/85">Rooms, hotel services, food and local tours in one place.</p>
          <address className="mt-4 text-white/85 not-italic">{HOTEL_ADDRESS}</address>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1.5 sm:grid-cols-3 md:grid-cols-2">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={LINK_CLASS}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/credits" className={LINK_CLASS}>
                Photo credits
              </Link>
            </li>
          </ul>
        </nav>
        <p className="border-t border-white/20 pt-6 text-white/85 md:col-span-2">
          © {CURRENT_YEAR} {HOTEL_NAME}
        </p>
      </div>
    </footer>
  );
}
