import { getServiceCategory } from '../../utils/serviceHelpers.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { getTransportLabel } from '../../utils/tourismHelpers.js';
import EmptyState from '../ui/EmptyState.jsx';

// Nhãn loại dịch vụ: dịch vụ khách sạn hoặc vận chuyển (top dịch vụ gồm cả hai).
const getAnyServiceLabel = (category) => getServiceCategory(category)?.label ?? getTransportLabel(category);

const TH = 'py-2 pr-3 font-medium';

function TopTable({ caption, headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line-soft text-left text-ink-soft">
            <th scope="col" className={TH}>{headers[0]}</th>
            <th scope="col" className={`${TH} text-right`}>{headers[1]}</th>
            <th scope="col" className="py-2 text-right font-medium">{headers[2]}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">{rows}</tbody>
      </table>
    </div>
  );
}

// Các phòng được đặt nhiều nhất. Doanh thu chỉ tính đơn đã checked_out.
export function TopRoomsTable({ items }) {
  if (items.length === 0) {
    return <EmptyState title="No bookings yet" message="Rooms appear here after they are booked." />;
  }
  return (
    <TopTable
      caption="Most booked rooms"
      headers={['Room', 'Bookings', 'Revenue']}
      rows={items.map(({ room, booking_count, revenue }) => (
        <tr key={room.id}>
          <td className="py-2.5 pr-3">
            <p className="font-medium text-ink">Room {room.room_number}</p>
            <p className="text-xs text-ink-soft">{room.room_type.name}</p>
          </td>
          <td className="py-2.5 pr-3 text-right text-ink">{booking_count}</td>
          <td className="py-2.5 text-right whitespace-nowrap text-ink">{formatCurrency(revenue)}</td>
        </tr>
      ))}
    />
  );
}

// Các dịch vụ được dùng nhiều nhất (dịch vụ khách sạn và vận chuyển; không có tour).
export function TopServicesTable({ items }) {
  if (items.length === 0) {
    return <EmptyState title="No service requests yet" message="Services appear here after guests use them." />;
  }
  return (
    <TopTable
      caption="Most used services"
      headers={['Service', 'Uses', 'Revenue']}
      rows={items.map(({ service, usage_count, revenue }) => (
        <tr key={service.id}>
          <td className="py-2.5 pr-3">
            <p className="font-medium wrap-anywhere text-ink">{service.name}</p>
            <p className="text-xs text-ink-soft">{getAnyServiceLabel(service.category)}</p>
          </td>
          <td className="py-2.5 pr-3 text-right text-ink">{usage_count}</td>
          <td className="py-2.5 text-right whitespace-nowrap text-ink">{formatCurrency(revenue)}</td>
        </tr>
      ))}
    />
  );
}
