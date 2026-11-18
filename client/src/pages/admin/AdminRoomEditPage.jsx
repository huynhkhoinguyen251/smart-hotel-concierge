import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteAdminRoom, getAdminRoom, updateAdminRoom } from '../../api/adminRooms.api.js';
import { getRoomTypes } from '../../api/catalog.api.js';
import AdminDetailLoader from '../../components/admin/AdminDetailLoader.jsx';
import RoomForm from '../../components/admin/rooms/RoomForm.jsx';
import RoomImagesManager from '../../components/admin/rooms/RoomImagesManager.jsx';
import RoomStatusControl from '../../components/admin/rooms/RoomStatusControl.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DetailRow from '../../components/ui/DetailRow.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { ROOM_HAS_BOOKINGS_NOTE } from '../../config/adminCatalog.js';
import useFetch from '../../hooks/useFetch.js';
import useFlashMessage from '../../hooks/useFlashMessage.js';
import formatCurrency from '../../utils/formatCurrency.js';

// Khung "Danger zone": xóa phòng. Phòng đã có đơn thì backend trả 409; khi đó gợi ý đổi sang inactive.
function DeleteRoomCard({ room }) {
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
    // Không dùng Card vì cần viền đỏ (ghi đè màu viền của Card không chắc thắng trong CSS).
    <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm" aria-label="Danger zone">
      <h2 className="text-lg font-semibold text-red-700">Danger zone</h2>
      <p className="mt-2 text-sm text-slate-600">
        Deleting removes the room and its images. Rooms with bookings cannot be deleted.
      </p>
      <div className="mt-3 empty:hidden" aria-live="polite">
        <Alert type="error">{error}</Alert>
      </div>
      <Button variant="danger" fullWidth className="mt-4" onClick={() => setOpen(true)}>
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
    </section>
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
    <div className="mx-auto max-w-5xl">
      <Link to="/admin/rooms" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to rooms
      </Link>
      <div className="mt-3 mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Room {room.room_number}</h1>
        <StatusBadge status={room.status} />
      </div>
      <p className="mb-6 text-sm text-slate-500">
        {room.room_type.name} · Floor {room.floor}
        {room.status !== 'inactive' && (
          <>
            {' · '}
            <Link to={`/rooms/${room.id}`} className="font-medium text-teal-700 hover:text-teal-800">
              View public page
            </Link>
          </>
        )}
      </p>

      <div className="mb-6 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Room details</h2>
            {roomTypes.loading && <Spinner className="text-teal-700" />}
            {roomTypes.error && <ErrorState message={roomTypes.error.message} onRetry={roomTypes.retry} />}
            {roomTypes.data && (
              <RoomForm room={room} roomTypes={roomTypes.data} onSubmit={handleSave} submitLabel="Save changes" />
            )}
          </Card>
          <RoomImagesManager room={room} onChanged={reload} />
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Status</h2>
            <RoomStatusControl
              room={room}
              onSuccess={async (_updated, text) => {
                await reload();
                show('success', text);
              }}
              onError={(text) => show('error', text)}
            />
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Room type</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Name">{room.room_type.name}</DetailRow>
              <DetailRow label="Price per night">{formatCurrency(room.room_type.price_per_night)}</DetailRow>
              <DetailRow label="Capacity">Up to {room.room_type.capacity} guests</DetailRow>
              <DetailRow label="Amenities">
                {room.amenities?.length ? room.amenities.map((amenity) => amenity.name).join(', ') : '-'}
              </DetailRow>
            </dl>
            <Link
              to={`/admin/rooms/types/${room.room_type.id}`}
              className="mt-3 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              Edit room type →
            </Link>
          </Card>
          <DeleteRoomCard room={room} />
        </div>
      </div>
    </div>
  );
}

// /admin/rooms/:id (dùng GET /admin/rooms/:id, thấy cả phòng inactive).
export default function AdminRoomEditPage() {
  // Thông báo từ trang thêm phòng, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  return (
    <AdminDetailLoader
      load={getAdminRoom}
      notFound={{
        title: 'Room not found',
        message: 'This room does not exist.',
        to: '/admin/rooms',
        linkLabel: 'Back to rooms',
      }}
    >
      {(data) => <RoomEditor key={data.id} initialRoom={data} initialMessage={flashMessage} />}
    </AdminDetailLoader>
  );
}
