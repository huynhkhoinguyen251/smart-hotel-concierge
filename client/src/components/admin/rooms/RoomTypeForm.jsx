import { useId, useState } from 'react';
import {
  MAX_CAPACITY,
  MIN_CAPACITY,
  ROOM_TYPE_DESCRIPTION_MAX_LENGTH,
  ROOM_TYPE_NAME_MAX_LENGTH,
} from '../../../config/adminCatalog.js';
import { getChangedFields, toRoomTypePayload, validateRoomTypeForm } from '../../../utils/catalogValidation.js';
import Alert from '../../ui/Alert.jsx';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Textarea from '../../ui/Textarea.jsx';

const toForm = (roomType) => ({
  name: roomType?.name ?? '',
  description: roomType?.description ?? '',
  price_per_night: roomType ? String(roomType.price_per_night) : '',
  capacity: roomType ? String(roomType.capacity) : '2',
  amenity_ids: (roomType?.amenities ?? []).map((amenity) => amenity.id),
});

// Danh sách ô chọn tiện nghi (có thể không chọn gì).
function AmenityChecklist({ amenities, selected, onToggle, disabled }) {
  const groupId = useId();
  if (amenities.length === 0) {
    return <p className="text-sm text-slate-500">No amenities yet. Add them on the Amenities tab.</p>;
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {amenities.map((amenity) => {
        const id = `${groupId}-${amenity.id}`;
        return (
          <li key={amenity.id}>
            <label htmlFor={id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              <input
                id={id}
                type="checkbox"
                checked={selected.includes(amenity.id)}
                onChange={() => onToggle(amenity.id)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
              />
              <span className="break-words">{amenity.name}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

// Form thêm hoặc sửa loại phòng. amenities: danh sách từ GET /amenities.
// roomType: loại phòng đang sửa (null khi thêm mới); khi sửa chỉ gửi các trường đã đổi.
// onSubmit(payload) gọi API; lỗi của server (400, 409 trùng tên) hiện trong form.
export default function RoomTypeForm({ roomType = null, amenities, onSubmit, submitLabel }) {
  const isEdit = Boolean(roomType);
  const [form, setForm] = useState(() => toForm(roomType));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmitError('');
    setNotice('');
  };
  const handleChange = (event) => update(event.target.name, event.target.value);
  const toggleAmenity = (id) =>
    update(
      'amenity_ids',
      form.amenity_ids.includes(id) ? form.amenity_ids.filter((item) => item !== id) : [...form.amenity_ids, id],
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRoomTypeForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    let payload = toRoomTypePayload(form);
    if (isEdit) {
      payload = getChangedFields(payload, toRoomTypePayload(toForm(roomType)));
      if (Object.keys(payload).length === 0) {
        setNotice('No changes to save.');
        return;
      }
    }

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (apiError) {
      if (apiError.status === 409) setErrors({ name: apiError.message });
      else setSubmitError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={isEdit ? 'Edit room type' : 'New room type'}>
      <Input
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        maxLength={ROOM_TYPE_NAME_MAX_LENGTH}
        placeholder="For example: Family Suite"
        error={errors.name}
        disabled={saving}
      />
      <Textarea
        label="Description (optional)"
        name="description"
        rows={5}
        value={form.description}
        onChange={handleChange}
        maxLength={ROOM_TYPE_DESCRIPTION_MAX_LENGTH}
        error={errors.description}
        disabled={saving}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Price per night (VND)"
          name="price_per_night"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.price_per_night}
          onChange={handleChange}
          placeholder="For example: 1800000"
          error={errors.price_per_night}
          disabled={saving}
        />
        <Input
          label="Capacity (guests)"
          name="capacity"
          type="number"
          min={MIN_CAPACITY}
          max={MAX_CAPACITY}
          step="1"
          inputMode="numeric"
          value={form.capacity}
          onChange={handleChange}
          error={errors.capacity}
          hint={`From ${MIN_CAPACITY} to ${MAX_CAPACITY}`}
          disabled={saving}
        />
      </div>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700">Amenities</legend>
        <AmenityChecklist amenities={amenities} selected={form.amenity_ids} onToggle={toggleAmenity} disabled={saving} />
      </fieldset>
      <div aria-live="polite" className="space-y-2 empty:hidden">
        <Alert type="error">{submitError}</Alert>
        <Alert type="info">{notice}</Alert>
      </div>
      <Button type="submit" loading={saving}>
        {submitLabel}
      </Button>
    </form>
  );
}
