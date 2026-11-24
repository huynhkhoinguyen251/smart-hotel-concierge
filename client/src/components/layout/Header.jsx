import { useState } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import { NavLink, useNavigate } from 'react-router-dom';
import { GUEST_ACCOUNT_NAV, MAIN_NAV } from '../../config/navigation.js';
import useAuth from '../../hooks/useAuth.js';
import NotificationBell from '../notifications/NotificationBell.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import Logo from './Logo.jsx';
import UserMenu from './UserMenu.jsx';

// Link trên thanh menu: trang đang mở có chữ và gạch chân xanh biển.
const linkClass = ({ isActive }) =>
  `flex h-16 items-center border-y-2 border-t-transparent text-sm font-medium transition-colors duration-150 focus-visible:-outline-offset-2 ${
    isActive
      ? 'border-b-sea text-sea'
      : 'border-b-transparent text-ink-soft hover:border-b-sea-line hover:text-ink'
  }`;

// Link trong ngăn kéo của điện thoại: dòng cao, dễ bấm.
const drawerLinkClass = ({ isActive }) =>
  `block py-3 text-base font-medium focus-visible:-outline-offset-2 ${
    isActive ? 'text-sea underline decoration-2 underline-offset-8' : 'text-ink hover:text-sea'
  }`;

// Khung xám nhỏ thay chỗ nút tài khoản trong lúc đang tải hồ sơ.
function AccountPlaceholder() {
  return (
    <div
      className="h-9 w-28 animate-pulse rounded-control bg-line-soft"
      role="status"
      aria-label="Loading account"
    />
  );
}

// Nội dung ngăn kéo: các trang chính, rồi các mục tài khoản.
function DrawerMenu({ user, isAdmin, loading, onClose, onLogout }) {
  const renderAccount = () => {
    if (loading) return <AccountPlaceholder />;
    if (!user) {
      return (
        <div className="flex flex-col gap-3 pt-2">
          <ButtonLink to="/login" variant="secondary" fullWidth onClick={onClose}>
            Login
          </ButtonLink>
          <ButtonLink to="/register" variant="secondary" fullWidth onClick={onClose}>
            Register
          </ButtonLink>
        </div>
      );
    }
    return (
      <>
        <p className="pb-1 text-sm break-words text-ink-soft">{user.full_name}</p>
        <NavLink to="/profile" className={drawerLinkClass} onClick={onClose}>
          Profile
        </NavLink>
        {!isAdmin &&
          GUEST_ACCOUNT_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={drawerLinkClass} onClick={onClose}>
              {item.label}
            </NavLink>
          ))}
        {isAdmin && (
          <NavLink to="/admin" className={drawerLinkClass} onClick={onClose}>
            Admin Dashboard
          </NavLink>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="block w-full py-3 text-left text-base font-medium text-danger hover:text-danger-hover"
        >
          Logout
        </button>
      </>
    );
  };

  return (
    <div id="mobile-menu">
      <nav aria-label="Main">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={drawerLinkClass} onClick={onClose}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-4 border-t border-line-soft pt-4">{renderAccount()}</div>
    </div>
  );
}

// Header của trang khách. Trên điện thoại, menu nằm trong ngăn kéo bên phải.
export default function Header() {
  // loading: đang tải hồ sơ từ token cũ, chưa biết đã đăng nhập hay chưa.
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  const handleLogout = () => {
    close();
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line-soft bg-white print:hidden">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Logo onClick={close} />

        <nav className="hidden items-center gap-5 md:flex lg:gap-8" aria-label="Main">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          {user && <NotificationBell viewAllPath={isAdmin ? '/admin/notifications' : '/notifications'} />}

          <div className="hidden items-center gap-4 md:flex">
            {/* Chưa tải xong hồ sơ thì chỉ hiện khung chờ, tránh nháy Login/Register. */}
            {loading ? (
              <AccountPlaceholder />
            ) : user ? (
              <UserMenu />
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <ButtonLink to="/register" variant="secondary">
                  Register
                </ButtonLink>
              </>
            )}
          </div>

          <button
            type="button"
            className="-mr-2 flex size-11 items-center justify-center rounded-control text-xl text-ink hover:bg-ground md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            aria-label="Open menu"
          >
            <MenuOutlined aria-hidden="true" />
          </button>
        </div>
      </div>

      <Drawer
        open={mobileOpen}
        onClose={close}
        placement="right"
        size="min(20rem, 88vw)"
        title="Menu"
        closable={{ placement: 'end', 'aria-label': 'Close menu' }}
      >
        <DrawerMenu user={user} isAdmin={isAdmin} loading={loading} onClose={close} onLogout={handleLogout} />
      </Drawer>
    </header>
  );
}
