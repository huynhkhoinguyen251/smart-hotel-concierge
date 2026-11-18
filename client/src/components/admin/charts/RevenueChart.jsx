import { Bar } from 'react-chartjs-2';
import { MONTH_LABELS, REVENUE_SOURCES } from '../../../config/adminStats.js';
import formatCurrency from '../../../utils/formatCurrency.js';
import './registerCharts.js';

// Biểu đồ cột chồng: doanh thu 12 tháng, mỗi màu là một nguồn.
// Khung cao cố định + maintainAspectRatio false, nên biểu đồ co theo chiều ngang trên điện thoại.
export default function RevenueChart({ months, year }) {
  const data = {
    labels: MONTH_LABELS,
    datasets: REVENUE_SOURCES.map((source) => ({
      label: source.label,
      data: months.map((month) => month[source.key]),
      backgroundColor: source.color,
      stack: 'revenue',
      borderRadius: 2,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
          footer: (items) => `Total: ${formatCurrency(items.reduce((sum, item) => sum + item.parsed.y, 0))}`,
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { callback: (value) => formatCurrency(value) },
      },
    },
  };

  return (
    <div className="relative h-72 sm:h-80">
      <Bar
        data={data}
        options={options}
        role="img"
        aria-label={`Stacked bar chart of revenue by month and source in ${year}. A table with the same numbers is below.`}
      />
    </div>
  );
}
