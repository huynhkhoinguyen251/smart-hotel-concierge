import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';

// Thẻ số liệu ở hàng đầu Dashboard. request: kết quả useFetch; getValue(data) trả { value, detail }.
// link: { to, label } tùy chọn, ví dụ "Review pending bookings".
export default function StatCard({ label, request, getValue, link }) {
  let body;
  if (request.loading) {
    body = <Spinner size="sm" className="mt-2 text-teal-700" />;
  } else if (request.error) {
    body = (
      <div className="mt-1 text-sm text-red-700" role="alert">
        <p>Could not load.</p>
        <Button variant="secondary" size="sm" className="mt-2" onClick={request.retry}>
          Try again
        </Button>
      </div>
    );
  } else {
    const { value, detail } = getValue(request.data);
    body = (
      <>
        <p className="mt-1 text-2xl font-bold break-words text-slate-900">{value}</p>
        {detail && <p className="mt-0.5 text-sm text-slate-500">{detail}</p>}
      </>
    );
  }

  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {body}
      {link && !request.loading && !request.error && (
        <Link to={link.to} className="mt-auto pt-3 text-sm font-semibold text-teal-700 hover:text-teal-800">
          {link.label} →
        </Link>
      )}
    </div>
  );
}
