import { useState } from 'react';
import { updateAdminRoomStatus } from '../../../api/adminRooms.api.js';
import { INACTIVE_ROOM_NOTE } from '../../../config/adminCatalog.js';
import { getStatusConfig, ROOM_STATUSES } from '../../../config/statuses.js';
import ConfirmDialog from '../../ui/ConfirmDialog.jsx';
import Select from '../../ui/Select.jsx';

const OPTIONS = ROOM_STATUSES.map((status) => ({ value: status, label: getStatusConfig(status).label }));

// Ô chọn trạng thái của một phòng (available, maintenance, inactive). Đổi sang inactive thì hỏi lại,
// vì khách sẽ không thấy và không đặt được phòng đó nữa. onSuccess(updated, message), onError(message).
// compact: ô nhỏ không có nhãn hiện ra (dùng trong danh sách), vẫn có aria-label.
export default function RoomStatusControl({ room, onSuccess, onError, compact = false }) {
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async (status) => {
    setSaving(true);
    try {
      const updated = await updateAdminRoomStatus(room.id, status);
      onSuccess(updated, `Room ${room.room_number} is now ${getStatusConfig(status).label.toLowerCase()}.`);
    } catch (apiError) {
      onError(apiError.message);
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  const handleChange = (event) => {
    const status = event.target.value;
    if (status === room.status) return;
    if (status === 'inactive') setPending(status);
    else save(status);
  };

  return (
    <>
      <Select
        label={compact ? undefined : 'Status'}
        aria-label={compact ? `Status of room ${room.room_number}` : undefined}
        className={compact ? 'w-36' : ''}
        value={room.status}
        onChange={handleChange}
        options={OPTIONS}
        disabled={saving}
      />
      {!compact && (
        <p className="mt-2 text-xs text-slate-500">
          Maintenance rooms are shown to guests but cannot be booked. Inactive rooms are hidden.
        </p>
      )}
      <ConfirmDialog
        open={pending === 'inactive'}
        title={`Set room ${room.room_number} to inactive?`}
        message={`${INACTIVE_ROOM_NOTE} Existing bookings are not changed.`}
        confirmLabel="Yes, set inactive"
        cancelLabel="Go back"
        variant="danger"
        loading={saving}
        onConfirm={() => save('inactive')}
        onClose={() => setPending(null)}
      />
    </>
  );
}
