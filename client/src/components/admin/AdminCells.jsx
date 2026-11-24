import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency.js';
import { PaymentBadge } from '../payments/PaymentInfoCard.jsx';
import RoomImage from '../rooms/RoomImage.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

// Các ô dùng chung trong danh sách của admin.

const LINK = 'font-semibold text-sea underline-offset-2 hover:text-sea-hover hover:underline';

export function CellLink({ to, label, children }) {
  return (
    <Link to={to} aria-label={label} className={LINK}>
      {children}
    </Link>
  );
}

// Ô đầu tiên (cũng là tiêu đề của khối trên điện thoại): tên mục dẫn tới trang chi tiết và một dòng phụ.
// link: { to, label } do AdminRequestTable truyền vào; không có thì tên chỉ là chữ.
export function TitleCell({ title, detail, marker, link }) {
  return (
    <div>
      <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
        {marker}
        {link ? (
          <CellLink to={link.to} label={link.label}>
            {title}
          </CellLink>
        ) : (
          title
        )}
      </p>
      {detail && <p className="mt-0.5 text-xs text-ink-soft">{detail}</p>}
    </div>
  );
}

// Hai dòng: giá trị chính và một dòng phụ nhỏ.
export function StackCell({ main, detail }) {
  return (
    <>
      <p className="text-ink">{main}</p>
      {detail && <p className="text-xs text-ink-soft">{detail}</p>}
    </>
  );
}

// Email dài bị cắt ở giữa ký tự, nên dùng wrap-anywhere thay vì cho tràn.
export function GuestCell({ user, to }) {
  const name = user?.full_name ?? '-';
  return (
    <>
      <p className="font-medium text-ink">{to ? <CellLink to={to}>{name}</CellLink> : name}</p>
      {user?.email && <p className="text-xs wrap-anywhere text-ink-soft">{user.email}</p>}
    </>
  );
}

// Nhãn trạng thái của đơn và của thanh toán: trong bảng xếp dọc để cột hẹp lại. payment undefined: không có nhãn thanh toán.
export function BadgesCell({ status, payment }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 lg:flex-col lg:items-start lg:gap-1">
      <StatusBadge status={status} />
      {payment !== undefined && <PaymentBadge payment={payment} />}
    </span>
  );
}

export function MoneyCell({ amount }) {
  return <span className="font-semibold whitespace-nowrap text-ink">{formatCurrency(amount)}</span>;
}

// Ô đầu của danh mục (dịch vụ, món ăn, tour): ảnh nhỏ và tên.
export function CatalogItemCell({ item }) {
  return (
    <div className="flex items-start gap-3">
      <RoomImage src={item.image_url} alt={item.name} className="h-12 w-16 shrink-0 rounded-control" />
      <p className="min-w-0 font-semibold wrap-anywhere text-ink">{item.name}</p>
    </div>
  );
}

// Giá kèm đơn vị, ví dụ "150,000 VND" và dòng "per person".
export function PriceCell({ amount, unit }) {
  return (
    <>
      <MoneyCell amount={amount} />
      {unit && <p className="text-xs text-ink-soft">{unit}</p>}
    </>
  );
}

// Giá trị trống trong bảng.
export function EmptyCell({ children = '-' }) {
  return <span className="text-ink-soft">{children}</span>;
}
