import { Link, useNavigate, useParams } from 'react-router-dom';
import { getInvoice } from '../api/payments.api.js';
import Button from '../components/ui/Button.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { getPaymentMethodLabel, HOTEL_ADDRESS, HOTEL_NAME } from '../config/payments.js';
import { getReviewType } from '../config/reviews.js';
import { getStatusConfig } from '../config/statuses.js';
import { getDiscountLabel } from '../config/vouchers.js';
import useFetch from '../hooks/useFetch.js';
import usePageTitle from '../hooks/usePageTitle.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import { formatUnitQuantity } from '../utils/paymentHelpers.js';

function SummaryRow({ label, children, strong = false }) {
  return (
    <div
      className={`flex justify-between gap-6 ${
        strong ? 'mt-2 border-t border-ink pt-3 text-lg font-bold' : 'py-1'
      }`}
    >
      <dt>{label}</dt>
      <dd className="text-right whitespace-nowrap">{children}</dd>
    </div>
  );
}

// Tờ hóa đơn: một trang trắng, chữ mực, chỉ có đường kẻ mảnh. Khi in: chữ đen trên nền trắng, hết khổ A4.
function Invoice({ invoice }) {
  const navigate = useNavigate();
  const type = getReviewType(invoice.order.type);
  const { payment } = invoice;
  const refunded = payment.status === 'refunded';
  usePageTitle(`Invoice ${invoice.invoice_number}`);

  return (
    <div className="bg-ground px-4 py-8 lg:py-12 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl print:max-w-none">
        <div className="mb-4 flex flex-wrap gap-3 print:hidden">
          <Button onClick={() => window.print()}>Print</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <article className="rounded-panel border border-line-soft bg-white p-5 text-ink sm:p-10 print:rounded-none print:border-0 print:p-0 print:text-black">
          <header className="flex flex-col gap-x-8 gap-y-5 border-b border-ink pb-6 sm:flex-row sm:justify-between">
            <div>
              <p className="text-lg font-bold">{HOTEL_NAME}</p>
              <p className="text-sm">{HOTEL_ADDRESS}</p>
            </div>
            <div className="sm:text-right">
              <h1 className="text-2xl font-bold tracking-tight">Invoice</h1>
              <p className="text-sm font-semibold">{invoice.invoice_number}</p>
              <p className="text-sm">Issued {formatDate(invoice.issued_at, { withTime: true })}</p>
              <p className="mt-1 text-sm font-semibold">
                Status:{' '}
                <span className={refunded ? 'text-danger print:text-black' : undefined}>
                  {getStatusConfig(payment.status).label}
                </span>
              </p>
            </div>
          </header>

          <section className="grid gap-x-8 gap-y-5 border-b border-line-soft py-6 text-sm sm:grid-cols-2 print:border-line">
            <div className="min-w-0">
              <h2 className="text-ink-soft print:text-black">Billed to</h2>
              <p className="mt-1 font-semibold wrap-anywhere">{invoice.guest.full_name}</p>
              <p className="wrap-anywhere">{invoice.guest.email}</p>
              {invoice.guest.phone && <p>{invoice.guest.phone}</p>}
            </div>
            <div className="min-w-0 sm:text-right">
              <h2 className="text-ink-soft print:text-black">{type?.label ?? 'Order'}</h2>
              {type ? (
                <Link
                  to={type.detailPath(invoice.order.id)}
                  className="mt-1 block font-semibold wrap-anywhere text-sea hover:text-sea-hover hover:underline print:text-black"
                >
                  {invoice.order.name}
                </Link>
              ) : (
                <p className="mt-1 font-semibold wrap-anywhere">{invoice.order.name}</p>
              )}
              <p>Order #{invoice.order.id}</p>
            </div>
          </section>

          {/* Điện thoại: mỗi dòng là một khối xếp dọc, nên không phải cuộn ngang. Màn hình rộng và khi in: bảng. */}
          <ul className="divide-y divide-line-soft pt-2 sm:hidden print:hidden">
            {invoice.lines.map((line, index) => (
              <li key={index} className="py-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <p className="min-w-0 font-medium wrap-anywhere">{line.description}</p>
                  <p className="shrink-0 font-medium">{formatCurrency(line.amount)}</p>
                </div>
                {line.detail && <p className="text-xs text-ink-soft">{line.detail}</p>}
                <p className="mt-0.5 text-ink-soft">
                  {formatUnitQuantity(line.quantity, line.unit)} × {formatCurrency(line.unit_price)}
                </p>
              </li>
            ))}
          </ul>

          <table className="mt-4 hidden w-full text-sm sm:table print:table">
            <caption className="sr-only">Invoice lines</caption>
            <thead>
              <tr className="border-b border-line text-left text-ink-soft print:text-black">
                <th scope="col" className="py-2 pr-4 font-medium">Description</th>
                <th scope="col" className="py-2 pr-4 text-right font-medium">Quantity</th>
                <th scope="col" className="py-2 pr-4 text-right font-medium">Unit price</th>
                <th scope="col" className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft print:divide-line">
              {invoice.lines.map((line, index) => (
                <tr key={index} className="align-top">
                  <td className="py-3 pr-4">
                    <p className="font-medium wrap-anywhere">{line.description}</p>
                    {line.detail && <p className="text-xs text-ink-soft print:text-black">{line.detail}</p>}
                  </td>
                  <td className="py-3 pr-4 text-right whitespace-nowrap">
                    {formatUnitQuantity(line.quantity, line.unit)}
                  </td>
                  <td className="py-3 pr-4 text-right whitespace-nowrap">{formatCurrency(line.unit_price)}</td>
                  <td className="py-3 text-right font-medium whitespace-nowrap">{formatCurrency(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="ml-auto max-w-xs border-t border-line pt-3 text-sm">
            <SummaryRow label="Subtotal">{formatCurrency(invoice.subtotal)}</SummaryRow>
            {invoice.discount > 0 && (
              <SummaryRow label={getDiscountLabel(invoice.voucher_code)}>- {formatCurrency(invoice.discount)}</SummaryRow>
            )}
            <SummaryRow label="Total" strong>
              {formatCurrency(invoice.total)}
            </SummaryRow>
          </dl>

          <p className="mt-8 border-t border-line-soft pt-5 text-sm print:border-line">
            Paid by {payment.method === 'e_wallet' ? 'e-wallet' : getPaymentMethodLabel(payment.method)} (simulated QR)
            on {formatDate(payment.paid_at, { withTime: true })}.
            {refunded && ' This payment was refunded because the order was cancelled.'}
          </p>
        </article>
      </div>
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
      <div className="shell py-10">
        <h1 className="sr-only">Could not load this page</h1>
        <ErrorState message={message} onRetry={request.retry} />
      </div>
    );
  }
  return <Invoice invoice={request.data} />;
}
