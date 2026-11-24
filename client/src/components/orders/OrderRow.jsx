import formatCurrency from '../../utils/formatCurrency.js';
import AwaitingPaymentNote from '../payments/AwaitingPaymentNote.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import RowLink from '../ui/RowLink.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

// Một dòng của danh sách đơn, dùng chung cho 5 loại đơn. Bấm đâu trong dòng cũng mở trang chi tiết,
// nhưng với bàn phím chỉ có một link (tiêu đề), cộng nút "Pay now" khi đơn chờ thanh toán.
// - photo: { src, alt } khi API có ảnh. reference: dòng phụ ("Room 301 · Booking #3").
// - facts: các dòng thông tin chính; dòng rỗng bị bỏ.
export default function OrderRow({ order, to, title, photo, reference, facts }) {
  const body = (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h2 className="min-w-0 text-lg font-semibold wrap-anywhere">
          <RowLink to={to}>{title}</RowLink>
        </h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-0.5 text-sm wrap-anywhere text-ink-soft">{reference}</p>
      <div className="mt-2 space-y-0.5 text-sm wrap-anywhere text-ink">
        {facts.filter(Boolean).map((fact, index) => (
          <p key={index}>{fact}</p>
        ))}
      </div>
      <div className="relative z-10 w-fit">
        <AwaitingPaymentNote order={order} to={to} title={title} />
      </div>
    </div>
  );

  return (
    <li className="group relative grid gap-x-8 gap-y-3 p-4 transition-colors duration-150 hover:bg-ground sm:grid-cols-[minmax(0,1fr)_auto] lg:px-5 lg:py-5">
      {photo ? (
        <div className="grid min-w-0 grid-cols-[6rem_minmax(0,1fr)] gap-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5">
          <PhotoFrame src={photo.src} alt={photo.alt} className="aspect-[4/3] self-start" />
          {body}
        </div>
      ) : (
        body
      )}
      <p className={`text-lg font-bold whitespace-nowrap text-ink sm:pl-0 sm:text-right ${photo ? 'pl-28' : ''}`}>
        <span className="sr-only">Total: </span>
        {formatCurrency(order.total_price)}
      </p>
    </li>
  );
}
