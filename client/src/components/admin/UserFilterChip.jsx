import { Link } from 'react-router-dom';

// Chip "Showing items of guest #ID" phía trên danh sách khi địa chỉ trang có ?user_id=.
// clearTo: đường dẫn bỏ user_id nhưng giữ các bộ lọc khác. Không có userId thì không hiện gì.
export default function UserFilterChip({ userId, clearTo }) {
  if (!userId) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="inline-flex flex-wrap items-center gap-2 rounded-full bg-teal-50 py-1 pr-1 pl-3 text-teal-900 ring-1 ring-teal-200 ring-inset">
        <span>
          Showing items of{' '}
          <Link to={`/admin/users/${userId}`} className="font-semibold underline hover:text-teal-700">
            guest #{userId}
          </Link>
        </span>
        <Link
          to={clearTo}
          aria-label={`Show all, remove the filter for guest #${userId}`}
          className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-teal-800 ring-1 ring-teal-200 hover:bg-teal-100"
        >
          Show all ✕
        </Link>
      </span>
    </div>
  );
}
