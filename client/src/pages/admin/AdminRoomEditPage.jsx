import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteAdminRoom, getAdminRoom, updateAdminRoom } from '../../api/adminRooms.api.js';
import { getRoomTypes } from '../../api/catalog.api.js';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminDetailLayout, { AdminSection } from '../../components/admin/AdminDetailLayout.jsx';
import RoomForm from '../../components/admin/rooms/RoomForm.jsx';
import RoomImagesManager from '../../components/admin/rooms/RoomImagesManager.jsx';
import RoomStatusControl from '../../components/admin/rooms/RoomStatusControl.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DetailRow from '../../components/ui/DetailRow.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import MoreLink from '../../components/ui/MoreLink.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { ROOM_HAS_BOOKINGS_NOTE } from '../../config/adminCatalog.js';
import useFetch from '../../hooks/useFetch.js';
import useFlashMessage from '../../hooks/useFlashMessage.js';
import formatCurrency from '../../utils/formatCurrency.js';

// Phần xóa phòng, ở cuối cột bên. Phòng đã có đơn thì backend trả 409; khi đó gợi ý đổi sang inactive.
function DeleteRoomSection({ room }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminRoom(room.id);
      navigate('/admin/rooms', { state: { success: `Room ${room.room_number} has been deleted.` } });
    } catch (apiError) {
      setError(apiError.status === 409 ? ROOM_HAS_BOOKINGS_NOTE : apiError.message);
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <AdminSection title="Delete this room">
      <p className="text-sm text-ink-soft">
        Deleting removes the room and its images. Rooms with bookings cannot be deleted.
      </p>
      <div className="mt-3 empty:hidden" aria-live="polite">
        <Alert type="error">{error}</Alert>
      </div>
      <Button variant="secondary" danger fullWidth className="mt-4" onClick={() => setOpen(true)}>
        Delete room
      </Button>
      <ConfirmDialog
        open={open}
        title={`Delete room ${room.room_number}?`}
        message="The room and its images will be removed. This cannot be undone."
        confirmLabel="Yes, delete room"
        cancelLabel="Keep room"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setOpen(false)}
      />
    </AdminSection>
  );
}

// Nội dung trang sửa phòng. Sau mỗi thay đổi tải lại phòng (GET /admin/rooms/:id), để ảnh,
// ảnh chính và tiện nghi của loại phòng luôn đúng với server.
function RoomEditor({ initialRoom, initialMessage }) {
  const [room, setRoom] = useState(initialRoom);
  const [message, setMessage] = useState({ type: 'success', text: initialMessage });
  const roomTypes = useFetch(() => getRoomTypes(), ['room-types']);

  const reload = async () => {
    setRoom(await getAdminRoom(room.id));
  };
  const show = (type, text) => {
    setMessage({ type, text });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (changes) => {
    await updateAdminRoom(room.id, changes);
    await reload();
    show('success', 'The room has been updated.');
  };

  return (
    <AdminDetailLayout
      backTo="/admin/rooms"
      backLabel="Back to rooms"
      title={`Room ${room.room_number}`}
      status={room.status}
      meta={
        <>
          {room.room_type.name} · Floor {room.floor}
          {room.status !== 'inactive' && (
            <>
              {' · '}
              <Link
                to={`/rooms/${room.id}`}
                className="font-medium text-sea hover:text-sea-hover hover:underline"
              >
                View public page
              </Link>
            </>
          )}
        </>
      }
      message={message}
      actionsTitle="Status"
      actions={
        <RoomStatusControl
          room={room}
          onSuccess={async (_updated, text) => {
            await reload();
            show('success', text);
          }}
          onError={(text) => show('error', text)}
        />
      }
      main={
        <>
          <AdminSection title="Room details">
            {roomTypes.loading && <Spinner className="text-sea" />}
            {roomTypes.error && <ErrorState message={roomTypes.error.message} onRetry={roomTypes.retry} />}
            {roomTypes.data && (
              <RoomForm room={room} roomTypes={roomTypes.data} onSubmit={handleSave} submitLabel="Save changes" />
            )}
          </AdminSection>
          <RoomImagesManager room={room} onChanged={reload} />
        </>
      }
      side={
        <>
          <AdminSection title="Room type">
            <dl className="text-sm">
              <DetailRow label="Name">{room.room_type.name}</DetailRow>
              <DetailRow label="Price per night">{formatCurrency(room.room_type.price_per_night)}</DetailRow>
              <DetailRow label="Capacity">Up to {room.room_type.capacity} guests</DetailRow>
              <DetailRow label="Amenities">
                {room.amenities?.length ? room.amenities.map((amenity) => amenity.name).join(', ') : '-'}
              </DetailRow>
            </dl>
            <MoreLink to={`/admin/rooms/types/${room.room_type.id}`} className="mt-2">
              Edit room type
            </MoreLink>
          </AdminSection>
          <DeleteRoomSection room={room} />
        </>
      }
    />
  );
}

// /admin/rooms/:id (dùng GET /admin/rooms/:id, thấy cả phòng inactive).
export default function AdminRoomEditPage() {
  // Thông báo từ trang thêm phòng, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  return (
    <DetailLoader
      load={getAdminRoom}
      notFound={{
        title: 'Room not found',
        message: 'This room does not exist.',
        to: '/admin/rooms',
        linkLabel: 'Back to rooms',
      }}
    >
      {(data) => <RoomEditor key={data.id} initialRoom={data} initialMessage={flashMessage} />}
    </DetailLoader>
  );
}
