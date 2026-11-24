import { useId, useState } from 'react';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import Input from '../ui/Input.jsx';
import RowActions from './RowActions.jsx';

// Các nút đổi trạng thái được phép cho một đơn, dùng chung cho mọi loại yêu cầu của khách.
// - actions: các thao tác của trạng thái hiện tại (xem config/adminRequests.js).
// - update(action, extraValue): gọi API, trả đơn sau khi đổi.
// - itemLabel: ví dụ "food order #8", dùng trong aria-label và thông báo.
// - getExtraField(action): ô nhập thêm trong hộp thoại (ví dụ biển số xe) hoặc null:
//   { label, hint, placeholder, maxLength, validate(value) → lỗi hoặc '' }.
//   Có ô nhập thêm thì lỗi của server hiện ngay trong hộp thoại để admin sửa và thử lại.
// - onSuccess(updated, message), onError(message): trang cha cập nhật và hiện thông báo.
// - compact: dùng trong từng dòng của danh sách: bước tiếp theo là nút, thao tác hủy nằm trong "More".
// Tùy chọn:
// - dialogIntro: câu mở đầu của hộp thoại, mặc định là itemLabel viết hoa chữ đầu.
// - getSuccessMessage(action): thông báo sau khi đổi, mặc định "<ItemLabel>: <action.success>".
// - getDisabledReason(action): lý do khóa nút (hiện thành chữ dưới nút), '' nếu bấm được.
// - note: ghi chú thêm; nextVariant: kiểu nút của bước tiếp theo ở trang chi tiết (mặc định theo action).
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
  note,
  nextVariant,
}) {
  const reasonId = useId();
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

  const isDanger = (item) => item.variant === 'danger';

  const renderButton = (item, props) => {
    const reason = getDisabledReason(item);
    return (
      <Button
        key={item.status}
        loading={saving && item.confirm === false}
        disabled={saving || Boolean(reason)}
        aria-label={compact ? `${item.label}, ${itemLabel}` : undefined}
        aria-describedby={reason ? reasonId : undefined}
        onClick={() => open(item)}
        {...props}
      >
        {item.label}
      </Button>
    );
  };

  const reasons = [...new Set(actions.map(getDisabledReason).filter(Boolean))];

  const renderCompact = () => {
    const next = actions.find((item) => !isDanger(item));
    const nextReason = next ? getDisabledReason(next) : '';
    return (
      <RowActions
        itemLabel={itemLabel}
        disabled={saving}
        primary={next && renderButton(next, { size: 'sm', variant: 'secondary' })}
        items={actions
          .filter((item) => item !== next)
          .map((item) => ({
            key: item.status,
            label: item.label,
            danger: isDanger(item),
            reason: getDisabledReason(item),
            onClick: () => open(item),
          }))}
        note={nextReason ? <span id={reasonId}>{nextReason}</span> : note}
      />
    );
  };

  // Trang chi tiết: bước tiếp theo là nút vàng, thao tác nguy hiểm là nút viền chữ đỏ.
  const renderFull = () => (
    <>
      <div className="flex flex-col gap-2">
        {actions.map((item) =>
          renderButton(item, {
            fullWidth: true,
            ...(isDanger(item)
              ? { variant: 'secondary', danger: true }
              : { variant: nextVariant ?? item.variant }),
          }),
        )}
      </div>
      {reasons.length > 0 && (
        <p id={reasonId} className="mt-2 text-sm text-ink-soft">
          {reasons.join(' ')}
        </p>
      )}
      {note && <p className="mt-2 text-sm text-ink-soft">{note}</p>}
    </>
  );

  return (
    <>
      {compact ? renderCompact() : renderFull()}

      <ConfirmDialog
        open={Boolean(action)}
        title={action?.title}
        message={action ? `${intro}. ${action.message}` : ''}
        confirmLabel={action ? `Yes, ${action.label.toLowerCase()}` : 'Confirm'}
        cancelLabel="Go back"
        variant={action && isDanger(action) ? 'danger' : 'primary'}
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
