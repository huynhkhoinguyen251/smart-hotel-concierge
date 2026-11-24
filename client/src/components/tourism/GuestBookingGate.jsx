import { useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import ButtonLink from '../ui/ButtonLink.jsx';
import Spinner from '../ui/Spinner.jsx';

// Chỉ hiện form đặt (children) cho khách đã đăng nhập.
// Đang tải hồ sơ: vòng xoay; chưa đăng nhập: nút "Log in to book" (đăng nhập xong quay lại trang này);
// admin: chỉ hiện ghi chú, không có form.
export default function GuestBookingGate({ adminNote, loginText, children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Spinner size="sm" className="text-sea" /> Loading...
      </p>
    );
  }
  if (!user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-soft">{loginText}</p>
        <ButtonLink to="/login" state={{ from: location }} fullWidth>
          Log in to book
        </ButtonLink>
      </div>
    );
  }
  if (isAdmin) {
    return <p className="text-sm text-ink-soft">{adminNote}</p>;
  }
  return children;
}
