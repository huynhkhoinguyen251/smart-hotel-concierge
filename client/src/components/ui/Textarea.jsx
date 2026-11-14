import { useId } from 'react';

// Ô nhập nhiều dòng, cùng kiểu với Input. Có maxLength thì hiện bộ đếm ký tự "120/1000".
export default function Textarea({ label, error, hint, id, maxLength, value = '', className = '', ...props }) {
  const autoId = useId();
  const textareaId = id || autoId;
  const messageId = `${textareaId}-message`;
  const message = error || hint;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={message ? messageId : undefined}
        className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
        }`}
        {...props}
      />
      <div className="mt-1 flex justify-between gap-4 text-xs">
        <p id={messageId} className={error ? 'text-red-600' : 'text-slate-500'}>
          {message}
        </p>
        {maxLength && (
          <p className="shrink-0 text-slate-500" aria-live="polite">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
