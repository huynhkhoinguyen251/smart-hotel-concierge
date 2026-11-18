import { useEffect, useId, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Hộp thoại chung (ví dụ form thêm/sửa trong trang danh mục).
// - Khi mở: khóa cuộn trang, đưa con trỏ vào ô đầu tiên của nội dung; Tab chỉ chạy trong hộp thoại.
// - Khi đóng: trả con trỏ về nút đã mở hộp thoại.
// - Esc hoặc bấm ra ngoài để đóng, trừ khi busy (đang gửi request).
// - Trên điện thoại hộp thoại rộng hết màn hình; nội dung dài thì cuộn bên trong.
// footer: các nút ở cuối, luôn hiện (không cuộn theo nội dung).
export default function Modal({ open, title, description, busy = false, onClose, footer, children, size = 'lg' }) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  // Giữ onClose và busy mới nhất trong ref, để effect mở/đóng không chạy lại mỗi lần render.
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  useEffect(() => {
    closeRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    // Ưu tiên ô có data-autofocus, rồi ô đầu tiên của phần nội dung (bỏ qua nút đóng ở góc).
    const first =
      panel?.querySelector('[data-autofocus]') ?? bodyRef.current?.querySelector(FOCUSABLE) ?? panel?.querySelector(FOCUSABLE);
    (first ?? panel)?.focus();

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        if (!busyRef.current) closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl focus:outline-none sm:max-h-[90vh] sm:rounded-2xl ${
          size === 'md' ? 'sm:max-w-md' : 'sm:max-w-2xl'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold break-words text-slate-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
