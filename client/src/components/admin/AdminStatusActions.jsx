import { useState } from 'react';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import Input from '../ui/Input.jsx';

// Các nút đổi trạng thái được phép cho một đơn, dùng chung cho mọi loại yêu cầu của khách.
// - actions: các thao tác của trạng thái hiện tại (xem config/adminRequests.js).
// - update(action, extraValue): gọi API, trả đơn sau khi đổi.
// - itemLabel: ví dụ "food order #8", dùng trong aria-label và thông báo.
// - getExtraField(action): ô nhập thêm trong hộp thoại (ví dụ biển số xe) hoặc null:
//   { label, hint, placeholder, maxLength, validate(value) → lỗi hoặc '' }.
//   Có ô nhập thêm thì lỗi của server hiện ngay trong hộp thoại để admin sửa và thử lại.
// - onSuccess(updated, message), onError(message): trang cha cập nhật và hiện thông báo.
// - compact: nút nhỏ cho từng dòng của danh sách.
// Tùy chọn (dùng cho đơn đặt phòng):
// - dialogIntro: câu mở đầu của hộp thoại, mặc định là itemLabel viết hoa chữ đầu.
// - getSuccessMessage(action): thông báo sau khi đổi, mặc định "<ItemLabel>: <action.success>".
// - getDisabledReason(action): lý do khóa nút (hiện khi rê chuột), '' nếu bấm được.
export default function AdminStatusActions({
  actions,
  update,
  itemLabel,
  getExtraField = () => null,
  onSuccess,
  onError,
  compact = false,
  dialogIntro,
  getSuccessMessage,
  getDisabledReason = () => '',
}) {
  const [action, setAction] = useState(null);
  const [extraValue, setExtraValue] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [saving, setSaving] = useState(false);

  if (actions.length === 0) return null;

  const title = `${itemLabel.charAt(0).toUpperCase()}${itemLabel.slice(1)}`;
  const intro = dialogIntro ?? title;
  const extraField = action ? getExtraField(action) : null;

  const run = async (item, value) => {
    setSaving(true);
    try {
      const updated = await update(item, value);
      onSuccess(updated, getSuccessMessage ? getSuccessMessage(item) : `${title}: ${item.success}`);
      setAction(null);
    } catch (apiError) {
      // Ví dụ 400: đơn vừa đổi trạng thái ở tab khác, hoặc biển số sai.
      if (getExtraField(item)) {
        setFieldError(apiError.message);
      } else {
        onError(apiError.message);
        setAction(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const open = (item) => {
    if (item.confirm === false) {
      run(item, '');
      return;
    }
    setExtraValue('');
    setFieldError('');
    setAction(item);
  };

  const handleConfirm = () => {
    if (extraField) {
      const error = extraField.validate(extraValue);
      if (error) {
        setFieldError(error);
        return;
      }
    }
    run(action, extraValue.trim());
  };

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'flex-col'}`}>
        {actions.map((item) => {
          const disabledReason = getDisabledReason(item);
          return (
            <Button
              key={item.status}
              variant={item.variant === 'danger' ? 'danger' : compact ? 'secondary' : item.variant}
              size={compact ? 'sm' : 'md'}
              className={compact ? '' : 'w-full'}
              loading={saving && item.confirm === false}
              disabled={saving || Boolean(disabledReason)}
              title={disabledReason || undefined}
              aria-label={compact ? `${item.label}, ${itemLabel}` : undefined}
              onClick={() => open(item)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(action)}
        title={action?.title}
        message={action ? `${intro}. ${action.message}` : ''}
        confirmLabel={action ? `Yes, ${action.label.toLowerCase()}` : 'Confirm'}
        cancelLabel="Go back"
        variant={action?.variant === 'danger' ? 'danger' : 'primary'}
        loading={saving}
        onConfirm={handleConfirm}
        onClose={() => setAction(null)}
      >
        {extraField && (
          <Input
            label={extraField.label}
            value={extraValue}
            maxLength={extraField.maxLength}
            placeholder={extraField.placeholder}
            hint={extraField.hint}
            error={fieldError}
            onChange={(event) => {
              setExtraValue(event.target.value);
              setFieldError('');
            }}
            disabled={saving}
            className="pt-2"
          />
        )}
      </ConfirmDialog>
    </>
  );
}
