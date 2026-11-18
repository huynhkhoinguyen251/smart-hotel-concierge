import { useState } from 'react';
import { createAdminAmenity, deleteAdminAmenity, updateAdminAmenity } from '../../api/adminRoomTypes.api.js';
import { getAmenities } from '../../api/catalog.api.js';
import RoomCatalogHeader from '../../components/admin/rooms/RoomCatalogHeader.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Input from '../../components/ui/Input.jsx';
import { PageSpinner } from '../../components/ui/Spinner.jsx';
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
    <form onSubmit={handleSubmit} noValidate aria-label="Add amenity" className="flex flex-col gap-3 sm:flex-row sm:items-start">
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

// Một dòng tiện nghi: xem tên, hoặc đổi tên ngay trong dòng (Edit → ô nhập + Save/Cancel).
function AmenityRow({ amenity, onRenamed, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(amenity.name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const cancel = () => {
    setEditing(false);
    setName(amenity.name);
    setError('');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const nameError = validateAmenityName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    if (name.trim() === amenity.name) {
      cancel();
      return;
    }
    setSaving(true);
    try {
      const updated = await updateAdminAmenity(amenity.id, name.trim());
      setEditing(false);
      onRenamed(updated, amenity.name);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <li className="py-3">
        <form onSubmit={handleSave} noValidate aria-label={`Rename ${amenity.name}`} className="flex flex-col gap-2 sm:flex-row sm:items-start">
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
            className="sm:w-80"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving} className="sm:mt-1.5">
              Save
            </Button>
            <Button size="sm" variant="secondary" disabled={saving} onClick={cancel} className="sm:mt-1.5">
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <span className="min-w-0 break-words text-slate-900">{amenity.name}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" aria-label={`Rename ${amenity.name}`} onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" aria-label={`Delete ${amenity.name}`} onClick={() => onDelete(amenity)}>
          Delete
        </Button>
      </div>
    </li>
  );
}

// /admin/rooms/amenities: danh sách tiện nghi (GET /amenities), thêm, đổi tên và xóa ngay trên trang.
export default function AdminAmenitiesPage() {
  const list = useFetch(() => getAmenities(), ['amenities']);
  const [message, setMessage] = useState({ type: 'success', text: '' });
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

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) return <ErrorState message={list.error.message} onRetry={list.retry} />;
    if (list.data.length === 0) {
      return <EmptyState title="No amenities yet" message="Add amenities, then choose them for each room type." />;
    }
    return (
      <ul className="divide-y divide-slate-100" aria-label="Amenities">
        {list.data.map((amenity) => (
          <AmenityRow
            key={`${amenity.id}-${amenity.name}`}
            amenity={amenity}
            onRenamed={(updated, oldName) => done(`"${oldName}" has been renamed to "${updated.name}".`)}
            onDelete={setDeleting}
          />
        ))}
      </ul>
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <RoomCatalogHeader title="Amenities" subtitle="Amenities are chosen per room type and shown on the room pages." />
      <Card className="mb-6">
        <AddAmenityForm onAdded={(amenity) => done(`"${amenity.name}" has been added.`)} />
      </Card>
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      <Card>{renderList()}</Card>
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
