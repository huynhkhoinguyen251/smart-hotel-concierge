import { Route, Routes } from 'react-router-dom';
import { ADMIN_NAV } from '../config/navigation.js';
import AdminLayout from '../layouts/AdminLayout.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import DashboardPage from '../pages/admin/DashboardPage.jsx';
import BookingDetailPage from '../pages/BookingDetailPage.jsx';
import BookPage from '../pages/BookPage.jsx';
import ComingSoonPage from '../pages/ComingSoonPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import MyBookingsPage from '../pages/MyBookingsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import RoomDetailPage from '../pages/RoomDetailPage.jsx';
import RoomsPage from '../pages/RoomsPage.jsx';
import AdminRoute from './AdminRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Các trang admin chưa làm: mọi mục sidebar trừ Dashboard.
const ADMIN_PLACEHOLDERS = ADMIN_NAV.filter((item) => item.to !== '/admin');

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="rooms/:id" element={<RoomDetailPage />} />
        <Route path="services" element={<ComingSoonPage title="Hotel Services" />} />
        <Route path="food" element={<ComingSoonPage title="Food and Drinks" />} />
        <Route path="tours" element={<ComingSoonPage title="Tours and Transport" />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="book" element={<BookPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="my-bookings/:id" element={<BookingDetailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          {ADMIN_PLACEHOLDERS.map((item) => (
            <Route
              key={item.to}
              path={item.to.replace('/admin/', '')}
              element={<ComingSoonPage title={item.label} />}
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
