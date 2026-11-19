import { Link } from 'react-router-dom';
import useCountdown from '../../hooks/useCountdown.js';
import { isAwaitingPayment } from '../../utils/paymentHelpers.js';

// Nhãn "Awaiting payment · 12:34 left" và link "Pay now" trên thẻ đơn ở các trang "My ...".
// to: trang chi tiết đơn (nơi có mã QR). Đơn không chờ thanh toán thì không hiện gì.
export default function AwaitingPaymentNote({ order, to }) {
  const waiting = isAwaitingPayment(order);
  const { label, expired } = useCountdown(waiting ? order.payment.seconds_left : null);
  if (!waiting) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 ring-inset">
        {expired ? 'Payment time expired' : `Awaiting payment · ${label} left`}
      </span>
      {!expired && (
        <Link to={to} className="font-semibold text-teal-700 hover:text-teal-800">
          Pay now →
        </Link>
      )}
    </div>
  );
}
