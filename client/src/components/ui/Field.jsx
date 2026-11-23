// Khung chung của Input, Select, Textarea: nhãn, ô nhập, dòng gợi ý hoặc báo lỗi.
// aside: nội dung bên phải dòng thông báo (bộ đếm ký tự). id của dòng thông báo là `${id}-message`.
export default function Field({ id, label, message, error, aside, className = '', children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm leading-5.5 font-medium text-ink">
          {label}
        </label>
      )}
      {children}
      {(message || aside) && (
        <div className="mt-1 flex justify-between gap-4 text-xs">
          <p id={`${id}-message`} className={error ? 'text-danger' : 'text-ink-soft'}>
            {message}
          </p>
          {aside}
        </div>
      )}
    </div>
  );
}
