// Dấu chưa đọc của một thông báo: chấm xanh biển kèm chữ cho trình đọc màn hình.
// Đã đọc thì chỉ giữ chỗ, để chữ các dòng thẳng hàng.
export default function UnreadDot({ unread, className = '' }) {
  return (
    <span className={`block size-2 shrink-0 rounded-full ${unread ? 'bg-sea' : ''} ${className}`}>
      {unread && <span className="sr-only">Unread.</span>}
    </span>
  );
}
