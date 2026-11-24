import formatCurrency from '../../utils/formatCurrency.js';
import Bone from '../ui/Bone.jsx';

function Figure({ label, request, getValue }) {
  const renderValue = () => {
    if (request.loading) return <Bone className="h-6 w-24" />;
    if (request.error) {
      return (
        <span className="text-danger" role="alert">
          Could not load.{' '}
          <button type="button" onClick={request.retry} className="font-semibold underline hover:no-underline">
            Try again
          </button>
        </span>
      );
    }
    const { value, detail } = getValue(request.data);
    return (
      <>
        <span className="font-semibold whitespace-nowrap text-ink">{value}</span>
        {detail && <span className="text-ink-soft"> {detail}</span>}
      </>
    );
  };

  return (
    <div className="min-w-0">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="min-h-6 wrap-anywhere">{renderValue()}</dd>
    </div>
  );
}

// Một dòng số liệu chung, chỉ là chữ: doanh thu, số đơn, số khách, điểm trung bình.
export default function PlainFigures({ overview, feedback }) {
  return (
    <dl className="flex flex-wrap gap-x-12 gap-y-4">
      <Figure
        label="Total revenue"
        request={overview}
        getValue={(data) => ({ value: formatCurrency(data.revenue.total), detail: 'from completed stays and orders' })}
      />
      <Figure
        label="Bookings"
        request={overview}
        getValue={(data) => ({ value: data.bookings.total, detail: 'not counting cancelled' })}
      />
      <Figure
        label="Guest users"
        request={overview}
        getValue={(data) => ({ value: `${data.users.active} / ${data.users.total}`, detail: 'active / total' })}
      />
      <Figure
        label="Average rating"
        request={feedback}
        getValue={(data) =>
          data.review_count > 0
            ? {
                value: `${Number(data.average_rating).toFixed(1)} / 5`,
                detail: `from ${data.review_count} ${data.review_count === 1 ? 'review' : 'reviews'}`,
              }
            : { value: '-', detail: 'No reviews yet' }
        }
      />
    </dl>
  );
}
