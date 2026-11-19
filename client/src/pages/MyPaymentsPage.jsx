import { Link } from 'react-router-dom';
import { getMyPayments } from '../api/payments.api.js';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadError from '../components/ui/LoadError.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { getPaymentMethodLabel, MY_PAYMENTS_PAGE_SIZE } from '../config/payments.js';
import { getReviewType } from '../config/reviews.js';
import useFetch from '../hooks/useFetch.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';

// Một thanh toán: loại và tên đơn (link đến chi tiết đơn), số tiền, trạng thái, ngày trả, hóa đơn.
function PaymentCard({ payment }) {
  const type = getReviewType(payment.target?.type);
  const hasInvoice = Boolean(payment.invoice_number);

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          {type?.label ?? payment.target?.type}
        </p>
        {type ? (
          <Link
            to={type.detailPath(payment.target.id)}
            className="mt-0.5 block font-semibold wrap-anywhere text-slate-900 hover:text-teal-700"
          >
            {payment.target.name}
          </Link>
        ) : (
          <p className="mt-0.5 font-semibold wrap-anywhere text-slate-900">{payment.target?.name}</p>
        )}
        <p className="mt-1 text-sm text-slate-500">
          Payment #{payment.id} · {getPaymentMethodLabel(payment.method)}
          {payment.paid_at && <> · Paid {formatDate(payment.paid_at, { withTime: true })}</>}
        </p>
        {hasInvoice && <p className="text-sm text-slate-500">Invoice {payment.invoice_number}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 md:flex-col md:items-end">
        <div className="flex items-center gap-2">
          <StatusBadge status={payment.status} />
          <p className="text-lg font-bold text-teal-700">{formatCurrency(payment.amount)}</p>
        </div>
        {hasInvoice && (
          <Link
            to={`/payments/${payment.id}/invoice`}
            aria-label={`View invoice ${payment.invoice_number}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View invoice
          </Link>
        )}
      </div>
    </article>
  );
}

// /my-payments: thanh toán QR của tôi, mới nhất trước. Trang hiện tại nằm trên địa chỉ trang.
export default function MyPaymentsPage() {
  const { page, goToPage } = useUrlFilters({});
  const list = useFetch(() => getMyPayments({ page, limit: MY_PAYMENTS_PAGE_SIZE }), ['my-payments', page]);

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) return <LoadError error={list.error} onRetry={list.retry} />;
    if (list.data.items.length === 0) {
      return (
        <EmptyState
          title="No payments yet"
          message="When you book a room or order a service, its QR payment appears here."
        />
      );
    }
    return (
      <>
        <div className="space-y-4">
          {list.data.items.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
        <Pagination
          className="mt-8"
          page={page}
          limit={MY_PAYMENTS_PAGE_SIZE}
          total={list.data.pagination?.total ?? 0}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageTitle title="My payments" subtitle="Your QR payments and invoices, newest first." />
      {renderList()}
    </div>
  );
}
