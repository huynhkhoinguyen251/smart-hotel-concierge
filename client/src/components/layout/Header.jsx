import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MAIN_NAV } from '../../config/navigation.js';
import useAuth from '../../hooks/useAuth.js';
import Logo from './Logo.jsx';
import UserMenu from './UserMenu.jsx';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

// Header của trang khách. Trên điện thoại, menu thu vào nút ba gạch.
export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  const handleLogout = () => {
    close();
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo onClick={close} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-3" aria-label="Main">
            {MAIN_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={close}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3">
            {user ? (
              <>
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {user.full_name}
                </p>
                <NavLink to="/profile" className={linkClass} onClick={close}>
                  Profile
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={linkClass} onClick={close}>
                    Admin Dashboard
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass} onClick={close}>
                  Login
                </NavLink>
                <Link
                  to="/register"
                  onClick={close}
                  className="rounded-lg bg-teal-700 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
