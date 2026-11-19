import { Link, useNavigate, useParams } from 'react-router-dom';
import { getInvoice } from '../api/payments.api.js';
import Button from '../components/ui/Button.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { getPaymentMethodLabel, HOTEL_ADDRESS, HOTEL_NAME } from '../config/payments.js';
import { getReviewType } from '../config/reviews.js';
import useFetch from '../hooks/useFetch.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import { formatUnitQuantity } from '../utils/paymentHelpers.js';

function SummaryRow({ label, children, strong = false }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 ${strong ? 'text-base font-bold text-slate-900' : 'text-slate-700'}`}>
      <dt>{label}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  );
}

function Invoice({ invoice }) {
  const navigate = useNavigate();
  const type = getReviewType(invoice.order.type);
  const refunded = invoice.payment.status === 'refunded';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 print:max-w-none print:p-0">
      <div className="mb-4 flex flex-wrap gap-2 print:hidden">
        <Button onClick={() => window.print()}>Print</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 print:rounded-none print:border-0 print:p-0 print:text-black print:shadow-none">
        {refunded && (
          <p
            className="pointer-events-none absolute top-6 right-4 rotate-12 rounded-lg border-4 border-red-600 px-3 py-1 text-2xl font-black tracking-widest text-red-600 opacity-80 sm:right-8"
            aria-label="This payment was refunded"
          >
            REFUNDED
          </p>
        )}

        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:justify-between">
          <div>
            <p className="text-lg font-bold text-teal-800 print:text-black">{HOTEL_NAME}</p>
            <p className="text-sm text-slate-500 print:text-black">{HOTEL_ADDRESS}</p>
          </div>
          <div className="sm:text-right">
            <h1 className="text-2xl font-bold text-slate-900">Invoice</h1>
            <p className="text-sm text-slate-700">{invoice.invoice_number}</p>
            <p className="text-sm text-slate-500 print:text-black">
              Issued {formatDate(invoice.issued_at, { withTime: true })}
            </p>
            <div className="mt-1 print:hidden">
              <StatusBadge status={invoice.payment.status} />
            </div>
            <p className="hidden text-sm print:block">Status: {invoice.payment.status}</p>
          </div>
        </header>

        <section className="grid gap-4 border-b border-slate-200 py-5 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 print:text-black">Billed to</h2>
            <p className="mt-1 font-semibold text-slate-900">{invoice.guest.full_name}</p>
            <p className="break-all text-slate-700">{invoice.guest.email}</p>
            {invoice.guest.phone && <p className="text-slate-700">{invoice.guest.phone}</p>}
          </div>
          <div className="min-w-0 sm:text-right">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 print:text-black">
              {type?.label ?? 'Order'}
            </h2>
            {type ? (
              <Link
                to={type.detailPath(invoice.order.id)}
                className="mt-1 block font-semibold wrap-anywhere text-teal-700 hover:text-teal-800 print:text-black"
              >
                {invoice.order.name}
              </Link>
            ) : (
              <p className="mt-1 font-semibold text-slate-900">{invoice.order.name}</p>
            )}
            <p className="text-slate-500 print:text-black">Order #{invoice.order.id}</p>
          </div>
        </section>

        {/* Bảng các dòng: cuộn ngang bên trong khung riêng, nên trang không bị cuộn ngang ở 375px. */}
        <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="mt-4 w-full min-w-[30rem] text-sm">
            <caption className="sr-only">Invoice lines</caption>
            <thead className="border-b border-slate-200 text-left text-slate-500 print:text-black">
              <tr>
                <th scope="col" className="py-2 pr-3 font-medium">Description</th>
                <th scope="col" className="py-2 pr-3 font-medium">Quantity</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">Unit price</th>
                <th scope="col" className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.lines.map((line, index) => (
                <tr key={index} className="align-top">
                  <td className="py-2 pr-3">
                    <p className="font-medium text-slate-900">{line.description}</p>
                    {line.detail && <p className="text-xs text-slate-500 print:text-black">{line.detail}</p>}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap text-slate-700">{formatUnitQuantity(line.quantity, line.unit)}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap text-slate-700">{formatCurrency(line.unit_price)}</td>
                  <td className="py-2 text-right whitespace-nowrap font-medium text-slate-900">{formatCurrency(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 ml-auto max-w-xs border-t border-slate-200 pt-3 text-sm">
          <SummaryRow label="Subtotal">{formatCurrency(invoice.subtotal)}</SummaryRow>
          {invoice.discount > 0 && <SummaryRow label="Discount">- {formatCurrency(invoice.discount)}</SummaryRow>}
          <SummaryRow label="Total" strong>
            {formatCurrency(invoice.total)}
          </SummaryRow>
        </dl>

        <p className="mt-6 text-sm text-slate-600 print:text-black">
          Paid by {invoice.payment.method === 'e_wallet' ? 'e-wallet' : getPaymentMethodLabel(invoice.payment.method)}{' '}
          (simulated QR) on{' '}
          {formatDate(invoice.payment.paid_at, { withTime: true })}.
          {refunded && ' This payment was refunded because the order was cancelled.'}
        </p>
      </article>
    </div>
  );
}

// /payments/:id/invoice: hóa đơn in được của một thanh toán của tôi.
// 403 (của người khác) hiện giống 404. 404 của thanh toán chưa trả có thông báo riêng.
export default function InvoicePage() {
  const { id } = useParams();
  const request = useFetch(() => getInvoice(id), ['invoice', id]);

  if (request.loading) return <PageSpinner />;
  if (request.error) {
    const { status, message } = request.error;
    if ([400, 403, 404].includes(status)) {
      const unpaid = status === 404 && /not been paid/i.test(message);
      return (
        <NotFoundView
          title="Invoice not found"
          message={unpaid ? 'This order has not been paid yet.' : 'This invoice does not exist or does not belong to you.'}
          to="/my-payments"
          linkLabel="Back to my payments"
        />
      );
    }
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={message} onRetry={request.retry} />
      </div>
    );
  }
  return <Invoice invoice={request.data} />;
}
