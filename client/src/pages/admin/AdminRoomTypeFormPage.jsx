import { useNavigate, useParams } from 'react-router-dom';
import { createAdminRoomType, updateAdminRoomType } from '../../api/adminRoomTypes.api.js';
import { getAmenities, getRoomTypes } from '../../api/catalog.api.js';
import AdminFormPanel from '../../components/admin/AdminFormPanel.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import RoomTypeForm from '../../components/admin/rooms/RoomTypeForm.jsx';
import BackLink from '../../components/ui/BackLink.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import NotFoundView from '../../components/ui/NotFoundView.jsx';
import { PageSpinner } from '../../components/ui/Spinner.jsx';
import useFetch from '../../hooks/useFetch.js';

// /admin/rooms/types/new và /admin/rooms/types/:id. Backend không có API chi tiết loại phòng,
// nên trang sửa tìm loại phòng trong danh sách GET /room-types (danh sách ngắn, có sẵn amenities).
export default function AdminRoomTypeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const data = useFetch(async () => {
    const [roomTypes, amenities] = await Promise.all([getRoomTypes(), getAmenities()]);
    return { roomTypes, amenities };
  }, ['room-type-form', id ?? 'new']);

  const handleSubmit = async (payload) => {
    const saved = isEdit ? await updateAdminRoomType(id, payload) : await createAdminRoomType(payload);
    navigate('/admin/rooms/types', {
      state: { success: `Room type "${saved.name}" has been ${isEdit ? 'updated' : 'created'}.` },
    });
  };

  if (data.loading) return <PageSpinner />;
  if (data.error) return <ErrorState message={data.error.message} onRetry={data.retry} />;

  const roomType = isEdit ? data.data.roomTypes.find((type) => String(type.id) === id) : null;
  if (isEdit && !roomType) {
    return (
      <NotFoundView
        title="Room type not found"
        message="This room type does not exist."
        to="/admin/rooms/types"
        linkLabel="Back to room types"
      />
    );
  }

  return (
    <div className="max-w-3xl">
      <BackLink to="/admin/rooms/types">Back to room types</BackLink>
      <div className="mt-3">
        <AdminPageHeader
          title={isEdit ? `Edit ${roomType.name}` : 'Add room type'}
          subtitle={isEdit ? 'Changes apply to every room of this type.' : 'Rooms of this type share its price and amenities.'}
        />
      </div>
      <AdminFormPanel>
        <RoomTypeForm
          key={roomType?.id ?? 'new'}
          roomType={roomType}
          amenities={data.data.amenities}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Save changes' : 'Create room type'}
        />
      </AdminFormPanel>
    </div>
  );
}
