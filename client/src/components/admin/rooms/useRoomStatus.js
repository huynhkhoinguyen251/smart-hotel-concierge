import { useState } from 'react';
import { updateAdminRoomStatus } from '../../../api/adminRooms.api.js';
import { getStatusConfig } from '../../../config/statuses.js';

// Đổi trạng thái của một phòng. Đổi sang inactive thì hỏi lại (confirming), vì khách sẽ không thấy
// và không đặt được phòng đó nữa. Dùng cho ô chọn ở trang sửa phòng và "More" trong danh sách phòng.
export default function useRoomStatus({ room, onSuccess, onError }) {
  const [confirming, setConfirming] = useState(false);
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
      setConfirming(false);
    }
  };

  const change = (status) => {
    if (status === room.status) return;
    if (status === 'inactive') setConfirming(true);
    else save(status);
  };

  return { saving, confirming, change, confirm: () => save('inactive'), cancel: () => setConfirming(false) };
}
