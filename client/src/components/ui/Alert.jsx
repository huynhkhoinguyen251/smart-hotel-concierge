const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-teal-200 bg-teal-50 text-teal-800',
};

// Hộp thông báo. Không có nội dung thì không hiện gì.
export default function Alert({ type = 'info', children, className = '' }) {
  if (!children) {
    return null;
  }
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm ${STYLES[type]} ${className}`}
    >
      {children}
    </div>
  );
}
