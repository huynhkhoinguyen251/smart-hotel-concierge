import { useEffect, useRef, useState } from 'react';
import { MenuFoldOutlined, MenuOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Drawer, Layout } from 'antd';
import { Link, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import AccountMenu from '../components/admin/shell/AccountMenu.jsx';
import AdminNav from '../components/admin/shell/AdminNav.jsx';
import NotificationBell from '../components/notifications/NotificationBell.jsx';
import { HOTEL_NAME } from '../config/hotel.js';
import { getAdminPageContext } from '../config/navigation.js';
import useMediaQuery, { DESKTOP_QUERY } from '../hooks/useMediaQuery.js';

const SIDER_WIDTH = 232;
const SIDER_COLLAPSED_WIDTH = 72;
const SIDER_STORAGE_KEY = 'shc_admin_sider';
// Từ độ rộng này cột trái mở sẵn; hẹp hơn thì thu gọn để dành chỗ cho bảng.
const WIDE_QUERY = '(min-width: 80rem)';

// Con trỏ sau khi đóng ngăn kéo do handleDrawerChange quyết định.
const DRAWER_FOCUS = { focusTriggerAfterClose: false };

const DRAWER_STYLES = {
  section: { background: 'var(--color-ink)' },
  header: { borderBottom: '1px solid rgb(255 255 255 / 0.15)' },
  close: { color: '#fff' },
  title: { color: '#fff' },
  body: { padding: 12 },
};

// Lựa chọn thu gọn cột trái được nhớ trên máy; localStorage có thể bị chặn nên bọc try/catch.
const readCollapsed = () => {
  try {
    return globalThis.localStorage?.getItem(SIDER_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};
const saveCollapsed = (value) => {
  try {
    globalThis.localStorage?.setItem(SIDER_STORAGE_KEY, value);
  } catch {
    // Không lưu được thì lựa chọn chỉ có hiệu lực trong phiên này.
  }
};

const ICON_BUTTON =
  'flex size-11 items-center justify-center rounded-control text-lg text-ink hover:bg-ground';

function SiderTitle({ collapsed }) {
  return (
    <Link
      to="/admin"
      className="flex h-16 items-center rounded-control px-3 leading-tight font-bold text-white focus-visible:-outline-offset-2 focus-visible:outline-white"
    >
      {collapsed ? (
        <>
          <span className="sr-only">{HOTEL_NAME}</span>
          <span aria-hidden="true" className="w-full text-center">
            SHC
          </span>
        </>
      ) : (
        HOTEL_NAME
      )}
    </Link>
  );
}

// Khung khu admin: cột trái màu xanh mực (ngăn kéo khi nhỏ hơn lg), thanh trên màu trắng và nội dung.
// Mỗi lần sang trang khác: lên đầu trang và đưa con trỏ bàn phím vào vùng nội dung.
export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isWide = useMediaQuery(WIDE_QUERY);
  const [choice, setChoice] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef(null);
  const previousPath = useRef(pathname);
  const menuButtonRef = useRef(null);
  // true khi ngăn kéo đóng vì đã chọn một mục: con trỏ vào nội dung thay vì quay về nút Menu.
  const navigatedInDrawer = useRef(false);

  const collapsed = choice ? choice === 'collapsed' : !isWide;
  const context = getAdminPageContext(pathname);

  const toggleSider = () => {
    const next = collapsed ? 'open' : 'collapsed';
    setChoice(next);
    saveCollapsed(next);
  };

  const closeDrawerAfterNavigation = () => {
    navigatedInDrawer.current = true;
    setDrawerOpen(false);
  };

  const handleDrawerChange = (open) => {
    if (open) return;
    const target = navigatedInDrawer.current ? mainRef : menuButtonRef;
    navigatedInDrawer.current = false;
    target.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    mainRef.current?.focus({ preventScroll: true });
    if (navigationType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return (
    <Layout hasSider={isDesktop} className="min-h-screen">
      <a
        href="#admin-content"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only z-50 rounded-control bg-white px-4 py-2 text-sm font-semibold text-sea focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      {isDesktop && (
        <Layout.Sider
          collapsible
          trigger={null}
          collapsed={collapsed}
          width={SIDER_WIDTH}
          collapsedWidth={SIDER_COLLAPSED_WIDTH}
          className="sticky! top-0 h-screen overflow-y-auto"
        >
          <div className="px-3 pb-6">
            <SiderTitle collapsed={collapsed} />
            <div className="mt-2">
              <AdminNav collapsed={collapsed} />
            </div>
          </div>
        </Layout.Sider>
      )}

      <Layout className="min-w-0">
        <Layout.Header className="sticky top-0 z-20 flex items-center gap-2 border-b border-line-soft">
          {isDesktop ? (
            <button
              type="button"
              className={ICON_BUTTON}
              onClick={toggleSider}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            >
              {collapsed ? <MenuUnfoldOutlined aria-hidden="true" /> : <MenuFoldOutlined aria-hidden="true" />}
            </button>
          ) : (
            <button
              ref={menuButtonRef}
              type="button"
              className={ICON_BUTTON}
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-haspopup="dialog"
              aria-label="Menu"
            >
              <MenuOutlined aria-hidden="true" />
            </button>
          )}
          <p className="min-w-0 flex-1 truncate text-sm leading-normal">
            {context.group && <span className="hidden text-ink-soft sm:inline">{context.group} / </span>}
            <span className="font-semibold text-ink">{context.label}</span>
          </p>
          <Link
            to="/"
            className="hidden rounded-control px-2 py-2 text-sm leading-normal font-medium whitespace-nowrap text-sea sm:block hover:text-sea-hover hover:underline"
          >
            Back to site
          </Link>
          <NotificationBell viewAllPath="/admin/notifications" />
          <AccountMenu />
        </Layout.Header>

        <Layout.Content
          ref={mainRef}
          id="admin-content"
          tabIndex={-1}
          className="px-4 pt-6 pb-16 outline-none sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-[84rem]">
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>

      {!isDesktop && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          afterOpenChange={handleDrawerChange}
          focusable={DRAWER_FOCUS}
          placement="left"
          size="min(17rem, 84vw)"
          title={HOTEL_NAME}
          styles={DRAWER_STYLES}
          closable={{ placement: 'end', 'aria-label': 'Close menu' }}
        >
          <AdminNav onNavigate={closeDrawerAfterNavigation} />
          {/* Màn hình hẹp: thanh trên không đủ chỗ cho link này. */}
          <Link
            to="/"
            className="mt-5 flex h-10 items-center border-t border-white/20 px-3 text-sm font-medium text-white hover:underline focus-visible:outline-white sm:hidden"
          >
            Back to site
          </Link>
        </Drawer>
      )}
    </Layout>
  );
}
