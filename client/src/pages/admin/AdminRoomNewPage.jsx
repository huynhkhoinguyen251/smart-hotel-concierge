import { Link, useNavigate } from 'react-router-dom';
import { createAdminRoom } from '../../api/adminRooms.api.js';
import { getRoomTypes } from '../../api/catalog.api.js';
import RoomForm from '../../components/admin/rooms/RoomForm.jsx';
import Card from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import PageTitle from '../../components/ui/PageTitle.jsx';
import { PageSpinner } from '../../components/ui/Spinner.jsx';
import useFetch from '../../hooks/useFetch.js';

// /admin/rooms/new: thêm phòng. Thêm xong chuyển sang trang sửa phòng để thêm ảnh.
export default function AdminRoomNewPage() {
  const navigate = useNavigate();
  const roomTypes = useFetch(() => getRoomTypes(), ['room-types']);

  const handleSubmit = async (payload) => {
    const room = await createAdminRoom(payload);
    navigate(`/admin/rooms/${room.id}`, {
      state: { success: `Room ${room.room_number} has been created. Add images below.` },
    });
  };

  const renderBody = () => {
    if (roomTypes.loading) return <PageSpinner />;
    if (roomTypes.error) return <ErrorState message={roomTypes.error.message} onRetry={roomTypes.retry} />;
    if (roomTypes.data.length === 0) {
      return (
        <EmptyState
          title="No room types yet"
          message="Create a room type first, then add rooms of that type."
          action={
            <Link
              to="/admin/rooms/types/new"
              className="inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Add room type
            </Link>
          }
        />
      );
    }
    return (
      <Card>
        <RoomForm roomTypes={roomTypes.data} onSubmit={handleSubmit} submitLabel="Create room" />
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/admin/rooms" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to rooms
      </Link>
      <PageTitle className="mt-3" title="Add room" subtitle="You can add images after the room is created." />
      {renderBody()}
    </div>
  );
}
