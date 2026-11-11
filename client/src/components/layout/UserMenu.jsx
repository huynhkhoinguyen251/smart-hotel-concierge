import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const ITEM_CLASS = 'block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50';

// Nút tên người dùng ở góc phải header, mở menu: Profile, Admin Dashboard (admin), Logout.
export default function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Bấm ra ngoài hoặc nhấn Esc thì đóng menu.
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
          {user.full_name.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[10rem] truncate">{user.full_name}</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <Link to="/profile" role="menuitem" className={ITEM_CLASS} onClick={() => setOpen(false)}>
            Profile
          </Link>
          {isAdmin && (
            <Link to="/admin" role="menuitem" className={ITEM_CLASS} onClick={() => setOpen(false)}>
              Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            className={`${ITEM_CLASS} border-t border-slate-100 text-red-600`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
