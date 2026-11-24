import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import Alert from '../ui/Alert.jsx';
import BackLink from '../ui/BackLink.jsx';
import DetailRow from '../ui/DetailRow.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import StatusProgress from '../ui/StatusProgress.jsx';

// Các phần của trang chi tiết ngăn nhau bằng khoảng trống và một đường kẻ, không xếp thành nhiều thẻ.
const SECTION_STACK = 'divide-y divide-line-soft *:py-6 *:first:pt-0 *:last:pb-0';

// Một phần có tiêu đề. subtitle: dòng nhỏ dưới tiêu đề; action: nút nhỏ bên phải tiêu đề.
export function AdminSection({ title, subtitle, action, children }) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold wrap-anywhere text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// Danh sách "nhãn, giá trị" ở cột chính: nhãn thành một cột riêng, nên dễ đọc trên màn hình rộng.
export function AdminFacts({ children }) {
  return <dl className="text-sm">{children}</dl>;
}

export function AdminFact({ label, children }) {
  return (
    <div className="grid gap-x-6 gap-y-0.5 py-1.5 sm:grid-cols-[11rem_minmax(0,1fr)]">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="min-w-0 wrap-anywhere font-medium text-ink">{children}</dd>
    </div>
  );
}

// Khách (họ tên, email) ở mọi trang chi tiết của admin. Số điện thoại hiện khi API có trả.
export function AdminGuestSection({ user, title = 'Guest' }) {
  return (
    <AdminSection title={title}>
      <dl className="text-sm">
        <DetailRow label="Name">
          <span className="wrap-anywhere">{user?.full_name ?? '-'}</span>
        </DetailRow>
        <DetailRow label="Email">
          {user?.email ? (
            <a href={`mailto:${user.email}`} className="wrap-anywhere text-sea hover:text-sea-hover hover:underline">
              {user.email}
            </a>
          ) : (
            '-'
          )}
        </DetailRow>
        {user?.phone && <DetailRow label="Phone">{user.phone}</DetailRow>}
      </dl>
    </AdminSection>
  );
}

// Bảng giá ở cột bên. rows: [{ label, value }]; total: tổng tiền.
export function AdminPriceSection({ rows, total }) {
  return (
    <AdminSection title="Price">
      <dl className="text-sm">
        {rows.map((row) => (
          <DetailRow key={row.label} label={row.label}>
            {row.value}
          </DetailRow>
        ))}
        <div className="mt-1 flex items-start justify-between gap-4 border-t border-line-soft py-2.5">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="text-right text-lg font-bold whitespace-nowrap text-ink">{formatCurrency(total)}</dd>
        </div>
      </dl>
    </AdminSection>
  );
}

// Bố cục chung của trang chi tiết (admin): link quay lại, tiêu đề và nhãn, thao tác, thông báo,
// tiến trình, rồi hai cột: main (nội dung) và side (khách, giá, thanh toán).
// Máy tính: thao tác nằm ngang hàng với tiêu đề, ở đầu cột bên. Điện thoại: mọi phần xếp dọc.
// - subNav: thanh chuyển mục (ví dụ Requests / Catalog), hiện trên cùng.
// - badges: nhãn cạnh tiêu đề, mặc định là nhãn của status. meta: dòng phụ, mặc định là ngày tạo.
// - actions: các nút; không có nút thì hiện actionsEmptyText. actionsTitle: tên vùng thao tác.
// - steps: không truyền thì không có thanh tiến trình.
export default function AdminDetailLayout({
  subNav,
  backTo,
  backLabel,
  title,
  status,
  badges,
  meta,
  createdAt,
  createdLabel = 'Created on',
  message,
  steps,
  progressLabel,
  cancelledMessage,
  actions,
  actionsTitle = 'Actions',
  actionsEmptyText,
  main,
  side,
}) {
  return (
    <div className="mx-auto max-w-6xl">
      {subNav && <div className="mb-4">{subNav}</div>}
      <BackLink to={backTo}>{backLabel}</BackLink>

      <div className="mt-3 rounded-panel border border-line-soft bg-white p-4 sm:p-6 lg:p-8">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <header className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="min-w-0 text-2xl font-bold tracking-tight wrap-anywhere text-ink">{title}</h1>
              {badges ?? <StatusBadge status={status} />}
            </div>
            <div className="mt-1.5 text-sm wrap-anywhere text-ink-soft">
              {meta ?? `${createdLabel} ${formatDate(createdAt, { withTime: true })}`}
            </div>
            <div className="mt-4 empty:hidden" aria-live="polite">
              <Alert type={message?.type ?? 'success'}>{message?.text}</Alert>
            </div>
          </header>

          <section aria-label={actionsTitle} className="min-w-0">
            {actions || <p className="text-sm text-ink-soft">{actionsEmptyText}</p>}
          </section>

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
    </div>
  );
}
