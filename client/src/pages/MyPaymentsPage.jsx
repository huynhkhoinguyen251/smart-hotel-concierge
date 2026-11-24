import { Link } from 'react-router-dom';
import { getMyPayments } from '../api/payments.api.js';
import AccountListPage from '../components/layout/AccountListPage.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { getPaymentMethodLabel, MY_PAYMENTS_PAGE_SIZE } from '../config/payments.js';
import { getReviewType } from '../config/reviews.js';
import useFetch from '../hooks/useFetch.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';

// Một thanh toán: tên đơn (link đến chi tiết đơn) và loại, trạng thái, ngày trả, số tiền, hóa đơn.
function PaymentRow({ payment }) {
  const type = getReviewType(payment.target?.type);
  const hasInvoice = Boolean(payment.invoice_number);

  return (
    <li className="grid gap-x-8 gap-y-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] lg:px-5 lg:py-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h2 className="min-w-0 text-lg font-semibold wrap-anywhere text-ink">
            {type ? (
              <Link to={type.detailPath(payment.target.id)} className="text-sea hover:text-sea-hover hover:underline">
                {payment.target.name}
              </Link>
            ) : (
              payment.target?.name
            )}
          </h2>
          <StatusBadge status={payment.status} />
        </div>
        <p className="mt-0.5 text-sm text-ink-soft">
          {type?.label ?? payment.target?.type} · Payment #{payment.id}
        </p>
        <p className="mt-2 text-sm text-ink">
          {getPaymentMethodLabel(payment.method)}
          {payment.paid_at && <> · Paid {formatDate(payment.paid_at, { withTime: true })}</>}
        </p>
        {hasInvoice && <p className="mt-0.5 text-sm text-ink">Invoice {payment.invoice_number}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
        <p className="text-lg font-bold whitespace-nowrap text-ink">{formatCurrency(payment.amount)}</p>
        {hasInvoice && (
          <ButtonLink
            to={`/payments/${payment.id}/invoice`}
            variant="secondary"
            aria-label={`View invoice ${payment.invoice_number}`}
          >
            View invoice
          </ButtonLink>
        )}
      </div>
    </li>
  );
}

// /my-payments: thanh toán QR của tôi, mới nhất trước. Trang hiện tại nằm trên địa chỉ trang.
export default function MyPaymentsPage() {
  const { page, goToPage } = useUrlFilters({});
  const list = useFetch(() => getMyPayments({ page, limit: MY_PAYMENTS_PAGE_SIZE }), ['my-payments', page]);

  return (
    <AccountListPage
      title="My payments"
      subtitle="Your QR payments and invoices, newest first."
      list={list}
      items={list.data?.items}
      empty={{
        title: 'No payments yet',
        message: 'When you book a room or order a service, its QR payment appears here.',
        action: <ButtonLink to="/rooms">Find a room</ButtonLink>,
      }}
      pagination={{
        page,
        limit: MY_PAYMENTS_PAGE_SIZE,
        total: list.data?.pagination?.total ?? 0,
        onPageChange: goToPage,
      }}
      listLabel="Payments"
      renderItem={(payment) => <PaymentRow key={payment.id} payment={payment} />}
    />
  );
}
