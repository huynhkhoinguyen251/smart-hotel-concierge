import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import RouteErrorBoundary from '../components/layout/RouteErrorBoundary.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import AdminRoute from './AdminRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Mỗi trang là một file riêng, chỉ tải khi được mở. Trang chủ, trang đăng nhập và trang 404 nằm trong
// file chính vì hay là trang đầu tiên. Khung chờ của trang khách nằm trong MainLayout (một Suspense),
// nên header và footer không bị nháy khi đổi trang.
const BookPage = lazy(() => import('../pages/BookPage.jsx'));
const BookingDetailPage = lazy(() => import('../pages/BookingDetailPage.jsx'));
const CreditsPage = lazy(() => import('../pages/CreditsPage.jsx'));
const FoodMenuPage = lazy(() => import('../pages/FoodMenuPage.jsx'));
const FoodOrderDetailPage = lazy(() => import('../pages/FoodOrderDetailPage.jsx'));
const InvoicePage = lazy(() => import('../pages/InvoicePage.jsx'));
const MyBookingsPage = lazy(() => import('../pages/MyBookingsPage.jsx'));
const MyFoodOrdersPage = lazy(() => import('../pages/MyFoodOrdersPage.jsx'));
const MyPaymentsPage = lazy(() => import('../pages/MyPaymentsPage.jsx'));
const MyReviewsPage = lazy(() => import('../pages/MyReviewsPage.jsx'));
const MyServicesPage = lazy(() => import('../pages/MyServicesPage.jsx'));
const MySupportPage = lazy(() => import('../pages/MySupportPage.jsx'));
const MyTripsPage = lazy(() => import('../pages/MyTripsPage.jsx'));
const NewTicketPage = lazy(() => import('../pages/NewTicketPage.jsx'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage.jsx'));
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx'));
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx'));
const RoomDetailPage = lazy(() => import('../pages/RoomDetailPage.jsx'));
const RoomsPage = lazy(() => import('../pages/RoomsPage.jsx'));
const ServiceDetailPage = lazy(() => import('../pages/ServiceDetailPage.jsx'));
const ServiceRequestDetailPage = lazy(() => import('../pages/ServiceRequestDetailPage.jsx'));
const ServicesPage = lazy(() => import('../pages/ServicesPage.jsx'));
const TicketDetailPage = lazy(() => import('../pages/TicketDetailPage.jsx'));
const TourBookingDetailPage = lazy(() => import('../pages/TourBookingDetailPage.jsx'));
const TourDetailPage = lazy(() => import('../pages/TourDetailPage.jsx'));
const ToursPage = lazy(() => import('../pages/ToursPage.jsx'));
const TransportBookingDetailPage = lazy(() => import('../pages/TransportBookingDetailPage.jsx'));
const TransportDetailPage = lazy(() => import('../pages/TransportDetailPage.jsx'));

// Trang admin (Dashboard dùng Chart.js, khá nặng): khách không phải tải phần code này.
const AdminLayout = lazy(() => import('../layouts/AdminLayout.jsx'));
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
const AdminVouchersPage = lazy(() => import('../pages/admin/AdminVouchersPage.jsx'));
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
    <RouteErrorBoundary>
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
          <Route path="credits" element={<CreditsPage />} />
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
          <Route element={withSuspense(<AdminLayout />)}>
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
            <Route path="notifications" element={withSuspense(<NotificationsPage />)} />
            <Route path="vouchers" element={withSuspense(<AdminVouchersPage />)} />
            <Route path="reviews" element={withSuspense(<AdminReviewsPage />)} />
            <Route path="users" element={withSuspense(<AdminUsersPage />)} />
            <Route path="users/:id" element={withSuspense(<AdminUserDetailPage />)} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </RouteErrorBoundary>
  );
}
