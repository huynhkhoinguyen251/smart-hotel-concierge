import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/layout/Footer.jsx';
import Header from '../components/layout/Header.jsx';
import RouteErrorBoundary from '../components/layout/RouteErrorBoundary.jsx';
import ScrollToTop from '../components/layout/ScrollToTop.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';

// Khung chờ cao bằng màn hình, để footer không hiện lên rồi lại bị đẩy xuống.
const FALLBACK = (
  <div className="min-h-screen">
    <PageSpinner />
  </div>
);

// Khung trang dành cho khách: header, nội dung, footer. Header và footer luôn giữ nguyên khi một trang
// đang tải hoặc tải lỗi.
export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <RouteErrorBoundary resetKey={pathname}>
          <Suspense fallback={FALLBACK}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
