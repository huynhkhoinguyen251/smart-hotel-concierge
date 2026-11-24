import { FieldTimeOutlined } from '@ant-design/icons';
import { COUNTDOWN_WARNING_SECONDS } from '../../config/payments.js';
import useCountdown from '../../hooks/useCountdown.js';
import { isAwaitingPayment } from '../../utils/paymentHelpers.js';
import ButtonLink from '../ui/ButtonLink.jsx';

// "Awaiting payment · 12:34 left" và nút "Pay now" trên dòng đơn ở các trang "My ...".
// to: trang chi tiết đơn (nơi có mã QR). Đơn không chờ thanh toán thì không hiện gì.
export default function AwaitingPaymentNote({ order, to, title }) {
  const waiting = isAwaitingPayment(order);
  const { secondsLeft, label, expired } = useCountdown(waiting ? order.payment.seconds_left : null);
  if (!waiting) return null;
  const urgent = expired || secondsLeft <= COUNTDOWN_WARNING_SECONDS;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <p
        className={`flex items-center gap-1.5 font-semibold tabular-nums ${urgent ? 'text-danger' : 'text-warning-deep'}`}
      >
        <FieldTimeOutlined aria-hidden="true" />
        {expired ? 'Payment time expired' : `Awaiting payment · ${label} left`}
      </p>
      {!expired && (
        <ButtonLink to={to} variant="secondary" aria-label={`Pay now: ${title}`}>
          Pay now
        </ButtonLink>
      )}
    </div>
  );
}
