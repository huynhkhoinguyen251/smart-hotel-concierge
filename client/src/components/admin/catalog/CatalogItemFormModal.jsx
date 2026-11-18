import { useId, useState } from 'react';
import { toCatalogForm, toCatalogPayload, validateCatalogForm } from '../../../utils/catalogValidation.js';
import Alert from '../../ui/Alert.jsx';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Modal from '../../ui/Modal.jsx';
import Select from '../../ui/Select.jsx';
import Textarea from '../../ui/Textarea.jsx';
import ImageUrlField from '../ImageUrlField.jsx';

// Một ô của form theo field.kind. half: nửa hàng trên màn hình rộng.
function CatalogField({ field, form, errors, saving, itemName, onChange, onUploadBusy }) {
  const common = {
    label: field.label,
    value: form[field.name],
    error: errors[field.name],
    disabled: saving,
    onChange: (event) => onChange(field.name, event.target.value),
  };
  if (field.kind === 'textarea') {
    return <Textarea {...common} rows={4} maxLength={field.max} placeholder={field.placeholder} />;
  }
  if (field.kind === 'select') {
    return <Select {...common} options={field.options} />;
  }
  if (field.kind === 'price') {
    return <Input {...common} inputMode="decimal" placeholder="For example: 150000" hint={field.hint ?? 'In VND. 0 means free.'} />;
  }
  if (field.kind === 'image') {
    return (
      <ImageUrlField
        label={field.label}
        itemName={itemName}
        value={form[field.name]}
        onChange={(url) => onChange(field.name, url)}
        error={errors[field.name]}
        onBusyChange={onUploadBusy}
        disabled={saving}
      />
    );
  }
  return <Input {...common} maxLength={field.max} placeholder={field.placeholder} />;
}

// Nội dung form. Được gắn key theo mục đang sửa, nên mỗi lần mở form state bắt đầu lại từ đầu.
function CatalogItemForm({ formId, item, catalog, onSaved, onSavingChange, onUploadBusy }) {
  const [form, setForm] = useState(() => toCatalogForm(item, catalog.fields, catalog.flag));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const flagId = useId();

  const changeSaving = (value) => {
    setSaving(value);
    onSavingChange(value);
  };

  const handleChange = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCatalogForm(form, catalog.fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setApiError('Please fix the highlighted fields.');
      return;
    }
    // PUT sửa toàn bộ, nên luôn gửi đủ mọi trường.
    const payload = toCatalogPayload(form, catalog.fields, catalog.flag);
    changeSaving(true);
    try {
      const saved = item ? await catalog.api.update(item.id, payload) : await catalog.api.create(payload);
      changeSaving(false);
      onSaved(saved, !item);
    } catch (error) {
      // 400 của backend (ví dụ link ảnh sai) hiện ngay trong hộp thoại.
      setApiError(error.message);
      changeSaving(false);
    }
  };

  const itemName = form.name?.trim() || item?.name || '';

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={item ? `Edit ${item.name}` : `Add ${catalog.noun}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        {catalog.fields.map((field) => (
          <div key={field.name} className={field.half ? 'min-w-0' : 'min-w-0 sm:col-span-2'}>
            <CatalogField
              field={field}
              form={form}
              errors={errors}
              saving={saving}
              itemName={itemName}
              onChange={handleChange}
              onUploadBusy={onUploadBusy}
            />
          </div>
        ))}
      </div>
      <label htmlFor={flagId} className="flex items-start gap-2 text-sm text-slate-700">
        <input
          id={flagId}
          type="checkbox"
          checked={form[catalog.flag]}
          onChange={(event) => handleChange(catalog.flag, event.target.checked)}
          disabled={saving}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
        />
        <span>
          <span className="font-medium text-slate-900">{catalog.flagLabels.on}</span>
          <span className="block text-xs text-slate-500">{catalog.flagHint}</span>
        </span>
      </label>
      <div aria-live="polite" className="empty:hidden">
        <Alert type="error">{apiError}</Alert>
      </div>
    </form>
  );
}

// Hộp thoại thêm/sửa một mục danh mục. item = null: thêm mới; có item: sửa (điền sẵn từ dòng
// trong danh sách, vì admin không có API chi tiết cho các danh mục này).
// catalog: { noun, fields, flag, flagLabels, flagHint, api }. onSaved(saved, isNew).
export default function CatalogItemFormModal({ open, item, catalog, onClose, onSaved }) {
  const formId = useId();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const busy = saving || uploading;

  const close = () => {
    setUploading(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={item ? `Edit ${item.name}` : `Add ${catalog.noun}`}
      description={item ? 'Every field is saved again when you click Save.' : undefined}
      busy={busy}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving} disabled={uploading}>
            {item ? 'Save changes' : `Add ${catalog.noun}`}
          </Button>
        </>
      }
    >
      {open && (
        <CatalogItemForm
          key={item?.id ?? 'new'}
          formId={formId}
          item={item}
          catalog={catalog}
          onSaved={(saved, isNew) => {
            setUploading(false);
            onSaved(saved, isNew);
          }}
          onSavingChange={setSaving}
          onUploadBusy={setUploading}
        />
      )}
    </Modal>
  );
}
