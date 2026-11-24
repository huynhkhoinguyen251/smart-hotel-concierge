import { INACTIVE_ROOM_NOTE } from '../../../config/adminCatalog.js';
import ConfirmDialog from '../../ui/ConfirmDialog.jsx';

// Hộp thoại hỏi lại trước khi ẩn một phòng khỏi trang khách. control: kết quả của useRoomStatus.
export default function InactiveRoomDialog({ room, control }) {
  return (
    <ConfirmDialog
      open={control.confirming}
      title={`Set room ${room.room_number} to inactive?`}
      message={`${INACTIVE_ROOM_NOTE} Existing bookings are not changed.`}
      confirmLabel="Yes, set inactive"
      cancelLabel="Go back"
      variant="danger"
      loading={control.saving}
      onConfirm={control.confirm}
      onClose={control.cancel}
    />
  );
}
