import { useId } from 'react';

// Ô nhập có nhãn, gợi ý (hint) và dòng báo lỗi. Các thuộc tính khác chuyển thẳng cho <input>.
export default function Input({ label, error, hint, id, className = '', ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  const messageId = `${inputId}-message`;
  const message = error || hint;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={message ? messageId : undefined}
        className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
        }`}
        {...props}
      />
      {message && (
        <p id={messageId} className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
