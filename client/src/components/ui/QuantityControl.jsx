import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button as AntButton } from 'antd';

// Nút giảm, số lượng, nút tăng. itemName dùng cho nhãn đọc màn hình, ví dụ "Decrease Pho Bo".
export default function QuantityControl({
  quantity,
  itemName,
  onDecrease,
  onIncrease,
  decreaseDisabled = false,
  increaseDisabled = false,
  className = '',
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <AntButton
        size="small"
        icon={<MinusOutlined />}
        onClick={onDecrease}
        disabled={decreaseDisabled}
        aria-label={`Decrease ${itemName}`}
      />
      <span className="min-w-6 text-center text-sm font-semibold text-ink" aria-live="polite">
        <span className="sr-only">Quantity of {itemName}: </span>
        {quantity}
      </span>
      <AntButton
        size="small"
        icon={<PlusOutlined />}
        onClick={onIncrease}
        disabled={increaseDisabled}
        aria-label={`Increase ${itemName}`}
      />
    </div>
  );
}
