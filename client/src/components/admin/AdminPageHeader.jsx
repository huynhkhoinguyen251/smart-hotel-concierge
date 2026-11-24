import usePageTitle from '../../hooks/usePageTitle.js';

// Phần đầu của mọi trang admin: tiêu đề, mô tả ngắn, nút chính bên phải và thanh chuyển mục (subNav).
// tabTitle: tiêu đề của tab trình duyệt khi nhiều trang có cùng tiêu đề (ba trang của Tourism).
export default function AdminPageHeader({ title, tabTitle = title, subtitle, action, subNav }) {
  usePageTitle(`Admin: ${tabTitle}`);
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight wrap-anywhere text-ink">{title}</h1>
          {subtitle && <p className="mt-1 max-w-prose text-pretty text-ink-soft">{subtitle}</p>}
        </div>
        {action}
      </div>
      {subNav && <div className="mt-4">{subNav}</div>}
    </div>
  );
}
