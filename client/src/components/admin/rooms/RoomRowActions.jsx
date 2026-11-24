import { getStatusConfig, ROOM_STATUSES } from '../../../config/statuses.js';
import ButtonLink from '../../ui/ButtonLink.jsx';
import RowActions from '../RowActions.jsx';
import InactiveRoomDialog from './InactiveRoomDialog.jsx';
import useRoomStatus from './useRoomStatus.js';

// Thao tác của một dòng phòng: Edit, và "More" để đổi nhanh trạng thái.
export default function RoomRowActions({ room, onSuccess, onError }) {
  const control = useRoomStatus({ room, onSuccess, onError });

  return (
    <>
      <RowActions
        itemLabel={`room ${room.room_number}`}
        disabled={control.saving}
        primary={
          <ButtonLink
            to={`/admin/rooms/${room.id}`}
            variant="secondary"
            size="sm"
            aria-label={`Edit room ${room.room_number}`}
          >
            Edit
          </ButtonLink>
        }
        items={ROOM_STATUSES.filter((status) => status !== room.status).map((status) => ({
          key: status,
          label: `Set ${getStatusConfig(status).label.toLowerCase()}`,
          danger: status === 'inactive',
          onClick: () => control.change(status),
        }))}
      />
      <InactiveRoomDialog room={room} control={control} />
    </>
  );
}
