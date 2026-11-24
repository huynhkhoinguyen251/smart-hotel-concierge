import { useState } from 'react';
import { getAdminPayments, refundAdminPayment } from '../../api/adminPayments.api.js';
import {
  BadgesCell,
  CellLink,
  EmptyCell,
  GuestCell,
  MoneyCell,
  StackCell,
  TitleCell,
} from '../../components/admin/AdminCells.jsx';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import RowActions from '../../components/admin/RowActions.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { getPaymentMethodLabel, PAYMENT_STATUS_TABS, REFUND_CONFIRM_MESSAGE } from '../../config/payments.js';
import { getReviewType, REVIEW_TYPE_OPTIONS } from '../../config/reviews.js';
import formatDate from '../../utils/formatDate.js';

const TYPE_FILTER = { name: 'type', label: 'Order type', options: REVIEW_TYPE_OPTIONS };

const itemLabel = (payment) => `payment #${payment.id}`;

// Thanh toán không có trang riêng; đơn của nó mở được từ cột Order.
const COLUMNS = [
  {
    key: 'payment',
    header: 'Payment',
    render: (payment) => (
      <TitleCell title={`Payment #${payment.id}`} detail={getPaymentMethodLabel(payment.method)} />
    ),
  },
  {
    key: 'guest',
    header: 'Guest',
    wide: true,
    render: (payment) => <GuestCell user={payment.user} to={`/admin/users/${payment.user.id}`} />,
  },
  {
    key: 'order',
    header: 'Order',
    wide: true,
    render: (payment) => {
      const type = getReviewType(payment.target.type);
      return (
        <>
          <p>
            {type ? (
              <CellLink to={type.adminPath(payment.target.id)}>{payment.target.name}</CellLink>
            ) : (
              payment.target.name
            )}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            {type?.label ?? payment.target.type}
            <StatusBadge status={payment.order_status} />
          </p>
        </>
      );
    },
  },
  { key: 'amount', header: 'Amount', align: 'right', render: (payment) => <MoneyCell amount={payment.amount} /> },
  {
    key: 'dates',
    header: 'Created / paid',
    render: (payment) => (
      <StackCell
        main={<span className="lg:whitespace-nowrap">{formatDate(payment.created_at, { withTime: true })}</span>}
        detail={payment.paid_at ? `Paid ${formatDate(payment.paid_at, { withTime: true })}` : 'Not paid'}
      />
    ),
  },
  {
    key: 'invoice',
    header: 'Invoice',
    render: (payment) =>
      payment.invoice_number ? (
        <span className="lg:whitespace-nowrap">{payment.invoice_number}</span>
      ) : (
        <EmptyCell />
      ),
  },
  { key: 'status', header: 'Status', badges: true, render: (payment) => <BadgesCell status={payment.status} /> },
];

// "Mark as refunded": chỉ hiện khi thanh toán paid và đơn đã cancelled (lưới an toàn; bình thường
// hủy đơn đã trả thì backend tự hoàn tiền). Lỗi của server hiện ở đầu trang.
function RefundAction({ payment, onSuccess, onError }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    try {
      const updated = await refundAdminPayment(payment.id);
      onSuccess(updated, `Payment #${payment.id} has been marked as refunded.`);
    } catch (apiError) {
      onError(apiError.message);
    } finally {
      setSaving(false);
      setOpen(false);
    }
  };

  return (
    <>
      <RowActions
        itemLabel={itemLabel(payment)}
        items={[{ key: 'refund', label: 'Mark as refunded', danger: true, onClick: () => setOpen(true) }]}
      />
      <ConfirmDialog
        open={open}
        title={`Refund payment #${payment.id}?`}
        message={REFUND_CONFIRM_MESSAGE}
        confirmLabel="Yes, mark as refunded"
        cancelLabel="Go back"
        variant="danger"
        loading={saving}
        onConfirm={confirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

// /admin/payments: mọi thanh toán QR, mới nhất trước. Trạng thái, loại đơn và trang nằm trên địa chỉ trang.
export default function AdminPaymentsPage() {
  return (
    <AdminRequestListPage
      title="Payments"
      subtitle="Simulated QR payments of all orders, newest first. No real money is moved."
      basePath="/admin/payments"
      statusTabs={PAYMENT_STATUS_TABS}
      filters={[TYPE_FILTER]}
      load={getAdminPayments}
      emptyNoun="payments"
      table={{
        caption: 'Payments',
        columns: COLUMNS,
        getItemLabel: itemLabel,
        renderActions: (payment, { onSuccess, onError }) =>
          payment.status === 'paid' && payment.order_status === 'cancelled' ? (
            <RefundAction payment={payment} onSuccess={onSuccess} onError={onError} />
          ) : null,
      }}
    />
  );
}
