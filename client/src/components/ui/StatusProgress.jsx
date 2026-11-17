import { getStatusConfig } from '../../config/statuses.js';

// Tiến trình trạng thái theo các bước (đơn đồ ăn, đơn tour, đơn vận chuyển...).
// steps: các trạng thái theo thứ tự. Đơn bị hủy không nằm trên đường này, nên hiện cancelledMessage.
// Điện thoại: các bước xếp dọc; màn hình rộng: xếp ngang.
const COLUMNS = { 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5' };

export default function StatusProgress({ status, steps, cancelledMessage, label = 'Progress' }) {
  if (status === 'cancelled') {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {cancelledMessage}
      </p>
    );
  }

  const currentIndex = steps.indexOf(status);

  return (
    <ol className={`grid gap-3 sm:gap-2 ${COLUMNS[steps.length] ?? 'sm:grid-flow-col'}`} aria-label={label}>
      {steps.map((step, index) => {
        const current = index === currentIndex;
        // Bước cuối (completed) cũng hiện dấu ✓, vì đơn đã xong hết.
        const done = index < currentIndex || (current && index === steps.length - 1);
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
