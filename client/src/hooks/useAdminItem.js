import { useState } from 'react';
import scrollToTop from '../utils/scrollToTop.js';

// State chung của trang chi tiết admin: đơn hiện tại (cập nhật sau mỗi lần đổi trạng thái)
// và thông báo. actionProps truyền thẳng cho AdminStatusActions.
export default function useAdminItem(initialItem) {
  const [item, setItem] = useState(initialItem);
  const [message, setMessage] = useState({ type: 'success', text: '' });

  const show = (type, text) => {
    setMessage({ type, text });
    scrollToTop();
  };

  const actionProps = {
    onSuccess: (updated, text) => {
      setItem(updated);
      show('success', text);
    },
    onError: (text) => show('error', text),
  };

  return { item, setItem, message, show, actionProps };
}
