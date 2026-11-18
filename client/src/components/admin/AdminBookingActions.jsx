import { updateAdminBookingStatus } from '../../api/adminBookings.api.js';
import { ADMIN_BOOKING_ACTIONS, CHECK_IN_TOO_EARLY_NOTE } from '../../config/adminBookings.js';
import { getActions } from '../../config/adminRequests.js';
import { getToday } from '../../utils/dateHelpers.js';
import AdminStatusActions from './AdminStatusActions.jsx';

const lowerFirst = (text) => `${text.charAt(0).toLowerCase()}${text.slice(1)}`;

// Các nút đổi trạng thái của một đơn đặt phòng, dựng trên AdminStatusActions (ADMIN_BOOKING_ACTIONS).
// Chưa tới ngày check-in thì nút "Check in" bị khóa; showNotes: hiện thêm ghi chú bên dưới.
// onSuccess(updated, message), onError(message), compact: giống AdminStatusActions.
export default function AdminBookingActions({ booking, showNotes = false, ...props }) {
  // So sánh chuỗi "YYYY-MM-DD" theo giờ của máy (không dùng toISOString). Backend vẫn kiểm tra lại.
  const tooEarlyToCheckIn = getToday() < booking.check_in;
  const actions = getActions(ADMIN_BOOKING_ACTIONS, booking.status);
  if (actions.length === 0) return null;

  return (
    <>
      <AdminStatusActions
        actions={actions}
        update={(action) => updateAdminBookingStatus(booking.id, action.status)}
        itemLabel={`booking #${booking.id}`}
        dialogIntro={`Booking #${booking.id} for ${booking.user?.full_name ?? 'the guest'}, room ${booking.room.room_number}`}
        getSuccessMessage={(action) => `Booking #${booking.id}: ${lowerFirst(action.success)}`}
        getDisabledReason={(action) => (action.status === 'checked_in' && tooEarlyToCheckIn ? CHECK_IN_TOO_EARLY_NOTE : '')}
        {...props}
      />
      {showNotes && booking.status === 'confirmed' && tooEarlyToCheckIn && (
        <p className="mt-2 text-xs text-slate-500">{CHECK_IN_TOO_EARLY_NOTE}</p>
      )}
    </>
  );
}
