import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import BookingDetailPage from '../pages/BookingDetailPage.jsx';
import BookPage from '../pages/BookPage.jsx';
import FoodMenuPage from '../pages/FoodMenuPage.jsx';
import FoodOrderDetailPage from '../pages/FoodOrderDetailPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import InvoicePage from '../pages/InvoicePage.jsx';
import MyBookingsPage from '../pages/MyBookingsPage.jsx';
import MyFoodOrdersPage from '../pages/MyFoodOrdersPage.jsx';
import MyPaymentsPage from '../pages/MyPaymentsPage.jsx';
import MyReviewsPage from '../pages/MyReviewsPage.jsx';
import MyServicesPage from '../pages/MyServicesPage.jsx';
import MySupportPage from '../pages/MySupportPage.jsx';
import MyTripsPage from '../pages/MyTripsPage.jsx';
import NewTicketPage from '../pages/NewTicketPage.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import RoomDetailPage from '../pages/RoomDetailPage.jsx';
import RoomsPage from '../pages/RoomsPage.jsx';
import ServiceDetailPage from '../pages/ServiceDetailPage.jsx';
import ServiceRequestDetailPage from '../pages/ServiceRequestDetailPage.jsx';
import ServicesPage from '../pages/ServicesPage.jsx';
import TicketDetailPage from '../pages/TicketDetailPage.jsx';
import TourBookingDetailPage from '../pages/TourBookingDetailPage.jsx';
import TourDetailPage from '../pages/TourDetailPage.jsx';
import ToursPage from '../pages/ToursPage.jsx';
import TransportBookingDetailPage from '../pages/TransportBookingDetailPage.jsx';
import TransportDetailPage from '../pages/TransportDetailPage.jsx';
import AdminRoute from './AdminRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Các trang admin (Dashboard dùng Chart.js, khá nặng) được tách thành file riêng và chỉ tải
// khi admin mở, để khách không phải tải phần code của admin.
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage.jsx'));
const AdminBookingsPage = lazy(() => import('../pages/admin/AdminBookingsPage.jsx'));
const AdminBookingDetailPage = lazy(() => import('../pages/admin/AdminBookingDetailPage.jsx'));
const AdminServiceRequestsPage = lazy(() => import('../pages/admin/AdminServiceRequestsPage.jsx'));
const AdminServiceCatalogPage = lazy(() => import('../pages/admin/AdminServiceCatalogPage.jsx'));
const AdminMenuPage = lazy(() => import('../pages/admin/AdminMenuPage.jsx'));
const AdminTourCatalogPage = lazy(() => import('../pages/admin/AdminTourCatalogPage.jsx'));
const AdminServiceRequestDetailPage = lazy(() => import('../pages/admin/AdminServiceRequestDetailPage.jsx'));
const AdminFoodOrdersPage = lazy(() => import('../pages/admin/AdminFoodOrdersPage.jsx'));
const AdminFoodOrderDetailPage = lazy(() => import('../pages/admin/AdminFoodOrderDetailPage.jsx'));
const AdminTourBookingsPage = lazy(() => import('../pages/admin/AdminTourBookingsPage.jsx'));
const AdminTourBookingDetailPage = lazy(() => import('../pages/admin/AdminTourBookingDetailPage.jsx'));
const AdminTransportBookingsPage = lazy(() => import('../pages/admin/AdminTransportBookingsPage.jsx'));
const AdminTransportBookingDetailPage = lazy(() => import('../pages/admin/AdminTransportBookingDetailPage.jsx'));
const AdminTicketsPage = lazy(() => import('../pages/admin/AdminTicketsPage.jsx'));
const AdminTicketDetailPage = lazy(() => import('../pages/admin/AdminTicketDetailPage.jsx'));
const AdminPaymentsPage = lazy(() => import('../pages/admin/AdminPaymentsPage.jsx'));
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage.jsx'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage.jsx'));
const AdminUserDetailPage = lazy(() => import('../pages/admin/AdminUserDetailPage.jsx'));
const AdminRoomsPage = lazy(() => import('../pages/admin/AdminRoomsPage.jsx'));
const AdminRoomNewPage = lazy(() => import('../pages/admin/AdminRoomNewPage.jsx'));
const AdminRoomEditPage = lazy(() => import('../pages/admin/AdminRoomEditPage.jsx'));
const AdminRoomTypesPage = lazy(() => import('../pages/admin/AdminRoomTypesPage.jsx'));
const AdminRoomTypeFormPage = lazy(() => import('../pages/admin/AdminRoomTypeFormPage.jsx'));
const AdminAmenitiesPage = lazy(() => import('../pages/admin/AdminAmenitiesPage.jsx'));

