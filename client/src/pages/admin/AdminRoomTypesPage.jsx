import { useState } from 'react';
import { deleteAdminRoomType } from '../../api/adminRoomTypes.api.js';
import { getRoomTypes } from '../../api/catalog.api.js';
import AdminRequestTable from '../../components/admin/AdminRequestTable.jsx';
import { MoneyCell } from '../../components/admin/AdminCells.jsx';
import RoomCatalogHeader from '../../components/admin/rooms/RoomCatalogHeader.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { PageSpinner } from '../../components/ui/Spinner.jsx';
import { ROOM_TYPE_IN_USE_NOTE } from '../../config/adminCatalog.js';
import useFetch from '../../hooks/useFetch.js';
import useFlashMessage from '../../hooks/useFlashMessage.js';

const AMENITIES_SHOWN = 3;

// "Free Wi-Fi, Air conditioning, TV +2 more".
const shortAmenities = (amenities) => {
  if (!amenities?.length) return '-';
  const names = amenities.slice(0, AMENITIES_SHOWN).map((amenity) => amenity.name).join(', ');
  const more = amenities.length - AMENITIES_SHOWN;
  return more > 0 ? `${names} +${more} more` : names;
};

const COLUMNS = [
  {
    key: 'name',
    header: 'Room type',
    render: (type) => <p className="font-semibold break-words text-slate-900">{type.name}</p>,
  },
  { key: 'price', header: 'Price per night', align: 'right', render: (type) => <MoneyCell amount={type.price_per_night} /> },
  { key: 'capacity', header: 'Capacity', render: (type) => `Up to ${type.capacity} guests` },
  {
    key: 'amenities',
    header: 'Amenities',
    render: (type) => (
      <span title={type.amenities?.map((amenity) => amenity.name).join(', ')}>{shortAmenities(type.amenities)}</span>
    ),
  },
];

// /admin/rooms/types: loại phòng (đọc từ GET /room-types; API này không có số phòng của từng loại).
export default function AdminRoomTypesPage() {
  const flashMessage = useFlashMessage();
  const list = useFetch(() => getRoomTypes(), ['room-types']);
  const [message, setMessage] = useState({ type: 'success', text: flashMessage });
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteAdminRoomType(deleting.id);
      setMessage({ type: 'success', text: `Room type "${deleting.name}" has been deleted.` });
      list.retry();
    } catch (apiError) {
      setMessage({
        type: 'error',
        text: apiError.status === 409 ? `"${deleting.name}" still has rooms. ${ROOM_TYPE_IN_USE_NOTE}` : apiError.message,
      });
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) return <ErrorState message={list.error.message} onRetry={list.retry} />;
    if (list.data.length === 0) {
      return <EmptyState title="No room types yet" message="Add a room type with its price, capacity and amenities." />;
    }
    return (
      <AdminRequestTable
        caption="Room types"
        items={list.data}
        columns={COLUMNS}
        viewLabel="Edit"
        getViewPath={(type) => `/admin/rooms/types/${type.id}`}
        getItemLabel={(type) => `room type ${type.name}`}
        renderActions={(type) => (
          <Button size="sm" variant="danger" aria-label={`Delete room type ${type.name}`} onClick={() => setDeleting(type)}>
            Delete
          </Button>
        )}
      />
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <RoomCatalogHeader
        title="Room types"
        subtitle="Price, capacity and amenities are set per room type and shared by its rooms."
        action={{ to: '/admin/rooms/types/new', label: 'Add room type' }}
      />
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      {renderList()}
      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting ? `Delete room type "${deleting.name}"?` : ''}
        message={`A room type can only be deleted when it has no rooms. ${ROOM_TYPE_IN_USE_NOTE}`}
        confirmLabel="Yes, delete room type"
        cancelLabel="Keep room type"
        variant="danger"
        loading={busy}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
