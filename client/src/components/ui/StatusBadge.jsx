import { getStatusConfig } from '../../config/statuses.js';

const TONE_CLASSES = {
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  sky: 'bg-sky-50 text-sky-800 ring-sky-200',
  teal: 'bg-teal-50 text-teal-800 ring-teal-200',
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  violet: 'bg-violet-50 text-violet-800 ring-violet-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
};

// Nhãn trạng thái dạng viên thuốc, ví dụ checked_in hiện "Checked in".
export default function StatusBadge({ status, className = '' }) {
  const { label, tone } = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONE_CLASSES[tone] ?? TONE_CLASSES.slate} ${className}`}
    >
      {label}
    </span>
  );
}
