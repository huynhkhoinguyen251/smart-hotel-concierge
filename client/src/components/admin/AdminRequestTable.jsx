import { useMemo } from 'react';
import { Table } from 'antd';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery.js';

const SCROLL = { x: 'max-content' };

const getCellClass = (column) => {
  if (column.free) return '';
  return column.align === 'right' || column.badges ? 'whitespace-nowrap' : 'max-w-48 wrap-anywhere';
};

// Danh sách dùng chung của admin. Từ lg: bảng antd (bảng rộng thì cuộn bên trong khung, cột thao tác
// luôn thấy). Nhỏ hơn: mỗi mục là một khối gọn xếp dọc, nên ở 375px trang không bị cuộn ngang.
// - columns: [{ key, header, render(item, link), align: 'right', badges, wide, free, labelled }].
//   Cột đầu là tiêu đề; link: { to, label } của trang chi tiết, để cột đầu dẫn tới đó.
//   badges: cột nhãn trạng thái, nằm ngay sau tiêu đề. wide: cần cả hàng trên điện thoại.
//   labelled: số cần có nhãn kèm theo trên điện thoại (không đưa lên cạnh tiêu đề).
//   free: ô không bị giới hạn bề rộng (ví dụ ô đổi tên ngay trong dòng).
// - getViewPath(item), getItemLabel(item) (ví dụ "food order #8"); viewLabel: "View" hoặc "Edit".
// - renderActions(item): không truyền thì không có cột thao tác.
export default function AdminRequestTable({
  items,
  columns,
  caption,
  getViewPath,
  getItemLabel,
  renderActions,
  viewLabel = 'View',
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  // antd không có chú thích bảng, nên gắn tên bảng vào thẻ <table>.
  const components = useMemo(
    () => ({ table: (props) => <table {...props} aria-label={caption} /> }),
    [caption],
  );

  const [first, ...others] = columns;
  const badges = others.find((column) => column.badges);
  // Số tiền: trên điện thoại nằm cùng hàng với tiêu đề.
  const amount = others.find((column) => column.align === 'right' && !column.labelled);
  const rest = others.filter((column) => column !== badges);

  const getLink = (item) =>
    getViewPath ? { to: getViewPath(item), label: `${viewLabel} ${getItemLabel(item)}` } : undefined;

  if (isDesktop) {
    // Nhãn trạng thái đứng ngay sau tiêu đề, nên luôn thấy kể cả khi bảng phải cuộn ngang.
    const tableColumns = [first, ...(badges ? [badges] : []), ...rest].map((column) => ({
      key: column.key,
      title: column.header,
      align: column.align,
      render: (_value, item) => (
        <div className={getCellClass(column)}>{column.render(item, getLink(item))}</div>
      ),
    }));
    if (renderActions) {
      tableColumns.push({
        key: 'actions',
        title: 'Actions',
        fixed: 'right',
        align: 'right',
        render: (_value, item) => renderActions(item),
      });
    }
    return (
      <Table
        rowKey="id"
        size="middle"
        columns={tableColumns}
        dataSource={items}
        components={components}
        pagination={false}
        scroll={SCROLL}
        className="[&_td]:align-top"
      />
    );
  }

  const details = rest.filter((column) => column !== amount);
  return (
    <ul className="divide-y divide-line-soft" aria-label={caption}>
      {items.map((item) => {
        const actions = renderActions?.(item);
        return (
          <li key={item.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 text-sm">
              <div className="min-w-0 wrap-anywhere">{first.render(item, getLink(item))}</div>
              {amount && (
                <div className="text-right">
                  <span className="sr-only">{amount.header}: </span>
                  {amount.render(item)}
                </div>
              )}
            </div>
            {badges && <div className="mt-2">{badges.render(item)}</div>}
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm empty:hidden">
              {details.map((column) => (
                <div key={column.key} className={`min-w-0 ${column.wide ? 'col-span-2' : ''}`}>
                  <dt className="text-xs text-ink-soft">{column.header}</dt>
                  <dd className="wrap-anywhere text-ink">{column.render(item)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 empty:hidden">{actions}</div>
          </li>
        );
      })}
    </ul>
  );
}