const withSuspense = (element) => <Suspense fallback={<PageSpinner />}>{element}</Suspense>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="rooms/:id" element={<RoomDetailPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/:id" element={<ServiceDetailPage />} />
        <Route path="food" element={<FoodMenuPage />} />
        <Route path="tours" element={<ToursPage />} />
        <Route path="tours/:id" element={<TourDetailPage />} />
        <Route path="transport/:id" element={<TransportDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="book" element={<BookPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="my-bookings/:id" element={<BookingDetailPage />} />
          <Route path="my-services" element={<MyServicesPage />} />
          <Route path="my-services/:id" element={<ServiceRequestDetailPage />} />
          <Route path="my-food-orders" element={<MyFoodOrdersPage />} />
          <Route path="my-food-orders/:id" element={<FoodOrderDetailPage />} />
          <Route path="my-trips" element={<MyTripsPage />} />
          <Route path="my-trips/tours/:id" element={<TourBookingDetailPage />} />
          <Route path="my-trips/transport/:id" element={<TransportBookingDetailPage />} />
          <Route path="my-payments" element={<MyPaymentsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="payments/:id/invoice" element={<InvoicePage />} />
          <Route path="my-reviews" element={<MyReviewsPage />} />
          <Route path="support" element={<MySupportPage />} />
          <Route path="support/new" element={<NewTicketPage />} />
          <Route path="support/:id" element={<TicketDetailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={withSuspense(<DashboardPage />)} />
          <Route path="rooms" element={withSuspense(<AdminRoomsPage />)} />
          <Route path="rooms/new" element={withSuspense(<AdminRoomNewPage />)} />
          <Route path="rooms/types" element={withSuspense(<AdminRoomTypesPage />)} />
          <Route path="rooms/types/new" element={withSuspense(<AdminRoomTypeFormPage />)} />
          <Route path="rooms/types/:id" element={withSuspense(<AdminRoomTypeFormPage />)} />
          <Route path="rooms/amenities" element={withSuspense(<AdminAmenitiesPage />)} />
          <Route path="rooms/:id" element={withSuspense(<AdminRoomEditPage />)} />
          <Route path="bookings" element={withSuspense(<AdminBookingsPage />)} />
          <Route path="bookings/:id" element={withSuspense(<AdminBookingDetailPage />)} />
          <Route path="services" element={withSuspense(<AdminServiceRequestsPage />)} />
          <Route path="services/catalog" element={withSuspense(<AdminServiceCatalogPage />)} />
          <Route path="services/:id" element={withSuspense(<AdminServiceRequestDetailPage />)} />
          <Route path="food-orders" element={withSuspense(<AdminFoodOrdersPage />)} />
          <Route path="food-orders/menu" element={withSuspense(<AdminMenuPage />)} />
          <Route path="food-orders/:id" element={withSuspense(<AdminFoodOrderDetailPage />)} />
          <Route path="tourism" element={withSuspense(<AdminTourBookingsPage />)} />
          <Route path="tourism/catalog" element={withSuspense(<AdminTourCatalogPage />)} />
          <Route path="tourism/tours/:id" element={withSuspense(<AdminTourBookingDetailPage />)} />
          <Route path="tourism/transport" element={withSuspense(<AdminTransportBookingsPage />)} />
          <Route path="tourism/transport/:id" element={withSuspense(<AdminTransportBookingDetailPage />)} />
          <Route path="tickets" element={withSuspense(<AdminTicketsPage />)} />
          <Route path="tickets/:id" element={withSuspense(<AdminTicketDetailPage />)} />
          <Route path="payments" element={withSuspense(<AdminPaymentsPage />)} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reviews" element={withSuspense(<AdminReviewsPage />)} />
          <Route path="users" element={withSuspense(<AdminUsersPage />)} />
          <Route path="users/:id" element={withSuspense(<AdminUserDetailPage />)} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
