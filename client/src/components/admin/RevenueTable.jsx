import { MONTH_LABELS, REVENUE_SOURCES } from '../../config/adminStats.js';
import formatCurrency from '../../utils/formatCurrency.js';

// Tổng năm và bảng số liệu của biểu đồ doanh thu (cách đọc thay thế cho biểu đồ).
// Bảng nằm trong <details> và tự cuộn ngang bên trong khung, trang không bị cuộn ngang.
export default function RevenueTable({ months, year }) {
  const totals = Object.fromEntries(
    [...REVENUE_SOURCES.map((source) => source.key), 'total'].map((key) => [
      key,
      months.reduce((sum, month) => sum + (Number(month[key]) || 0), 0),
    ]),
  );

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-sm text-slate-700">
        Total for {year}: <span className="font-bold text-teal-700">{formatCurrency(totals.total)}</span>
      </p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-medium text-teal-700 hover:text-teal-800">
          Show monthly table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-right">
            <caption className="sr-only">Revenue by month and source in {year}</caption>
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th scope="col" className="py-2 pr-3 text-left font-medium">Month</th>
                {REVENUE_SOURCES.map((source) => (
                  <th key={source.key} scope="col" className="py-2 pr-3 font-medium">
                    {source.label}
                  </th>
                ))}
                <th scope="col" className="py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {months.map((month) => (
                <tr key={month.month}>
                  <th scope="row" className="py-1.5 pr-3 text-left font-medium text-slate-700">
                    {MONTH_LABELS[month.month - 1]}
                  </th>
                  {REVENUE_SOURCES.map((source) => (
                    <td key={source.key} className="py-1.5 pr-3 whitespace-nowrap text-slate-600">
                      {formatCurrency(month[source.key])}
                    </td>
                  ))}
                  <td className="py-1.5 font-semibold whitespace-nowrap text-slate-900">
                    {formatCurrency(month.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 font-semibold text-slate-900">
                <th scope="row" className="py-2 pr-3 text-left">Year</th>
                {REVENUE_SOURCES.map((source) => (
                  <td key={source.key} className="py-2 pr-3 whitespace-nowrap">
                    {formatCurrency(totals[source.key])}
                  </td>
                ))}
                <td className="py-2 whitespace-nowrap">{formatCurrency(totals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </details>
    </div>
  );
}
