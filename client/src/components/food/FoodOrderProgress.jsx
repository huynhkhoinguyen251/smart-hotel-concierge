import { FOOD_ORDER_STEPS } from '../../config/food.js';
import { getStatusConfig } from '../../config/statuses.js';

// Tiến trình đơn: pending → confirmed → preparing → delivering → completed.
// Đơn bị hủy không nằm trên đường này, nên hiện một dòng riêng.
// Điện thoại: các bước xếp dọc; màn hình rộng: xếp ngang.
export default function FoodOrderProgress({ status }) {
  if (status === 'cancelled') {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        This order was cancelled.
      </p>
    );
  }

  const currentIndex = FOOD_ORDER_STEPS.indexOf(status);

  return (
    <ol className="grid gap-3 sm:grid-cols-5 sm:gap-2" aria-label="Order progress">
      {FOOD_ORDER_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li
            key={step}
            aria-current={current ? 'step' : undefined}
            className="flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                done || current
                  ? 'bg-teal-700 text-white'
                  : 'border border-slate-300 bg-white text-slate-400'
              } ${current ? 'ring-4 ring-teal-100' : ''}`}
            >
              {done ? '✓' : index + 1}
            </span>
            <span
              className={`text-sm ${current ? 'font-semibold text-slate-900' : done ? 'text-slate-700' : 'text-slate-400'}`}
            >
              {getStatusConfig(step).label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
