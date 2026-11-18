import formatCurrency from '../../utils/formatCurrency.js';
import StatusBadge from '../ui/StatusBadge.jsx';

// Các ô dùng chung trong danh sách của admin.

// Ô đầu tiên (cũng là tiêu đề của thẻ trên điện thoại): mã đơn, trạng thái và một dòng phụ.
export function TitleCell({ title, status, detail, marker }) {
  return (
    <div>
      <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
        {marker}
        {title}
        <StatusBadge status={status} />
      </p>
      {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}

export function GuestCell({ user }) {
  return (
    <>
      <p className="font-medium break-words text-slate-900">{user?.full_name ?? '-'}</p>
      {user?.email && <p className="text-xs break-all text-slate-500">{user.email}</p>}
    </>
  );
}

export function MoneyCell({ amount }) {
  return <span className="font-semibold whitespace-nowrap text-slate-900">{formatCurrency(amount)}</span>;
}
