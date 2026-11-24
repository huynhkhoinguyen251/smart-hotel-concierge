import usePageTitle from '../../hooks/usePageTitle.js';

// Trang chỉ có một câu và một việc để làm: không tìm thấy, không có quyền, thiếu thông tin, lỗi tải trang.
// action: một nút hoặc một link.
export default function PlainMessage({ title, message, action }) {
  usePageTitle(title);
  return (
    <div className="shell py-16 lg:py-24">
      <h1 className="text-2xl font-bold tracking-tight text-balance text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-prose text-pretty text-ink-soft">{message}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
