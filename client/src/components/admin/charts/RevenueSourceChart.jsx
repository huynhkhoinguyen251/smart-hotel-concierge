import { Doughnut } from 'react-chartjs-2';
import { REVENUE_SOURCES } from '../../../config/adminStats.js';
import formatCurrency from '../../../utils/formatCurrency.js';
import './registerCharts.js';

// Biểu đồ tròn: phần doanh thu của từng nguồn. Chú thích là danh sách HTML bên cạnh,
// có số tiền và phần trăm, nên đọc được cả khi không nhìn biểu đồ.
// Tổng bằng 0 thì trang cha hiện ghi chú thay vì biểu đồ rỗng.
export default function RevenueSourceChart({ revenue }) {
  const total = Number(revenue.total) || 0;
  const percent = (value) => (total > 0 ? Math.round((Number(value) / total) * 1000) / 10 : 0);

  const data = {
    labels: REVENUE_SOURCES.map((source) => source.label),
    datasets: [
      {
        data: REVENUE_SOURCES.map((source) => revenue[source.key]),
        backgroundColor: REVENUE_SOURCES.map((source) => source.color),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatCurrency(context.parsed)} (${percent(context.parsed)}%)`,
        },
      },
    },
  };

  return (
    // Ô ở cột hẹp (2 cột từ lg) thì chú thích xuống dưới biểu đồ, tránh số tiền đè lên tên nguồn.
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col 2xl:flex-row">
      <div className="relative h-48 w-48 shrink-0">
        <Doughnut data={data} options={options} role="img" aria-label="Doughnut chart of revenue by source" />
      </div>
      <ul className="w-full min-w-0 space-y-2 text-sm" aria-label="Revenue by source">
        {REVENUE_SOURCES.map((source) => (
          <li key={source.key} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: source.color }} aria-hidden="true" />
              <span className="text-slate-700">{source.label}</span>
            </span>
            <span className="text-right whitespace-nowrap">
              <span className="font-semibold text-slate-900">{formatCurrency(revenue[source.key])}</span>
              <span className="ml-1 text-xs text-slate-500">{percent(revenue[source.key])}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
