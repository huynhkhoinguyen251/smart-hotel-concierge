import { REVENUE_SOURCES } from '../../../config/adminStats.js';
import formatCurrency from '../../../utils/formatCurrency.js';

// Doanh thu của từng nguồn: thanh ngang, số tiền và phần trăm bằng chữ bên cạnh.
// Trên điện thoại chữ nằm trên, thanh nằm dưới. Tổng bằng 0 thì trang cha hiện ghi chú thay vì biểu đồ rỗng.
export default function RevenueSourceChart({ revenue }) {
  const total = Number(revenue.total) || 0;
  const amounts = REVENUE_SOURCES.map((source) => Number(revenue[source.key]) || 0);
  const max = Math.max(1, ...amounts);
  const percent = (value) => (total > 0 ? Math.round((value / total) * 1000) / 10 : 0);

  return (
    <ul className="space-y-4" aria-label="Revenue by source">
      {REVENUE_SOURCES.map((source, index) => (
        <li
          key={source.key}
          className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[5.5rem_minmax(0,1fr)_11.5rem]"
        >
          <span className="text-ink">{source.label}</span>
          <span aria-hidden="true" className="order-last col-span-2 h-4 sm:order-none sm:col-span-1">
            <span
              className="block h-full rounded-r-sm"
              style={{
                width: `${(amounts[index] / max) * 100}%`,
                minWidth: amounts[index] > 0 ? 3 : 0,
                backgroundColor: source.color,
              }}
            />
          </span>
          <span className="text-right whitespace-nowrap">
            <span className="font-semibold text-ink">{formatCurrency(amounts[index])}</span>
            <span className="text-ink-soft"> {percent(amounts[index])}%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
