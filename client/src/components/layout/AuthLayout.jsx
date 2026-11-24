import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery.js';
import usePageTitle from '../../hooks/usePageTitle.js';

// Trang đăng nhập và đăng ký. Máy tính: form bên trái, ảnh bên phải. Điện thoại và máy tính bảng: chỉ có form,
// và ảnh không được tải.
export default function AuthLayout({ title, subtitle, children, footer }) {
  usePageTitle(title);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  return (
    <div className="grid lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Máy tính: mép trái của form thẳng với tên khách sạn trên header (cùng công thức với lớp shell). */}
      <div className="flex items-center px-4 py-8 sm:px-6 sm:py-14 lg:pr-12 lg:pl-[max(2rem,calc(50vw-38rem))]">
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-pretty text-ink-soft">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <p className="mt-6 text-sm text-ink-soft">{footer}</p>}
        </div>
      </div>
      <div className="relative hidden bg-sea lg:block">
        {isDesktop && (
          <img
            src="/images/hero-my-khe.jpg"
            alt="My Khe beach in Da Nang seen from above"
            width="1920"
            height="1280"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-[30%_50%]"
          />
        )}
      </div>
    </div>
  );
}
