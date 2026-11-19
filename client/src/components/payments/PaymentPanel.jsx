import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
import Card from '../ui/Card.jsx';
import DetailRow from '../ui/DetailRow.jsx';
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
      <Card className="border-red-200 bg-red-50">
        <h2 className="text-lg font-semibold text-red-800">Payment time expired</h2>
        <p className="mt-1 text-sm text-red-700" role="status">
          {PAYMENT_EXPIRED_MESSAGE}
        </p>
      </Card>
    );
  }

  const urgent = secondsLeft <= COUNTDOWN_WARNING_SECONDS;
  return (
    <section
      aria-labelledby="payment-panel-title"
      className="rounded-2xl border-2 border-teal-300 bg-teal-50/40 p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="payment-panel-title" className="text-lg font-semibold text-slate-900">
            Pay to complete your {ORDER_NOUNS[type] ?? 'order'}
          </h2>
          <p className="mt-1 text-2xl font-bold text-teal-700">{formatCurrency(payment.amount)}</p>
        </div>
        <p
          className={`rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${
            urgent ? 'bg-red-100 text-red-700' : 'bg-white text-slate-700 ring-1 ring-slate-200'
          }`}
        >
          Time left {label}
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {announceText(secondsLeft, false)}
      </p>

      <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <PaymentQrCode text={toDemoQrText(type, order.id, payment)} />
        <div className="w-full min-w-0 space-y-3 text-sm text-slate-700">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Scan the QR code with your e-wallet app.</li>
            <li>Click &quot;I have paid&quot;.</li>
          </ol>
          {payment.expires_at && (
            <p className="text-xs text-slate-500">
              Pay before {formatDate(payment.expires_at, { withTime: true })}. Unpaid orders are cancelled
              automatically.
            </p>
          )}
          <Button fullWidth loading={paying} onClick={handlePay}>
            I have paid
          </Button>
          <div aria-live="polite">
            <Alert type="error">{error}</Alert>
          </div>
        </div>
      </div>
    </section>
  );
}

// Thanh toán đã trả hoặc đã hoàn tiền: số tiền, ngày trả, số hóa đơn và link xem hóa đơn.
function PaidPayment({ payment }) {
  const refunded = payment.status === 'refunded';
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{refunded ? 'Refunded' : 'Paid'}</h2>
        <StatusBadge status={payment.status} />
      </div>
      {refunded && (
        <p className="mt-1 text-sm text-slate-600">This order was cancelled, so the payment was refunded.</p>
      )}
      <dl className="mt-2 divide-y divide-slate-100 text-sm">
        <DetailRow label="Amount">{formatCurrency(payment.amount)}</DetailRow>
        <DetailRow label="Paid on">{formatDate(payment.paid_at, { withTime: true }) || '-'}</DetailRow>
        <DetailRow label="Method">{getPaymentMethodLabel(payment.method)}</DetailRow>
        <DetailRow label="Invoice">{payment.invoice_number ?? '-'}</DetailRow>
      </dl>
      {payment.invoice_number && (
        <Link
          to={`/payments/${payment.id}/invoice`}
          className="mt-3 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          View invoice →
        </Link>
      )}
    </Card>
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
      <Card>
        <p className="text-sm text-slate-600">This order was cancelled before it was paid. Nothing was charged.</p>
      </Card>
    );
  }
  return null;
}
