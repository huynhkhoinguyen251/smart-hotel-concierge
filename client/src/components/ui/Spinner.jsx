// Vòng xoay chờ tải. size: 'sm' (trong nút) hoặc 'md'.
export default function Spinner({ size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-[3px]';
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-current border-r-transparent ${sizeClass} ${className}`}
    />
  );
}

// Vòng xoay ở giữa một vùng, dùng khi cả trang đang tải.
export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-teal-700">
      <Spinner />
    </div>
  );
}
