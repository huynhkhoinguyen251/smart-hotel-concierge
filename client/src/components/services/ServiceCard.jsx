import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency.js';
import { getCategoryLabel, getPriceUnit } from '../../utils/serviceHelpers.js';
import RoomImage from '../rooms/RoomImage.jsx';

// Thẻ dịch vụ trong trang Services. to: link sang trang đặt dịch vụ (có thể kèm ?booking_id=).
export default function ServiceCard({ service, to }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <RoomImage src={service.image_url} alt={service.name} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          {getCategoryLabel(service.category)}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">{service.name}</h3>
        {service.description && (
          <p className="mt-2 text-sm text-slate-600">{service.description}</p>
        )}

        <div className="mt-auto pt-4">
          <p>
            <span className="text-lg font-bold text-teal-700">{formatCurrency(service.price)}</span>
            <span className="text-sm text-slate-500"> {getPriceUnit(service.category)}</span>
          </p>
          <Link
            to={to}
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Book this service
          </Link>
        </div>
      </div>
    </article>
  );
}
