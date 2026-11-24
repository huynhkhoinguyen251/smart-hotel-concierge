import { getStatusConfig, ROOM_STATUSES } from '../../../config/statuses.js';
import Select from '../../ui/Select.jsx';
import InactiveRoomDialog from './InactiveRoomDialog.jsx';
import useRoomStatus from './useRoomStatus.js';

const OPTIONS = ROOM_STATUSES.map((status) => ({ value: status, label: getStatusConfig(status).label }));

// Ô chọn trạng thái của một phòng ở trang sửa phòng. onSuccess(updated, message), onError(message).
export default function RoomStatusControl({ room, onSuccess, onError }) {
  const control = useRoomStatus({ room, onSuccess, onError });

  return (
    <>
      <Select
        label="Status"
        value={room.status}
        onChange={(event) => control.change(event.target.value)}
        options={OPTIONS}
        disabled={control.saving}
      />
      <p className="mt-2 text-sm text-ink-soft">
        Maintenance rooms are shown to guests but cannot be booked. Inactive rooms are hidden.
      </p>
      <InactiveRoomDialog room={room} control={control} />
    </>
  );
}
