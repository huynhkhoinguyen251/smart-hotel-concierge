import Bone, { BoneGroup } from '../ui/Bone.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import LoadError from '../ui/LoadError.jsx';
import Pagination from '../ui/Pagination.jsx';

const SKELETON_ROWS = 6;

// Khung trắng của một danh sách: tab trạng thái, thanh công cụ (tìm và lọc), rồi bảng.
export default function AdminListPanel({ tabs, toolbar, children }) {
  return (
    <div className="min-w-0 rounded-panel border border-line-soft bg-white">
      {tabs && <div className="px-4 pt-1 lg:px-5">{tabs}</div>}
      {toolbar && (
        <div className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:flex-wrap sm:items-end lg:px-5">
          {toolbar}
        </div>
      )}
      {children}
    </div>
  );
}

function TableSkeleton() {
  return (
    <BoneGroup className="divide-y divide-line-soft">
      {Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <div key={row} className="flex items-center gap-6 px-4 py-4 lg:px-5">
          <Bone className="h-9 w-36" />
          <Bone className="hidden h-5 flex-1 sm:block" />
          <Bone className="ml-auto h-7 w-24" />
        </div>
      ))}
    </BoneGroup>
  );
}

// Phần bảng: đang tải, lỗi, trống, hoặc nội dung kèm phân trang. Tất cả nằm trong khung danh sách.
// list: kết quả useFetch; items: các dòng; empty: { title, message }; pagination: { page, limit, total, onPageChange }.
// Đang tải lại thì bảng cũ mờ đi và tạm không bấm được, thay vì biến mất.
export function AdminListBody({ list, items, empty, pagination, children }) {
  if (list.loading && !list.data) return <TableSkeleton />;
  if (list.error) {
    return (
      <div className="p-4 lg:p-5">
        <LoadError error={list.error} onRetry={list.retry} />
      </div>
    );
  }
  if (items.length === 0) return <EmptyState title={empty.title} message={empty.message} />;
  return (
    <>
      <div
        aria-busy={list.loading}
        className={`transition-opacity duration-150 ${list.loading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {children}
      </div>
      {pagination && <Pagination className="border-t border-line-soft p-4" {...pagination} />}
    </>
  );
}
