import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import Spinner from '../ui/Spinner.jsx';

// Chỉ hiện form đặt (children) cho khách đã đăng nhập.
// Đang tải hồ sơ: vòng xoay; chưa đăng nhập: nút "Log in to book" (đăng nhập xong quay lại trang này);
// admin: chỉ hiện ghi chú, không có form.
export default function GuestBookingGate({ adminNote, loginText, children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner size="sm" className="text-teal-700" /> Loading...
      </p>
    );
  }
  if (!user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">{loginText}</p>
        <Link
          to="/login"
          state={{ from: location }}
          className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Log in to book
        </Link>
      </div>
    );
  }
  if (isAdmin) {
    return <p className="text-sm text-slate-500">{adminNote}</p>;
  }
  return children;
}
