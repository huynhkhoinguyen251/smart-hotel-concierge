import { getMenuCategoryLabel } from '../../config/food.js';
import formatCurrency from '../../utils/formatCurrency.js';

// Các món của một đơn. Điện thoại: mỗi món là một khối xếp dọc; từ màn hình sm trở lên: bảng.
// Nhờ vậy trang không bao giờ bị cuộn ngang ở 375px.
export default function FoodOrderItems({ items }) {
  return (
    <>
      <ul className="divide-y divide-slate-100 border-y border-slate-100 sm:hidden">
        {items.map((item) => (
          <li key={item.id} className="py-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-medium break-words text-slate-900">{item.menu_item.name}</p>
              <p className="shrink-0 font-semibold text-slate-900">{formatCurrency(item.line_total)}</p>
            </div>
            <p className="mt-0.5 text-slate-500">
              {getMenuCategoryLabel(item.menu_item.category)} · {item.quantity} ×{' '}
              {formatCurrency(item.unit_price)}
            </p>
          </li>
        ))}
      </ul>

      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th scope="col" className="py-2 pr-3 font-medium">Item</th>
            <th scope="col" className="py-2 pr-3 font-medium">Category</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">Qty</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">Unit price</th>
            <th scope="col" className="py-2 text-right font-medium">Line total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-2.5 pr-3 font-medium break-words text-slate-900">{item.menu_item.name}</td>
              <td className="py-2.5 pr-3 text-slate-600">{getMenuCategoryLabel(item.menu_item.category)}</td>
              <td className="py-2.5 pr-3 text-right text-slate-900">{item.quantity}</td>
              <td className="py-2.5 pr-3 text-right whitespace-nowrap text-slate-600">
                {formatCurrency(item.unit_price)}
              </td>
              <td className="py-2.5 text-right font-semibold whitespace-nowrap text-slate-900">
                {formatCurrency(item.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
