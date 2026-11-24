import { useState } from 'react';
import { createAdminAmenity, deleteAdminAmenity, updateAdminAmenity } from '../../api/adminRoomTypes.api.js';
import { getAmenities } from '../../api/catalog.api.js';
import { TitleCell } from '../../components/admin/AdminCells.jsx';
import ListPanel, { ListBody } from '../../components/ui/ListPanel.jsx';
import AdminRequestTable from '../../components/admin/AdminRequestTable.jsx';
import RowActions from '../../components/admin/RowActions.jsx';
import RoomCatalogHeader from '../../components/admin/rooms/RoomCatalogHeader.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Input from '../../components/ui/Input.jsx';
import { AMENITY_NAME_MAX_LENGTH } from '../../config/adminCatalog.js';
import useFetch from '../../hooks/useFetch.js';
import { validateAmenityName } from '../../utils/catalogValidation.js';

// Form thêm tiện nghi ở đầu trang.
function AddAmenityForm({ onAdded }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nameError = validateAmenityName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    setSaving(true);
    try {
      const amenity = await createAdminAmenity(name.trim());
      setName('');
      onAdded(amenity);
    } catch (apiError) {
      // 409: tên đã có.
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Add amenity" className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
      <Input
        label="New amenity"
        value={name}
        maxLength={AMENITY_NAME_MAX_LENGTH}
        onChange={(event) => {
          setName(event.target.value);
          setError('');
        }}
        placeholder="For example: Coffee machine"
        error={error}
        disabled={saving}
        className="sm:w-80"
      />
      <Button type="submit" loading={saving} className="sm:mt-7">
        Add amenity
      </Button>
    </form>
  );
}

// Đổi tên ngay trong dòng: ô nhập và hai nút Save, Cancel.
function RenameForm({ amenity, onRenamed, onCancel }) {
  const [name, setName] = useState(amenity.name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (event) => {
    event.preventDefault();
    const nameError = validateAmenityName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    if (name.trim() === amenity.name) {
      onCancel();
      return;
    }
    setSaving(true);
    try {
      const updated = await updateAdminAmenity(amenity.id, name.trim());
      onRenamed(updated, amenity.name);
    } catch (apiError) {
      setError(apiError.message);
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      noValidate
      aria-label={`Rename ${amenity.name}`}
      className="flex flex-col gap-2 sm:flex-row sm:items-start"
    >
      <Input
        aria-label={`New name for ${amenity.name}`}
        value={name}
        maxLength={AMENITY_NAME_MAX_LENGTH}
        onChange={(event) => {
          setName(event.target.value);
          setError('');
        }}
        error={error}
        disabled={saving}
        autoFocus
        className="sm:w-72"
      />
      <div className="flex gap-2">
        {/* Nút vàng của trang là "Add amenity". */}
        <Button type="submit" variant="secondary" loading={saving}>
          Save
        </Button>
        <Button variant="secondary" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// /admin/rooms/amenities: danh sách tiện nghi (GET /amenities), thêm, đổi tên và xóa ngay trên trang.
export default function AdminAmenitiesPage() {
  const list = useFetch(() => getAmenities(), ['amenities']);
  const [message, setMessage] = useState({ type: 'success', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const done = (text) => {
    setMessage({ type: 'success', text });
    list.retry();
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteAdminAmenity(deleting.id);
      done(`"${deleting.name}" has been deleted.`);
    } catch (apiError) {
      setMessage({ type: 'error', text: apiError.message });
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Amenity',
      free: true,
      render: (amenity) =>
        amenity.id === editingId ? (
          <RenameForm
            amenity={amenity}
            onCancel={() => setEditingId(null)}
            onRenamed={(updated, oldName) => {
              setEditingId(null);
              done(`"${oldName}" has been renamed to "${updated.name}".`);
            }}
          />
        ) : (
          <TitleCell title={amenity.name} />
        ),
    },
  ];

  return (
    <div className="max-w-4xl">
      <RoomCatalogHeader
        title="Amenities"
        subtitle="Amenities are chosen per room type and shown on the room pages."
      />
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      <ListPanel toolbar={<AddAmenityForm onAdded={(amenity) => done(`"${amenity.name}" has been added.`)} />}>
        <ListBody
          list={list}
          items={list.data ?? []}
          empty={{ title: 'No amenities yet', message: 'Add amenities, then choose them for each room type.' }}
        >
          <AdminRequestTable
            caption="Amenities"
            items={list.data ?? []}
            columns={columns}
            renderActions={(amenity) =>
              amenity.id === editingId ? null : (
                <RowActions
                  itemLabel={amenity.name}
                  primary={
                    <Button
                      size="sm"
                      variant="secondary"
                      aria-label={`Rename ${amenity.name}`}
                      onClick={() => setEditingId(amenity.id)}
                    >
                      Edit
                    </Button>
                  }
                  items={[{ key: 'delete', label: 'Delete', danger: true, onClick: () => setDeleting(amenity) }]}
                />
              )
            }
          />
        </ListBody>
      </ListPanel>
      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting ? `Delete "${deleting.name}"?` : ''}
        message="Room types that have this amenity will lose it. Guests will no longer see it on the room pages."
        confirmLabel="Yes, delete amenity"
        cancelLabel="Keep amenity"
        variant="danger"
        loading={busy}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
