import formatCurrency from '../../utils/formatCurrency.js';
import RoomImage from '../rooms/RoomImage.jsx';
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

// Ô đầu của danh mục (dịch vụ, món ăn, tour): ảnh nhỏ, tên, nhãn bật/tắt và một dòng phụ.
export function CatalogItemCell({ item, status, detail }) {
  return (
    <div className="flex items-center gap-3">
      <RoomImage src={item.image_url} alt={item.name} className="h-12 w-16 shrink-0 rounded-lg" />
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-semibold break-words text-slate-900">
          <span className="min-w-0 break-words">{item.name}</span>
          <StatusBadge status={status} />
        </p>
        {detail && <p className="text-xs text-slate-500">{detail}</p>}
      </div>
    </div>
  );
}

// Giá kèm đơn vị, ví dụ "150,000 VND" và dòng "per person".
export function PriceCell({ amount, unit }) {
  return (
    <>
      <MoneyCell amount={amount} />
      {unit && <p className="text-xs text-slate-500">{unit}</p>}
    </>
  );
}
