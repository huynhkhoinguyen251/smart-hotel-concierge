import { useState } from 'react';
import { updateAdminBookingStatus } from '../../api/adminBookings.api.js';
import { CHECK_IN_TOO_EARLY_NOTE, getAdminBookingActions } from '../../config/adminBookings.js';
import { getToday } from '../../utils/dateHelpers.js';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';

// Các nút đổi trạng thái được phép cho một đơn (theo ADMIN_BOOKING_ACTIONS), mỗi nút có hộp thoại xác nhận.
// onSuccess(updated, message) và onError(message) để trang cha cập nhật và hiện thông báo.
// compact: nút nhỏ cho từng dòng của danh sách; showNotes: hiện ghi chú khi chưa tới ngày check-in.
export default function AdminBookingActions({ booking, onSuccess, onError, compact = false, showNotes = false }) {
  const [action, setAction] = useState(null);
  const [saving, setSaving] = useState(false);
  const actions = getAdminBookingActions(booking.status);
  // So sánh chuỗi "YYYY-MM-DD" theo giờ của máy (không dùng toISOString). Backend vẫn kiểm tra lại.
  const tooEarlyToCheckIn = getToday() < booking.check_in;

  if (actions.length === 0) return null;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const updated = await updateAdminBookingStatus(booking.id, action.status);
      onSuccess(updated, `Booking #${booking.id}: ${action.success.charAt(0).toLowerCase()}${action.success.slice(1)}`);
    } catch (apiError) {
      // Ví dụ 400: đơn vừa đổi trạng thái ở tab khác, hoặc chưa tới ngày nhận phòng.
      onError(apiError.message);
    } finally {
      setSaving(false);
      setAction(null);
    }
  };

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'flex-col'}`}>
        {actions.map((item) => {
          const disabled = item.status === 'checked_in' && tooEarlyToCheckIn;
          return (
            <Button
              key={item.status}
              variant={item.variant === 'danger' ? 'danger' : compact ? 'secondary' : 'primary'}
              size={compact ? 'sm' : 'md'}
              className={compact ? '' : 'w-full'}
              disabled={disabled}
              title={disabled ? CHECK_IN_TOO_EARLY_NOTE : undefined}
              aria-label={compact ? `${item.label}, booking #${booking.id}` : undefined}
              onClick={() => setAction(item)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
      {showNotes && booking.status === 'confirmed' && tooEarlyToCheckIn && (
        <p className="mt-2 text-xs text-slate-500">{CHECK_IN_TOO_EARLY_NOTE}</p>
      )}

      <ConfirmDialog
        open={Boolean(action)}
        title={action?.title}
        message={action ? `Booking #${booking.id} for ${booking.user?.full_name ?? 'the guest'}, room ${booking.room.room_number}. ${action.message}` : ''}
        confirmLabel={action ? `Yes, ${action.label.toLowerCase()}` : 'Confirm'}
        cancelLabel="Go back"
        variant={action?.variant === 'danger' ? 'danger' : 'primary'}
        loading={saving}
        onConfirm={handleConfirm}
        onClose={() => setAction(null)}
      />
    </>
  );
}
