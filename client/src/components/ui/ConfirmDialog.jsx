import { useId } from 'react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

// Hộp thoại xác nhận. Nhấn Esc hoặc bấm ra ngoài để đóng, trừ khi đang gửi request.
// Con trỏ nằm sẵn ở nút Cancel (lựa chọn an toàn). children: nội dung thêm dưới message (ví dụ một ghi chú).
export default function ConfirmDialog({
  open,
  title,
  message,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
  onClose,
}) {
  const messageId = useId();

  return (
    <Modal
      open={open}
      title={title}
      describedBy={messageId}
      busy={loading}
      closable={false}
      size="md"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" disabled={loading} onClick={onClose} data-autofocus="true">
            {cancelLabel}
          </Button>
          <Button variant={variant} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div id={messageId} className="space-y-2 text-sm text-ink-soft">
        {message && <p>{message}</p>}
        {children}
      </div>
    </Modal>
  );
}
