import { useState } from 'react';
import { deleteAdminRoomType } from '../../api/adminRoomTypes.api.js';
import { getRoomTypes } from '../../api/catalog.api.js';
import AdminListPanel, { AdminListBody } from '../../components/admin/AdminListPanel.jsx';
import AdminRequestTable from '../../components/admin/AdminRequestTable.jsx';
import { MoneyCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import RowActions from '../../components/admin/RowActions.jsx';
import RoomCatalogHeader from '../../components/admin/rooms/RoomCatalogHeader.jsx';
import Alert from '../../components/ui/Alert.jsx';
import ButtonLink from '../../components/ui/ButtonLink.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
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
    render: (type, link) => <TitleCell title={type.name} link={link} />,
  },
  { key: 'price', header: 'Price per night', align: 'right', render: (type) => <MoneyCell amount={type.price_per_night} /> },
  { key: 'capacity', header: 'Capacity', render: (type) => `Up to ${type.capacity} guests` },
  {
    key: 'amenities',
    header: 'Amenities',
    wide: true,
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

  return (
    <>
      <RoomCatalogHeader
        title="Room types"
        subtitle="Price, capacity and amenities are set per room type and shared by its rooms."
        action={{ to: '/admin/rooms/types/new', label: 'Add room type' }}
      />
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      <AdminListPanel>
        <AdminListBody
          list={list}
          items={list.data ?? []}
          empty={{
            title: 'No room types yet',
            message: 'Add a room type with its price, capacity and amenities.',
          }}
        >
          <AdminRequestTable
            caption="Room types"
            items={list.data ?? []}
            columns={COLUMNS}
            viewLabel="Edit"
            getViewPath={(type) => `/admin/rooms/types/${type.id}`}
            getItemLabel={(type) => `room type ${type.name}`}
            renderActions={(type) => (
              <RowActions
                itemLabel={`room type ${type.name}`}
                primary={
                  <ButtonLink
                    to={`/admin/rooms/types/${type.id}`}
                    variant="secondary"
                    size="sm"
                    aria-label={`Edit room type ${type.name}`}
                  >
                    Edit
                  </ButtonLink>
                }
                items={[{ key: 'delete', label: 'Delete', danger: true, onClick: () => setDeleting(type) }]}
              />
            )}
          />
        </AdminListBody>
      </AdminListPanel>
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
    </>
  );
}
