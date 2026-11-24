import formatDate from '../../utils/formatDate.js';
import Alert from '../ui/Alert.jsx';
import BackLink from '../ui/BackLink.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import StatusProgress from '../ui/StatusProgress.jsx';

// Các phần của trang chi tiết ngăn nhau bằng khoảng trống và một đường kẻ, không xếp thành nhiều thẻ.
const SECTION_STACK = 'divide-y divide-line-soft *:py-6 *:first:pt-0 *:last:pb-0';

// Khung trắng của trang chi tiết đơn, dùng chung cho khách và admin: link quay lại, tiêu đề và nhãn,
// thao tác, thông báo, tiến trình, rồi hai cột: main (nội dung) và side (khách, giá, thanh toán).
// Điện thoại: mọi phần xếp dọc.
// - titleClassName: cỡ chữ tiêu đề (trang khách lớn hơn trang admin).
// - badges: nhãn cạnh tiêu đề, mặc định là nhãn của status. meta: dòng phụ, mặc định là ngày tạo.
// - lead: phần quan trọng nhất, đứng ngay sau tiêu đề (khung thanh toán).
// - actions: các nút ngang hàng với tiêu đề; không có nút thì hiện actionsEmptyText; không có cả hai thì bỏ vùng này.
// - steps: không truyền thì không có thanh tiến trình. side: không có thì nội dung rộng cả khung.
export default function DetailLayout({
  backTo,
  backLabel,
  title,
  titleClassName = 'text-2xl',
  status,
  badges,
  meta,
  createdAt,
  createdLabel = 'Created on',
  message,
  lead,
  steps,
  progressLabel,
  cancelledMessage,
  actions,
  actionsTitle = 'Actions',
  actionsEmptyText,
  main,
  side,
}) {
  const hasActions = Boolean(actions || actionsEmptyText);
  return (
    <>
      <BackLink to={backTo}>{backLabel}</BackLink>

      <div className="mt-3 rounded-panel border border-line-soft bg-white p-4 sm:p-6 lg:p-8">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <header className={`min-w-0 ${hasActions ? '' : 'lg:col-span-2'}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className={`min-w-0 font-bold tracking-tight wrap-anywhere text-ink ${titleClassName}`}>{title}</h1>
              {badges ?? <StatusBadge status={status} />}
            </div>
            <div className="mt-1.5 text-sm wrap-anywhere text-ink-soft">
              {meta ?? `${createdLabel} ${formatDate(createdAt, { withTime: true })}`}
            </div>
            <div className="not-empty:mt-4" aria-live="polite">
              <Alert type={message?.type ?? 'success'}>{message?.text}</Alert>
            </div>
          </header>

          {hasActions && (
            <section aria-label={actionsTitle} className="min-w-0">
              {actions || <p className="text-sm text-ink-soft">{actionsEmptyText}</p>}
            </section>
          )}

          {lead && <div className="min-w-0 border-t border-line-soft pt-6 lg:col-span-2">{lead}</div>}

          {steps && (
            <div className="border-t border-line-soft pt-6 lg:col-span-2">
              <StatusProgress
                status={status}
                steps={steps}
                label={progressLabel}
                cancelledMessage={cancelledMessage}
              />
            </div>
          )}

          <div className={`min-w-0 border-t border-line-soft pt-6 ${SECTION_STACK} ${side ? '' : 'lg:col-span-2'}`}>
            {main}
          </div>
          {side && <div className={`min-w-0 border-t border-line-soft pt-6 ${SECTION_STACK}`}>{side}</div>}
        </div>
      </div>
    </>
  );
}
