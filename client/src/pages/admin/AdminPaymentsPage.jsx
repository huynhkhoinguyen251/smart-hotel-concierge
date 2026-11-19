import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminPayments, refundAdminPayment } from '../../api/adminPayments.api.js';
import { MoneyCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { getPaymentMethodLabel, PAYMENT_STATUS_TABS, REFUND_CONFIRM_MESSAGE } from '../../config/payments.js';
import { getReviewType, REVIEW_TYPE_OPTIONS } from '../../config/reviews.js';
import formatDate from '../../utils/formatDate.js';

const LINK = 'font-medium text-teal-700 hover:text-teal-800';

const TYPE_FILTER = { name: 'type', label: 'Order type', options: REVIEW_TYPE_OPTIONS };

const itemLabel = (payment) => `payment #${payment.id}`;

const COLUMNS = [
  {
    key: 'payment',
    header: 'Payment',
    render: (payment) => (
      <TitleCell
        status={payment.status}
        title={`Payment #${payment.id}`}
        detail={getPaymentMethodLabel(payment.method)}
      />
    ),
  },
  {
    key: 'guest',
    header: 'Guest',
    render: (payment) => (
      <>
        <Link to={`/admin/users/${payment.user.id}`} className={`${LINK} break-words`}>
          {payment.user.full_name}
        </Link>
        <p className="text-xs break-all text-slate-500">{payment.user.email}</p>
      </>
    ),
  },
  {
    key: 'order',
    header: 'Order',
    render: (payment) => {
      const type = getReviewType(payment.target.type);
      return (
        <>
          <p className="text-xs text-slate-500">{type?.label ?? payment.target.type}</p>
          {type ? (
            <Link to={type.adminPath(payment.target.id)} className={`${LINK} break-words`}>
              {payment.target.name}
            </Link>
          ) : (
            <p>{payment.target.name}</p>
          )}
          <div className="mt-1">
            <StatusBadge status={payment.order_status} />
          </div>
        </>
      );
    },
  },
  { key: 'amount', header: 'Amount', align: 'right', render: (payment) => <MoneyCell amount={payment.amount} /> },
  {
    key: 'dates',
    header: 'Created / paid',
    render: (payment) => (
      <>
        <p className="whitespace-nowrap text-slate-900">{formatDate(payment.created_at, { withTime: true })}</p>
        <p className="text-xs whitespace-nowrap text-slate-500">
          {payment.paid_at ? `Paid ${formatDate(payment.paid_at, { withTime: true })}` : 'Not paid'}
        </p>
      </>
    ),
  },
  { key: 'invoice', header: 'Invoice', render: (payment) => payment.invoice_number ?? <span className="text-slate-400">-</span> },
];

// Nút "Mark as refunded": chỉ hiện khi thanh toán paid và đơn đã cancelled (lưới an toàn; bình thường
// hủy đơn đã trả thì backend tự hoàn tiền). Lỗi của server hiện ở đầu trang.
function RefundButton({ payment, onSuccess, onError }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  if (payment.status !== 'paid' || payment.order_status !== 'cancelled') return null;

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
      <Button size="sm" variant="danger" aria-label={`Mark payment #${payment.id} as refunded`} onClick={() => setOpen(true)}>
        Mark as refunded
      </Button>
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
        renderActions: (payment, actionProps) => (
          <RefundButton payment={payment} onSuccess={actionProps.onSuccess} onError={actionProps.onError} />
        ),
      }}
    />
  );
}
