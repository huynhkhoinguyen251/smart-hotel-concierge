import { Link } from 'react-router-dom';

const VIEW_LINK =
  'rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50';

// Danh sách đơn cho admin, dùng chung cho mọi loại yêu cầu.
// Màn hình rộng (xl): bảng; nhỏ hơn: thẻ xếp dọc, nên ở 375px trang không bị cuộn ngang.
// - columns: [{ key, header, render(item), align: 'right' }]. Cột đầu tiên là tiêu đề của thẻ.
// - getViewPath(item), getItemLabel(item) (ví dụ "food order #8"), renderActions(item).
// - viewLabel: chữ của link mở chi tiết, mặc định "View" (trang phòng dùng "Edit").
export default function AdminRequestTable({
  items,
  columns,
  caption,
  getViewPath,
  getItemLabel,
  renderActions,
  viewLabel = 'View',
}) {
  const [first, ...rest] = columns;

  const viewLink = (item) => (
    <Link to={getViewPath(item)} className={VIEW_LINK} aria-label={`${viewLabel} ${getItemLabel(item)}`}>
      {viewLabel}
    </Link>
  );

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm xl:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 font-medium ${column.align === 'right' ? 'text-right' : ''}`}
                >
                  {column.header}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="align-top">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`max-w-56 px-4 py-3 break-words ${column.align === 'right' ? 'text-right whitespace-nowrap' : ''}`}
                  >
                    {column.render(item)}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {viewLink(item)}
                    {renderActions(item)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-4 xl:hidden" aria-label={caption}>
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm">{first.render(item)}</div>
            <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
              {rest.map((column) => (
                <div key={column.key} className="min-w-0">
                  <dt className="text-xs font-medium text-slate-500">{column.header}</dt>
                  <dd className="break-words text-slate-900">{column.render(item)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              {viewLink(item)}
              {renderActions(item)}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
