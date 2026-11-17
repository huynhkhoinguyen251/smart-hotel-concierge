import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency.js';
import RoomImage from '../rooms/RoomImage.jsx';

// Thẻ tour trong trang Tours.
export default function TourCard({ tour }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <RoomImage src={tour.image_url} alt={tour.name} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          {tour.location} · {tour.duration}
        </p>
        <h3 className="mt-1 text-lg font-semibold break-words text-slate-900">{tour.name}</h3>
        {tour.description && <p className="mt-2 text-sm text-slate-600">{tour.description}</p>}

        <div className="mt-auto pt-4">
          <p>
            <span className="text-sm text-slate-500">from </span>
            <span className="text-lg font-bold text-teal-700">{formatCurrency(tour.price)}</span>
            <span className="text-sm text-slate-500"> per person</span>
          </p>
          <Link
            to={`/tours/${tour.id}`}
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            View tour
          </Link>
        </div>
      </div>
    </article>
  );
}
