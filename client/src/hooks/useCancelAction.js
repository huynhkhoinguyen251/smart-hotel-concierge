import { useState } from 'react';
import scrollToTop from '../utils/scrollToTop.js';

// Hủy một đơn ở trang chi tiết của khách: hộp thoại xác nhận → gọi API → thông báo ở đầu trang.
// - cancel(): gọi API hủy, trả đơn sau khi hủy; onCancelled(updated): cập nhật đơn trong trang.
// - successMessage: thông báo sau khi hủy; initialMessage: thông báo có sẵn (ví dụ từ trang đặt).
// Trả:
// - success, error: chỉ một trong hai có chữ tại một lúc.
// - showMessage(type, text): hiện thông báo khác (ví dụ "đã lưu") và cuộn lên đầu trang.
// - openDialog(); dialogProps: { open, loading, onConfirm, onClose } truyền thẳng cho ConfirmDialog.
// Lỗi (ví dụ 400: khách sạn vừa xác nhận đơn, hoặc quá hạn hủy online) hiện thông báo của backend.
export default function useCancelAction({ cancel, onCancelled, successMessage, initialMessage = '' }) {
  const [message, setMessage] = useState({ success: initialMessage, error: '' });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const showMessage = (type, text) => {
    setMessage(type === 'success' ? { success: text, error: '' } : { success: '', error: text });
    scrollToTop();
  };

  const confirm = async () => {
    setBusy(true);
    try {
      onCancelled(await cancel());
      showMessage('success', successMessage);
    } catch (apiError) {
      showMessage('error', apiError.message);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return {
    ...message,
    showMessage,
    openDialog: () => setOpen(true),
    dialogProps: { open, loading: busy, onConfirm: confirm, onClose: () => setOpen(false) },
  };
}
