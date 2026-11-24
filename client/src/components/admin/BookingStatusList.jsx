import { Link } from 'react-router-dom';
import { BOOKING_STATUS_ORDER } from '../../config/adminStats.js';
import { getStatusConfig } from '../../config/statuses.js';
import BarRow from './charts/BarRow.jsx';

// Số đơn đặt phòng theo từng trạng thái; mỗi dòng dẫn tới danh sách đơn đã lọc theo trạng thái đó.
// Thanh ngang cho thấy tỉ lệ so với trạng thái nhiều đơn nhất.
export default function BookingStatusList({ byStatus }) {
  const max = Math.max(1, ...BOOKING_STATUS_ORDER.map((status) => byStatus[status] ?? 0));

  return (
    <ul>
      {BOOKING_STATUS_ORDER.map((status) => {
        const count = byStatus[status] ?? 0;
        return (
          <li key={status}>
            <Link
              to={`/admin/bookings?status=${status}`}
              className="-mx-2 block rounded-control px-2 py-2.5 hover:bg-ground"
            >
              <BarRow
                label={getStatusConfig(status).label}
                share={count / max}
                value={<span className="font-semibold">{count}</span>}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
