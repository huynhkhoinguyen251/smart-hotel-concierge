import { getMenuCategoryLabel, MAX_ITEM_QUANTITY } from '../../config/food.js';
import formatCurrency from '../../utils/formatCurrency.js';
import RoomImage from '../rooms/RoomImage.jsx';
import Button from '../ui/Button.jsx';
import QuantityControl from './QuantityControl.jsx';

// Một món trong thực đơn. quantity: số phần đang có trong giỏ (0 = chưa có).
// showControls = false (tài khoản admin): chỉ xem, không có nút thêm vào giỏ.
// canAddNew = false: giỏ đã đủ số món tối đa, không thêm được món mới.
export default function MenuItemCard({
  item,
  quantity = 0,
  showControls = true,
  canAddNew = true,
  onAdd,
  onDecrease,
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <RoomImage src={item.image_url} alt={item.name} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          {getMenuCategoryLabel(item.category)}
        </p>
        <h3 className="mt-1 font-semibold break-words text-slate-900">{item.name}</h3>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <p className="font-bold text-teal-700">{formatCurrency(item.price)}</p>
          {showControls &&
            (quantity > 0 ? (
              <QuantityControl
                quantity={quantity}
                itemName={item.name}
                onDecrease={onDecrease}
                onIncrease={onAdd}
                increaseDisabled={quantity >= MAX_ITEM_QUANTITY}
              />
            ) : (
              <Button
                className="px-3 py-2"
                onClick={onAdd}
                disabled={!canAddNew}
                title={canAddNew ? undefined : 'Your cart is full'}
              >
                Add to cart
              </Button>
            ))}
        </div>
      </div>
    </article>
  );
}
