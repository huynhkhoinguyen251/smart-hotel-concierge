import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Thông báo được gửi kèm khi chuyển trang (navigate(..., { state: { success } })) chỉ hiện một lần:
// đọc ra rồi xóa khỏi lịch sử, nên tải lại trang hoặc bấm Back/Forward sẽ không hiện lại.
export default function useFlashMessage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message] = useState(() => location.state?.success ?? '');

  useEffect(() => {
    if (location.state?.success) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location, navigate]);

  return message;
}
