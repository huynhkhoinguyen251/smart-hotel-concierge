import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle.js';
import formatDate from '../../utils/formatDate.js';
import { isAwaitingPayment } from '../../utils/paymentHelpers.js';
import DetailLayout from '../detail/DetailLayout.jsx';
import { DetailPriceSection, DetailSection } from '../detail/DetailParts.jsx';
import PaymentPanel from '../payments/PaymentPanel.jsx';
import Button from '../ui/Button.jsx';

// Khung chung của 5 trang chi tiết đơn của khách (phòng, dịch vụ, đồ ăn, tour, vận chuyển).
// Đơn đang chờ thanh toán: khung thanh toán đứng ngay sau tiêu đề và "I have paid" là nút vàng duy nhất.
// Đã trả hoặc đã hủy: phần thanh toán nằm ở cột bên, dưới giá.
// - paymentType: room, service, food_order, tour, transport; onPaid, onExpired: xem PaymentPanel.
// - success, error: thông báo của useCancelAction.
// - price: { rows, total }; cancellation: { label, onCancel, children } hoặc không có khi không hủy được.
export default function OrderDetailLayout({
  order,
  title,
  createdLabel,
  paymentType,
  onPaid,
  onExpired,
  success,
  error,
  price,
  cancellation,
  main,
  ...props
}) {
  usePageTitle(title);
  const awaiting = isAwaitingPayment(order);
  const payment = <PaymentPanel type={paymentType} order={order} onPaid={onPaid} onExpired={onExpired} />;

  return (
    <div className="shell pt-6 pb-12 lg:pb-16">
      <DetailLayout
        {...props}
        title={title}
        titleClassName="text-2xl sm:text-3xl"
        status={order.status}
        meta={
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              {createdLabel} {formatDate(order.created_at, { withTime: true })}
            </span>
            <Link to="/support/new" className="font-medium text-sea hover:text-sea-hover hover:underline">
              Need help? Contact reception
            </Link>
          </p>
        }
        message={error ? { type: 'error', text: error } : { type: 'success', text: success }}
        lead={awaiting && payment}
        main={main}
        side={
          <>
            <DetailPriceSection {...price} />
            {!awaiting && payment}
            {cancellation && (
              <DetailSection title="Cancellation">
                <div className="text-sm text-ink-soft">{cancellation.children}</div>
                <Button variant="secondary" danger fullWidth className="mt-4" onClick={cancellation.onCancel}>
                  {cancellation.label}
                </Button>
              </DetailSection>
            )}
          </>
        }
      />
    </div>
  );
}
