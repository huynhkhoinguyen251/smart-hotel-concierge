import { getMenuCategoryLabel } from '../../config/food.js';
import formatCurrency from '../../utils/formatCurrency.js';

// Các món của một đơn đồ ăn. Điện thoại: mỗi món là một khối xếp dọc; từ sm: bảng.
export default function OrderItemsTable({ items }) {
  return (
    <>
      <ul className="divide-y divide-line-soft border-y border-line-soft sm:hidden">
        {items.map((item) => (
          <li key={item.id} className="py-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-medium wrap-anywhere text-ink">{item.menu_item.name}</p>
              <p className="shrink-0 font-semibold text-ink">{formatCurrency(item.line_total)}</p>
            </div>
            <p className="mt-0.5 text-ink-soft">
              {getMenuCategoryLabel(item.menu_item.category)} · {item.quantity} × {formatCurrency(item.unit_price)}
            </p>
          </li>
        ))}
      </ul>

      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-line-soft text-left text-ink-soft">
            <th scope="col" className="py-2 pr-4 font-medium">Item</th>
            <th scope="col" className="py-2 pr-4 font-medium">Category</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Qty</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium whitespace-nowrap">Unit price</th>
            <th scope="col" className="py-2 text-right font-medium whitespace-nowrap">Line total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-2.5 pr-4 font-medium wrap-anywhere text-ink">{item.menu_item.name}</td>
              <td className="py-2.5 pr-4 text-ink-soft">{getMenuCategoryLabel(item.menu_item.category)}</td>
              <td className="py-2.5 pr-4 text-right text-ink">{item.quantity}</td>
              <td className="py-2.5 pr-4 text-right whitespace-nowrap text-ink-soft">{formatCurrency(item.unit_price)}</td>
              <td className="py-2.5 text-right font-semibold whitespace-nowrap text-ink">
                {formatCurrency(item.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
