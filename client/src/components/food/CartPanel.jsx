import { useLocation } from 'react-router-dom';
import { MAX_ITEM_QUANTITY, MAX_ORDER_LINES, MIN_ITEM_QUANTITY } from '../../config/food.js';
import useAuth from '../../hooks/useAuth.js';
import formatCurrency from '../../utils/formatCurrency.js';
import ButtonLink from '../ui/ButtonLink.jsx';
import QuantityControl from '../ui/QuantityControl.jsx';
import Spinner from '../ui/Spinner.jsx';
import FoodOrderForm from './FoodOrderForm.jsx';

// Phần dưới giỏ hàng: đang tải hồ sơ, nút đăng nhập, hoặc form đặt hàng.
function OrderSection({ lines, bookingId, onOrdered }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Spinner size="sm" className="text-sea" /> Loading...
      </p>
    );
  }
  if (!user) {
    // Giỏ hàng nằm trong localStorage, nên đăng nhập xong quay lại vẫn còn.
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-soft">Log in with your guest account to place an order.</p>
        <ButtonLink to="/login" state={{ from: location }} fullWidth>
          Log in to order
        </ButtonLink>
      </div>
    );
  }
  return <FoodOrderForm lines={lines} initialBookingId={bookingId} onOrdered={onOrdered} />;
}

// Giỏ hàng (không dùng cho admin). lines đã ghép với thực đơn nên có tên và giá mới nhất.
// Trong ngăn kéo của điện thoại, tiêu đề đã có ở đầu ngăn kéo nên hideHeading = true.
export default function CartPanel({
  lines,
  total,
  bookingId,
  onChangeQuantity,
  onRemove,
  onOrdered,
  hideHeading = false,
}) {
  const tooManyLines = lines.length > MAX_ORDER_LINES;

  return (
    <section id="cart" aria-labelledby="cart-heading">
      <h2 id="cart-heading" className={hideHeading ? 'sr-only' : 'text-lg font-semibold text-ink'}>
        Your order
      </h2>

      {lines.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Your cart is empty. Add items from the menu.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line-soft border-y border-line-soft">
          {lines.map((line) => (
            <li key={line.menu_item_id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-sm font-medium break-words text-ink">
                  {line.menuItem.name}
                </p>
                <p className="shrink-0 text-sm font-semibold text-ink">
                  {formatCurrency(line.lineTotal)}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <QuantityControl
                  quantity={line.quantity}
                  itemName={line.menuItem.name}
                  onDecrease={() => onChangeQuantity(line.menu_item_id, line.quantity - 1)}
                  onIncrease={() => onChangeQuantity(line.menu_item_id, line.quantity + 1)}
                  decreaseDisabled={line.quantity <= MIN_ITEM_QUANTITY}
                  increaseDisabled={line.quantity >= MAX_ITEM_QUANTITY}
                />
                <button
                  type="button"
                  onClick={() => onRemove(line.menu_item_id)}
                  className="rounded-control px-2 py-1 text-sm font-medium text-danger hover:bg-danger-tint"
                  aria-label={`Remove ${line.menuItem.name}`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="font-semibold text-ink">Subtotal</p>
        <p className="text-lg font-bold text-ink">{formatCurrency(total)}</p>
      </div>
      {lines.length >= MAX_ORDER_LINES && (
        <p className={`mt-1 text-xs ${tooManyLines ? 'text-danger' : 'text-ink-soft'}`}>
          An order can have up to {MAX_ORDER_LINES} different items.
        </p>
      )}

      <div className="mt-4 border-t border-line-soft pt-4">
        <OrderSection lines={lines} bookingId={bookingId} onOrdered={onOrdered} />
      </div>
    </section>
  );
}
