import usePageTitle from '../../hooks/usePageTitle.js';

// Tiêu đề trang (cũng là tiêu đề của tab trình duyệt), kèm dòng mô tả ngắn và nút bên phải nếu có.
export default function PageTitle({ title, subtitle, action, className = '' }) {
  usePageTitle(title);
  return (
    <div className={`mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-3 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight wrap-anywhere text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-prose text-pretty text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
