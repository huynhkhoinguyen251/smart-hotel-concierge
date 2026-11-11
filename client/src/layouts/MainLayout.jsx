import { Outlet } from 'react-router-dom';
import Footer from '../components/layout/Footer.jsx';
import Header from '../components/layout/Header.jsx';

// Khung trang dành cho khách: header, nội dung, footer.
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
