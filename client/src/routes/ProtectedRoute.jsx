import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import useAuth from '../hooks/useAuth.js';

// Chỉ cho người đã đăng nhập. Chưa đăng nhập thì sang /login và nhớ trang đang mở,
// để đăng nhập xong quay lại đúng trang đó.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSpinner />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
