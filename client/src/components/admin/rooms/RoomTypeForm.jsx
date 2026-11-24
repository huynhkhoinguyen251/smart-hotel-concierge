import { useState } from 'react';
import { Checkbox } from 'antd';
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
  if (amenities.length === 0) {
    return <p className="text-sm text-ink-soft">No amenities yet. Add them on the Amenities tab.</p>;
  }
  return (
    <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {amenities.map((amenity) => (
        <li key={amenity.id}>
          <Checkbox
            checked={selected.includes(amenity.id)}
            onChange={() => onToggle(amenity.id)}
            disabled={disabled}
          >
            <span className="wrap-anywhere">{amenity.name}</span>
          </Checkbox>
        </li>
      ))}
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
    <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label={isEdit ? 'Edit room type' : 'New room type'}>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          maxLength={ROOM_TYPE_NAME_MAX_LENGTH}
          placeholder="For example: Family Suite"
          error={errors.name}
          disabled={saving}
          className="sm:col-span-2"
        />
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
        <Textarea
          label="Description (optional)"
          name="description"
          rows={5}
          value={form.description}
          onChange={handleChange}
          maxLength={ROOM_TYPE_DESCRIPTION_MAX_LENGTH}
          error={errors.description}
          disabled={saving}
          className="sm:col-span-2"
        />
      </div>
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-ink">Amenities</legend>
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
