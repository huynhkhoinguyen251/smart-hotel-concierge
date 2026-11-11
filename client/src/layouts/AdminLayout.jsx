import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/layout/Logo.jsx';
import { ADMIN_NAV } from '../config/navigation.js';
import useAuth from '../hooks/useAuth.js';

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

// Khung trang admin: sidebar bên trái, thanh trên cùng và nội dung. Trên điện thoại,
// sidebar thu vào nút "Menu".
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const close = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white p-4 transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 px-1">
          <Logo to="/admin" onClick={close} />
          <p className="mt-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Admin
          </p>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Admin">
          {ADMIN_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={close}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/30 md:hidden"
          onClick={close}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
          <Link to="/" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            Back to site
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[12rem] truncate text-sm text-slate-600 sm:inline">
              {user.full_name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
