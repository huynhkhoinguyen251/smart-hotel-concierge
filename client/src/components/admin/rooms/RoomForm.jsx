import { useState } from 'react';
import { ROOM_NUMBER_MAX_LENGTH } from '../../../config/adminCatalog.js';
import { getStatusConfig, ROOM_STATUSES } from '../../../config/statuses.js';
import { getChangedFields, toRoomPayload, validateRoomForm } from '../../../utils/catalogValidation.js';
import formatCurrency from '../../../utils/formatCurrency.js';
import Alert from '../../ui/Alert.jsx';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';

const STATUS_OPTIONS = ROOM_STATUSES.map((status) => ({ value: status, label: getStatusConfig(status).label }));

// Form thêm hoặc sửa phòng. roomTypes: danh sách từ GET /room-types.
// - room: phòng đang sửa (null khi thêm mới). Khi sửa chỉ gửi các trường đã đổi.
// - onSubmit(payload) gọi API và trả về; lỗi của server (ví dụ 409 trùng số phòng) hiện trong form.
// - Khi thêm mới có thêm ô trạng thái ban đầu; khi sửa, trạng thái đổi bằng RoomStatusControl.
export default function RoomForm({ room = null, roomTypes, onSubmit, submitLabel }) {
  const isEdit = Boolean(room);
  const [form, setForm] = useState({
    room_type_id: room ? String(room.room_type.id) : '',
    room_number: room?.room_number ?? '',
    floor: room ? String(room.floor) : '',
    status: 'available',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const typeOptions = [
    ...(isEdit ? [] : [{ value: '', label: 'Choose a room type' }]),
    ...roomTypes.map((type) => ({
      value: String(type.id),
      label: `${type.name} · ${formatCurrency(type.price_per_night)} · up to ${type.capacity}`,
    })),
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmitError('');
    setNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRoomForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    let payload = toRoomPayload(form);
    if (isEdit) {
      payload = getChangedFields(payload, toRoomPayload({
        room_type_id: String(room.room_type.id),
        room_number: room.room_number,
        floor: String(room.floor),
      }));
      if (Object.keys(payload).length === 0) {
        setNotice('No changes to save.');
        return;
      }
    } else {
      payload.status = form.status;
    }

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (apiError) {
      // 409: số phòng đã có; 400: loại phòng không còn.
      if (apiError.status === 409) setErrors({ room_number: apiError.message });
      else setSubmitError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={isEdit ? 'Edit room' : 'New room'}>
      <Select
        label="Room type"
        name="room_type_id"
        value={form.room_type_id}
        onChange={handleChange}
        options={typeOptions}
        error={errors.room_type_id}
        disabled={saving}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Room number"
          name="room_number"
          value={form.room_number}
          onChange={handleChange}
          maxLength={ROOM_NUMBER_MAX_LENGTH}
          placeholder="For example: 501"
          error={errors.room_number}
          hint={`Up to ${ROOM_NUMBER_MAX_LENGTH} characters, must be unique`}
          disabled={saving}
        />
        <Input
          label="Floor"
          name="floor"
          type="number"
          step="1"
          inputMode="numeric"
          value={form.floor}
          onChange={handleChange}
          placeholder="For example: 5"
          error={errors.floor}
          disabled={saving}
        />
      </div>
      {!isEdit && (
        <Select
          label="Initial status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={STATUS_OPTIONS}
          disabled={saving}
        />
      )}
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
