import { useEffect, useRef, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { GUEST_ACCOUNT_NAV } from '../../config/navigation.js';
import useAuth from '../../hooks/useAuth.js';

const ITEM_CLASS = 'block w-full px-4 py-2 text-left text-sm text-ink hover:bg-ground';

// Nút tên người dùng ở góc phải header, mở menu: Profile, My bookings và My service requests (khách),
// Admin Dashboard (admin), Logout.
export default function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Bấm ra ngoài hoặc nhấn Esc thì đóng menu. Esc trả con trỏ về nút đã mở menu.
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
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
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={user.full_name}
        className="flex items-center gap-2 rounded-control px-2 py-1.5 text-sm font-medium text-ink hover:bg-ground"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sea-tint text-xs font-bold text-sea">
          {user.full_name.charAt(0).toUpperCase()}
        </span>
        {/* Màn hình vừa (768px): chỉ hiện chữ cái đầu để vừa thanh menu. */}
        <span className="hidden max-w-40 truncate lg:inline">{user.full_name}</span>
        <DownOutlined aria-hidden="true" className="text-xs" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-panel border border-line-soft bg-white py-1 shadow-popup"
        >
          <Link to="/profile" role="menuitem" className={ITEM_CLASS} onClick={() => setOpen(false)}>
            Profile
          </Link>
          {/* Admin không đặt đơn của khách, nên không có các mục này. */}
          {!isAdmin &&
            GUEST_ACCOUNT_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                className={ITEM_CLASS}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          {isAdmin && (
            <Link to="/admin" role="menuitem" className={ITEM_CLASS} onClick={() => setOpen(false)}>
              Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            className={`${ITEM_CLASS} border-t border-line-soft text-danger`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
