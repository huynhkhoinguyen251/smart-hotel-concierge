import { Link } from 'react-router-dom';
import { BOOKING_STATUS_ORDER } from '../../config/adminStats.js';
import StatusBadge from '../ui/StatusBadge.jsx';

// Số đơn đặt phòng theo từng trạng thái; mỗi dòng dẫn tới danh sách đơn đã lọc theo trạng thái đó.
// Thanh ngang cho thấy tỉ lệ so với trạng thái nhiều đơn nhất.
export default function BookingStatusList({ byStatus }) {
  const max = Math.max(1, ...BOOKING_STATUS_ORDER.map((status) => byStatus[status] ?? 0));

  return (
    <ul className="space-y-1">
      {BOOKING_STATUS_ORDER.map((status) => {
        const count = byStatus[status] ?? 0;
        return (
          <li key={status}>
            <Link
              to={`/admin/bookings?status=${status}`}
              className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
            >
              <StatusBadge status={status} className="justify-self-start" />
              <span className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                <span className="block h-full rounded-full bg-teal-600" style={{ width: `${(count / max) * 100}%` }} />
              </span>
              <span className="text-right text-sm font-semibold text-slate-900">{count}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
