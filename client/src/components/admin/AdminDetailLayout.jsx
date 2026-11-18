import { Link } from 'react-router-dom';
import formatDate from '../../utils/formatDate.js';
import Alert from '../ui/Alert.jsx';
import Card from '../ui/Card.jsx';
import DetailRow from '../ui/DetailRow.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import StatusProgress from '../ui/StatusProgress.jsx';

// Khung khách (họ tên, email) dùng ở mọi trang chi tiết của admin.
export function AdminGuestCard({ user, title = 'Guest' }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <dl className="mt-2 divide-y divide-slate-100 text-sm">
        <DetailRow label="Name">{user?.full_name ?? '-'}</DetailRow>
        <DetailRow label="Email">
          {user?.email ? (
            <a href={`mailto:${user.email}`} className="break-all text-teal-700 hover:text-teal-800">
              {user.email}
            </a>
          ) : (
            '-'
          )}
        </DetailRow>
      </dl>
    </Card>
  );
}

// Khung "Actions": các nút đổi trạng thái, hoặc một dòng ghi chú khi không còn thao tác.
export function AdminActionsCard({ children, emptyText }) {
  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Actions</h2>
      {children || <p className="text-sm text-slate-500">{emptyText}</p>}
    </Card>
  );
}

// Bố cục chung của trang chi tiết đơn (admin): link quay lại, tiêu đề + trạng thái, ngày tạo,
// thông báo, thanh tiến trình, rồi hai cột: main (nội dung đơn) và side (khách, giá, thao tác).
// subNav: tab phụ của mục (ví dụ Requests / Catalog), hiện trên cùng.
export default function AdminDetailLayout({
  subNav,
  backTo,
  backLabel,
  title,
  status,
  createdAt,
  createdLabel = 'Created on',
  message,
  steps,
  progressLabel,
  cancelledMessage,
  main,
  side,
}) {
  return (
    <div className="mx-auto max-w-5xl">
      {subNav}
      <Link to={backTo} className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← {backLabel}
      </Link>

      <div className="mt-3 mb-2 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 text-2xl font-bold tracking-tight wrap-anywhere text-slate-900 sm:text-3xl">{title}</h1>
        <StatusBadge status={status} />
      </div>
      <p className="mb-6 text-sm text-slate-500">
        {createdLabel} {formatDate(createdAt, { withTime: true })}
      </p>

      <div className="mb-6 empty:hidden" aria-live="polite">
        <Alert type={message?.type ?? 'success'}>{message?.text}</Alert>
      </div>

      <Card className="mb-6">
        <StatusProgress status={status} steps={steps} label={progressLabel} cancelledMessage={cancelledMessage} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-6">{main}</div>
        <div className="min-w-0 space-y-6">{side}</div>
      </div>
    </div>
  );
}
