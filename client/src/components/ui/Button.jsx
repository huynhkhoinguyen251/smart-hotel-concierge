import Spinner from './Spinner.jsx';

const VARIANTS = {
  primary: 'bg-teal-700 text-white hover:bg-teal-800 focus-visible:outline-teal-700',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
};

// Nút dùng chung. loading: hiện vòng xoay và tự khóa nút để không gửi hai lần.
export default function Button({
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
