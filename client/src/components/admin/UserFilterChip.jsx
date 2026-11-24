import { CloseOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

// Nhãn "Showing items of guest #ID" trong thanh công cụ khi địa chỉ trang có ?user_id=.
// clearTo: đường dẫn bỏ user_id nhưng giữ các bộ lọc khác. Không có userId thì không hiện gì.
export default function UserFilterChip({ userId, clearTo }) {
  if (!userId) return null;
  return (
    <p className="inline-flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1 rounded-control bg-sea-tint px-3 py-2 text-sm text-ink">
      <span>
        Showing items of{' '}
        <Link to={`/admin/users/${userId}`} className="font-semibold text-sea underline hover:text-sea-hover">
          guest #{userId}
        </Link>
      </span>
      <Link
        to={clearTo}
        aria-label={`Show all, remove the filter for guest #${userId}`}
        className="inline-flex items-center gap-1.5 font-semibold text-sea hover:text-sea-hover hover:underline"
      >
        Show all
        <CloseOutlined aria-hidden="true" className="text-xs" />
      </Link>
    </p>
  );
}
