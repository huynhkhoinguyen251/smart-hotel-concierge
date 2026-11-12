import Button from './Button.jsx';

// Khối báo lỗi khi tải dữ liệu thất bại, kèm nút thử lại.
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center ${className}`}
    >
      <p className="text-lg font-semibold text-red-800">{title}</p>
      {message && <p className="mt-1 text-sm text-red-700">{message}</p>}
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
