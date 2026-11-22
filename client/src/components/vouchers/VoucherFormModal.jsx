import { useId, useState } from 'react';
import { adminVouchersApi } from '../../api/vouchers.api.js';
import { DISCOUNT_TYPE_OPTIONS, MAX_VOUCHER_CODE_LENGTH } from '../../config/vouchers.js';
import { toVoucherForm, toVoucherPayload, validateVoucherForm } from '../../utils/voucherForm.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Modal from '../ui/Modal.jsx';
import Select from '../ui/Select.jsx';

// Nội dung form; gắn key theo voucher đang sửa để mỗi lần mở bắt đầu lại từ đầu.
function VoucherForm({ formId, voucher, onSaved, onSavingChange }) {
  const [form, setForm] = useState(() => toVoucherForm(voucher));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const activeId = useId();

  const change = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateVoucherForm(form, { usedCount: voucher?.used_count ?? 0 });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setApiError('Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    onSavingChange(true);
    try {
      const payload = toVoucherPayload(form, voucher);
      const saved = voucher ? await adminVouchersApi.update(voucher.id, payload) : await adminVouchersApi.create(payload);
      onSaved(saved, !voucher);
    } catch (error) {
      // 409: mã đã có; 400: ví dụ max_uses thấp hơn số lần đã dùng.
      setApiError(error.message);
    } finally {
      setSaving(false);
      onSavingChange(false);
    }
  };

  const field = (name) => ({
    value: form[name],
    error: errors[name],
    disabled: saving,
    onChange: (event) => change(name, event.target.value),
  });
  const percent = form.discount_type === 'percent';

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={voucher ? `Edit ${voucher.code}` : 'Add voucher'}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Code"
          {...field('code')}
          maxLength={MAX_VOUCHER_CODE_LENGTH}
          placeholder="For example: SUMMER20"
          hint="Letters, numbers, - and _. Saved in capitals."
          className="sm:col-span-2"
        />
        <Select label="Discount type" {...field('discount_type')} options={DISCOUNT_TYPE_OPTIONS} />
        <Input
          label={percent ? 'Discount (%)' : 'Discount (VND)'}
          {...field('discount_value')}
          inputMode="decimal"
          placeholder={percent ? 'For example: 10' : 'For example: 50000'}
        />
        <Input label="Minimum spend (VND)" {...field('min_amount')} inputMode="decimal" hint="0 means no minimum." />
        <Input
          label="Max uses"
          {...field('max_uses')}
          inputMode="numeric"
          placeholder="Unlimited"
          hint={voucher ? `Leave empty for unlimited. Used ${voucher.used_count} times so far.` : 'Leave empty for unlimited.'}
        />
        <Input label="Starts at" type="datetime-local" {...field('starts_at')} />
        <Input label="Ends at" type="datetime-local" {...field('ends_at')} />
      </div>
      <label htmlFor={activeId} className="flex items-start gap-2 text-sm text-slate-700">
        <input
          id={activeId}
          type="checkbox"
          checked={form.is_active}
          onChange={(event) => change('is_active', event.target.checked)}
          disabled={saving}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
        />
        <span>
          <span className="font-medium text-slate-900">Active</span>
          <span className="block text-xs text-slate-500">Guests can use this code between the start and end times.</span>
        </span>
      </label>
      <div aria-live="polite" className="empty:hidden">
        <Alert type="error">{apiError}</Alert>
      </div>
    </form>
  );
}

// Hộp thoại thêm/sửa voucher. voucher null: thêm mới. onSaved(saved, isNew).
export default function VoucherFormModal({ open, voucher, onClose, onSaved }) {
  const formId = useId();
  const [saving, setSaving] = useState(false);
  return (
    <Modal
      open={open}
      title={voucher ? `Edit ${voucher.code}` : 'Add voucher'}
      description={voucher ? 'Every field is saved again when you click Save.' : undefined}
      busy={saving}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" disabled={saving} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            {voucher ? 'Save changes' : 'Add voucher'}
          </Button>
        </>
      }
    >
      {open && (
        <VoucherForm key={voucher?.id ?? 'new'} formId={formId} voucher={voucher} onSaved={onSaved} onSavingChange={setSaving} />
      )}
    </Modal>
  );
}
