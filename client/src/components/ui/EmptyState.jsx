// Khối hiện khi danh sách không có dữ liệu. action: nút hoặc link tùy chọn.
export default function EmptyState({ title, message, action, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center ${className}`}
    >
      <p className="text-lg font-semibold text-slate-800">{title}</p>
      {message && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
