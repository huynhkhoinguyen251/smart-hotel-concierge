import { useId } from 'react';

// Ô chọn có nhãn và dòng báo lỗi, cùng kiểu với Input.
// options: [{ value, label }]. Các thuộc tính khác chuyển thẳng cho <select>.
export default function Select({ label, error, id, options, className = '', ...props }) {
  const autoId = useId();
  const selectId = id || autoId;
  const messageId = `${selectId}-message`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? messageId : undefined}
        className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 disabled:bg-slate-100 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
        }`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={messageId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
