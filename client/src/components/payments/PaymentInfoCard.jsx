import { getPaymentMethodLabel, WAITING_FOR_PAYMENT } from '../../config/payments.js';
import useCountdown from '../../hooks/useCountdown.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import { isAwaitingPayment } from '../../utils/paymentHelpers.js';
import Card from '../ui/Card.jsx';
import DetailRow from '../ui/DetailRow.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

// Khung "Payment" ở trang chi tiết đơn của admin: trạng thái, số tiền, phương thức, ngày trả,
// số hóa đơn, và thời gian còn lại khi khách chưa trả. Đơn cũ không có thanh toán thì ghi "No payment".
export default function PaymentInfoCard({ order }) {
  const { payment } = order;
  const waiting = isAwaitingPayment(order);
  const { label } = useCountdown(waiting ? payment.seconds_left : null);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
        {payment && <StatusBadge status={payment.status} />}
      </div>
      {payment ? (
        <dl className="mt-2 divide-y divide-slate-100 text-sm">
          <DetailRow label="Amount">{formatCurrency(payment.amount)}</DetailRow>
          <DetailRow label="Method">{getPaymentMethodLabel(payment.method)}</DetailRow>
          <DetailRow label="Paid at">{formatDate(payment.paid_at, { withTime: true }) || '-'}</DetailRow>
          <DetailRow label="Invoice">{payment.invoice_number ?? '-'}</DetailRow>
          {waiting && (
            <DetailRow label="Time left">
              <span className="tabular-nums">{label}</span>
            </DetailRow>
          )}
        </dl>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No payment for this order (created before QR payments).</p>
      )}
      {waiting && <p className="mt-2 text-xs text-amber-700">{WAITING_FOR_PAYMENT}. The guest has not paid yet.</p>}
    </Card>
  );
}

// Nhãn thanh toán nhỏ trong danh sách của admin.
export function PaymentBadge({ payment }) {
  return payment ? <StatusBadge status={payment.status} /> : <span className="text-xs text-slate-400">No payment</span>;
}
