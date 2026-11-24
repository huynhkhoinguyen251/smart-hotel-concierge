import { useEffect, useRef, useState } from 'react';
import { payOrder } from '../../api/payments.api.js';
import {
  COUNTDOWN_WARNING_SECONDS,
  getPaymentMethodLabel,
  PAYMENT_EXPIRED_MESSAGE,
  REQUEST_PAID_MESSAGE,
  ROOM_PAID_MESSAGE,
} from '../../config/payments.js';
import useCountdown from '../../hooks/useCountdown.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import { isAwaitingPayment, toDemoQrText, toPaymentBody } from '../../utils/paymentHelpers.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import DetailRow from '../ui/DetailRow.jsx';
import MoreLink from '../ui/MoreLink.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import PaymentQrCode from './PaymentQrCode.jsx';

// Thời gian chờ trước khi tải lại đơn khi hết giờ thanh toán.
const EXPIRED_RELOAD_DELAY_MS = 2000;

// Tên gọi của đơn trong câu "Pay to complete your ...".
const ORDER_NOUNS = { room: 'booking', service: 'request', food_order: 'order', tour: 'booking', transport: 'request' };

// Câu cho trình đọc màn hình: chỉ đổi mỗi phút (và lúc hết hạn), để không đọc mỗi giây.
const announceText = (secondsLeft, expired) => {
  if (expired) return PAYMENT_EXPIRED_MESSAGE;
  const minutes = Math.ceil(secondsLeft / 60);
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left to pay.`;
};

// Đơn đang chờ thanh toán: mã QR, đồng hồ đếm ngược và nút "I have paid".
function AwaitingPayment({ type, order, onPaid, onExpired }) {
  const { payment } = order;
  const { secondsLeft, expired: timeUp, label } = useCountdown(payment.seconds_left);
  const [expiredByServer, setExpiredByServer] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const expired = timeUp || expiredByServer;
  const notified = useRef(false);

  // Hết giờ: báo trang cha đúng một lần để tải lại đơn (server sẽ hủy đơn quá hạn).
  // Chờ một chút trước khi tải lại: đúng giây hết hạn, server có thể chưa coi đơn là quá hạn
  // (seconds_left đã là 0 nhưng đơn còn pending), nếu tải lại ngay sẽ lặp lại nhiều lần liên tục.
  // onExpired giữ trong ref, để trang cha render lại (hàm mới) không hủy hẹn giờ đang chờ.
  const onExpiredRef = useRef(onExpired);
  useEffect(() => {
    onExpiredRef.current = onExpired;
  });
  useEffect(() => {
    if (!expired || notified.current) return undefined;
    notified.current = true;
    const id = setTimeout(() => onExpiredRef.current(), EXPIRED_RELOAD_DELAY_MS);
    return () => clearTimeout(id);
  }, [expired]);

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      await payOrder(toPaymentBody(type, order.id));
      onPaid(type === 'room' ? ROOM_PAID_MESSAGE : REQUEST_PAID_MESSAGE);
    } catch (apiError) {
      if (apiError.status === 409) {
        // Đã thanh toán ở tab khác: tải lại để thấy trạng thái mới.
        onPaid('');
      } else if (apiError.status === 400 && /expired/i.test(apiError.message)) {
        setExpiredByServer(true);
      } else {
        setError(apiError.message);
      }
      setPaying(false);
    }
  };

  if (expired) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-danger">Payment time expired</h2>
        <p className="mt-1 text-sm text-ink" role="status">
          {PAYMENT_EXPIRED_MESSAGE}
        </p>
      </section>
    );
  }

  const urgent = secondsLeft <= COUNTDOWN_WARNING_SECONDS;
  return (
    // Điện thoại: số tiền, mã QR, rồi nút. Từ sm: mã QR ở cột trái, phần còn lại ở cột phải.
    <section
      aria-labelledby="payment-panel-title"
      className="grid gap-x-8 gap-y-4 sm:grid-cols-[14rem_minmax(0,26rem)] sm:grid-rows-[auto_1fr]"
    >
      <div className="min-w-0 sm:col-start-2">
        <h2 id="payment-panel-title" className="text-lg font-semibold text-ink">
          Pay to complete your {ORDER_NOUNS[type] ?? 'order'}
        </h2>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="text-2xl font-bold whitespace-nowrap text-ink">{formatCurrency(payment.amount)}</p>
          <p className={`font-semibold whitespace-nowrap tabular-nums ${urgent ? 'text-danger' : 'text-ink'}`}>
            Time left {label}
          </p>
        </div>
        <p className="sr-only" aria-live="polite">
          {announceText(secondsLeft, false)}
        </p>
      </div>

      <div className="flex justify-center sm:col-start-1 sm:row-span-2 sm:row-start-1">
        <PaymentQrCode text={toDemoQrText(type, order.id, payment)} />
      </div>

      <div className="flex min-w-0 flex-col gap-4 sm:col-start-2">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink">
          <li>Scan the QR code with your e-wallet app.</li>
          <li>Click &quot;I have paid&quot;.</li>
        </ol>
        <Button fullWidth loading={paying} onClick={handlePay}>
          I have paid
        </Button>
        <div aria-live="polite" className="-mt-4 not-empty:mt-0">
          <Alert type="error">{error}</Alert>
        </div>
        {payment.expires_at && (
          <p className="text-xs text-ink-soft">
            Pay before {formatDate(payment.expires_at, { withTime: true })}. Unpaid orders are cancelled
            automatically.
          </p>
        )}
      </div>
    </section>
  );
}

// Thanh toán đã trả hoặc đã hoàn tiền: số tiền, ngày trả, số hóa đơn và link xem hóa đơn.
function PaidPayment({ payment }) {
  const refunded = payment.status === 'refunded';
  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-ink">Payment</h2>
        <StatusBadge status={payment.status} />
      </div>
      {refunded && (
        <p className="mt-1 text-sm text-ink-soft">This order was cancelled, so the payment was refunded.</p>
      )}
      <dl className="mt-2 text-sm">
        <DetailRow label="Amount">{formatCurrency(payment.amount)}</DetailRow>
        <DetailRow label="Paid on">{formatDate(payment.paid_at, { withTime: true }) || '-'}</DetailRow>
        <DetailRow label="Method">{getPaymentMethodLabel(payment.method)}</DetailRow>
        <DetailRow label="Invoice">{payment.invoice_number ?? '-'}</DetailRow>
      </dl>
      {payment.invoice_number && (
        <MoreLink to={`/payments/${payment.id}/invoice`} className="mt-2">
          View invoice
        </MoreLink>
      )}
    </section>
  );
}

// Khung thanh toán QR ở trang chi tiết đơn của khách.
// - type: room, service, food_order, tour, transport; order: đơn có object payment (mục 11 của docs/api.md).
// - onPaid(message): trang cha tải lại đơn và hiện message (rỗng thì không hiện).
// - onExpired(): trang cha tải lại đơn; server hủy đơn quá hạn khi nhận request.
// Đơn cũ không có thanh toán (payment null) thì không hiện gì.
export default function PaymentPanel({ type, order, onPaid, onExpired }) {
  const { payment } = order;
  if (!payment) return null;
  if (isAwaitingPayment(order)) {
    // key theo seconds_left: mỗi lần tải lại đơn thì đếm lại và có thể báo hết hạn lại.
    return (
      <AwaitingPayment
        key={`${payment.id}:${payment.seconds_left}`}
        type={type}
        order={order}
        onPaid={onPaid}
        onExpired={onExpired}
      />
    );
  }
  if (payment.status === 'paid' || payment.status === 'refunded') {
    return <PaidPayment payment={payment} />;
  }
  if (order.status === 'cancelled') {
    return (
      <section>
        <h2 className="mb-2 text-lg font-semibold text-ink">Payment</h2>
        <p className="text-sm text-ink-soft">This order was cancelled before it was paid. Nothing was charged.</p>
      </section>
    );
  }
  return null;
}
