import { useId, useRef } from 'react';
import { Modal as AntModal } from 'antd';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const WIDTHS = { md: 448, lg: 672 };

const CLASS_NAMES = {
  body: 'max-h-[calc(100dvh-13rem)] overflow-y-auto -mx-6 px-6 py-1',
  footer: 'mt-5',
};

// Hộp thoại chung (ví dụ form thêm/sửa trong trang danh mục).
// - Khi mở: khóa cuộn trang, đưa con trỏ vào ô đầu tiên của nội dung; Tab chỉ chạy trong hộp thoại.
// - Khi đóng: trả con trỏ về nút đã mở hộp thoại.
// - Esc hoặc bấm ra ngoài để đóng, trừ khi busy (đang gửi request).
// - Nội dung dài thì cuộn bên trong; footer (các nút) luôn hiện.
// closable: có nút X ở góc hay không. describedBy: id của đoạn mô tả, nếu không dùng description.
export default function Modal({
  open,
  title,
  description,
  describedBy,
  busy = false,
  closable = true,
  onClose,
  footer,
  children,
  size = 'lg',
}) {
  const descriptionId = useId();
  const bodyRef = useRef(null);
  // true khi phím Esc vừa dùng để đóng một danh sách chọn đang mở trong hộp thoại.
  const escapeUsedRef = useRef(false);
  const describedById = description ? descriptionId : describedBy;

  const handleOpenChange = (isOpen) => {
    const body = bodyRef.current;
    const dialog = body?.closest('[role="dialog"]');
    if (!isOpen || !dialog) return;
    if (describedById) dialog.setAttribute('aria-describedby', describedById);
    // Ưu tiên phần tử có data-autofocus, rồi ô đầu tiên của nội dung.
    const target = dialog.querySelector('[data-autofocus]') ?? body.querySelector(FOCUSABLE);
    target?.focus();
  };

  const handleKeyDownCapture = (event) => {
    escapeUsedRef.current =
      event.key === 'Escape' && Boolean(bodyRef.current?.querySelector('[aria-expanded="true"]'));
  };

  const handleCancel = () => {
    if (escapeUsedRef.current) {
      escapeUsedRef.current = false;
      return;
    }
    onClose();
  };

  // Tab từ phần tử cuối quay về phần tử đầu và ngược lại.
  const handleKeyDown = (event) => {
    const dialog = bodyRef.current?.closest('[role="dialog"]');
    if (event.key !== 'Tab' || !dialog?.contains(event.target)) return;
    const items = [...dialog.querySelectorAll(FOCUSABLE)].filter((item) => item.offsetParent !== null);
    const edge = event.shiftKey ? items[0] : items[items.length - 1];
    if (items.length === 0 || document.activeElement !== edge) return;
    event.preventDefault();
    (event.shiftKey ? items[items.length - 1] : items[0]).focus();
  };

  return (
    <AntModal
      open={open}
      title={<h2 className="pr-6 text-lg font-semibold wrap-anywhere text-ink">{title}</h2>}
      onCancel={handleCancel}
      keyboard={!busy}
      mask={{ closable: !busy }}
      closable={closable ? { disabled: busy, 'aria-label': 'Close' } : false}
      footer={
        footer ? <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div> : null
      }
      width={WIDTHS[size] ?? WIDTHS.lg}
      centered
      destroyOnHidden
      classNames={CLASS_NAMES}
      wrapProps={{ onKeyDown: handleKeyDown, onKeyDownCapture: handleKeyDownCapture }}
      afterOpenChange={handleOpenChange}
    >
      <div ref={bodyRef}>
        {description && (
          <p id={descriptionId} className="mb-4 text-sm text-ink-soft">
            {description}
          </p>
        )}
        {children}
      </div>
    </AntModal>
  );
}
