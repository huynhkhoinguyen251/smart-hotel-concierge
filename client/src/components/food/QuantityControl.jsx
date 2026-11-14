const BUTTON_CLASS =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

// Nút "- số lượng +". itemName dùng cho nhãn đọc màn hình, ví dụ "Decrease Pho Bo".
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
      <button
        type="button"
        className={BUTTON_CLASS}
        onClick={onDecrease}
        disabled={decreaseDisabled}
        aria-label={`Decrease ${itemName}`}
      >
        −
      </button>
      <span className="min-w-6 text-center text-sm font-semibold text-slate-900" aria-live="polite">
        <span className="sr-only">Quantity of {itemName}: </span>
        {quantity}
      </span>
      <button
        type="button"
        className={BUTTON_CLASS}
        onClick={onIncrease}
        disabled={increaseDisabled}
        aria-label={`Increase ${itemName}`}
      >
        +
      </button>
    </div>
  );
}
