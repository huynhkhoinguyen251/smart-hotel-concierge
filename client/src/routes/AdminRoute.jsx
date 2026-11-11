import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import useAuth from '../hooks/useAuth.js';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';

// Chỉ cho admin. Chưa đăng nhập thì sang /login; đã đăng nhập nhưng không phải admin
// thì hiện trang 403. Backend vẫn kiểm tra quyền ở mọi API /admin.
export default function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSpinner />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    return <ForbiddenPage />;
  }
  return <Outlet />;
}
