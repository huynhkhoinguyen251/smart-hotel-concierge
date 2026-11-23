// Tiêu đề trang, kèm dòng mô tả ngắn nếu có.
export default function PageTitle({ title, subtitle, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 max-w-prose text-ink-soft">{subtitle}</p>}
    </div>
  );
}
