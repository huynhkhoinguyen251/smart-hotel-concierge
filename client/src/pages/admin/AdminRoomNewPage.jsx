import { useNavigate } from 'react-router-dom';
import { createAdminRoom } from '../../api/adminRooms.api.js';
import { getRoomTypes } from '../../api/catalog.api.js';
import AdminFormPanel from '../../components/admin/AdminFormPanel.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import RoomForm from '../../components/admin/rooms/RoomForm.jsx';
import BackLink from '../../components/ui/BackLink.jsx';
import ButtonLink from '../../components/ui/ButtonLink.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
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
            <ButtonLink to="/admin/rooms/types/new">Add room type</ButtonLink>
          }
        />
      );
    }
    return (
      <AdminFormPanel>
        <RoomForm roomTypes={roomTypes.data} onSubmit={handleSubmit} submitLabel="Create room" />
      </AdminFormPanel>
    );
  };

  return (
    <div className="max-w-3xl">
      <BackLink to="/admin/rooms">Back to rooms</BackLink>
      <div className="mt-3">
        <AdminPageHeader title="Add room" subtitle="You can add images after the room is created." />
      </div>
      {renderBody()}
    </div>
  );
}
