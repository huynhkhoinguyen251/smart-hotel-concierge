import { PlusOutlined } from '@ant-design/icons';
import { MAX_ITEM_QUANTITY } from '../../config/food.js';
import Button from '../ui/Button.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';
import QuantityControl from '../ui/QuantityControl.jsx';

// Một dòng trong thực đơn. quantity: số phần đang có trong giỏ (0 = chưa có).
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
    <article className="flex gap-4 py-4 sm:items-center sm:gap-6">
      <PhotoFrame
        src={item.image_url}
        alt={item.name}
        className="aspect-[4/3] w-28 shrink-0 self-start sm:w-44 sm:self-center"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h3 className="font-semibold break-words text-ink sm:text-lg">{item.name}</h3>
          <p className="mt-1">
            <Price amount={item.price} />
          </p>
        </div>
        {showControls && (
          <div className="flex h-10 shrink-0 items-center sm:w-36 sm:justify-end">
            {quantity > 0 ? (
              <QuantityControl
                quantity={quantity}
                itemName={item.name}
                onDecrease={onDecrease}
                onIncrease={onAdd}
                increaseDisabled={quantity >= MAX_ITEM_QUANTITY}
              />
            ) : (
              <Button
                variant="secondary"
                icon={<PlusOutlined />}
                onClick={onAdd}
                disabled={!canAddNew}
                title={canAddNew ? undefined : 'Your cart is full'}
              >
                Add to cart
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
