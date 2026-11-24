import { Bar } from 'react-chartjs-2';
import { MONTH_LABELS, REVENUE_SOURCES } from '../../../config/adminStats.js';
import { COLORS } from '../../../config/theme.js';
import formatCurrency from '../../../utils/formatCurrency.js';
import './registerCharts.js';

const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

// Nhãn trục gọn: 2000000 thành "2M VND"; 0 chỉ ghi "0".
const formatAxis = (value) => (value === 0 ? '0' : `${compactNumber.format(value)} VND`);

// true nếu phần này là phần trên cùng của cột (các nguồn sau nó đều bằng 0).
const isTopSegment = ({ chart, dataIndex, datasetIndex }) =>
  chart.data.datasets.slice(datasetIndex + 1).every((dataset) => !dataset.data[dataIndex]);

// Khe trắng 2px giữa các phần; chỉ phần trên cùng được bo góc.
const SEGMENT_GAP = { top: 2, right: 0, bottom: 0, left: 0 };
const TOP_RADIUS = { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 };

// Biểu đồ cột chồng: doanh thu 12 tháng, mỗi màu là một nguồn.
// Khung cao cố định + maintainAspectRatio false, nên biểu đồ co theo chiều ngang trên điện thoại.
export default function RevenueChart({ months, year }) {
  const data = {
    labels: MONTH_LABELS,
    datasets: REVENUE_SOURCES.map((source) => ({
      label: source.label,
      data: months.map((month) => Number(month[source.key]) || 0),
      backgroundColor: source.color,
      hoverBackgroundColor: source.color,
      stack: 'revenue',
      maxBarThickness: 24,
      borderSkipped: false,
      borderColor: COLORS.white,
      hoverBorderColor: COLORS.white,
      borderWidth: (context) => (isTopSegment(context) ? 0 : SEGMENT_GAP),
      borderRadius: (context) => (isTopSegment(context) ? TOP_RADIUS : 0),
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // Không có chuyển động: cột hiện ngay ở đúng chỗ khi tải và khi đổi năm.
    animation: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: COLORS.ink,
        padding: 12,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 6,
        multiKeyBackground: COLORS.ink,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
          footer: (items) => `Total: ${formatCurrency(items.reduce((sum, item) => sum + item.parsed.y, 0))}`,
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, border: { color: COLORS.line }, ticks: { maxRotation: 0, autoSkipPadding: 8 } },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: COLORS.lineSoft, lineWidth: 1 },
        border: { display: false },
        ticks: { maxTicksLimit: 6, padding: 8, callback: formatAxis },
      },
    },
  };

  return (
    <>
      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink" aria-label="Chart colours">
        {REVENUE_SOURCES.map((source) => (
          <li key={source.key} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: source.color }} />
            {source.label}
          </li>
        ))}
      </ul>
      <div className="relative h-72">
        <Bar
          data={data}
          options={options}
          role="img"
          aria-label={`Stacked bar chart of revenue by month and source in ${year}. A table with the same numbers is below.`}
        />
      </div>
    </>
  );
}
