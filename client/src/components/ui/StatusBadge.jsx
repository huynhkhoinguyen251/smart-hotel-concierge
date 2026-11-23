import { Tag } from 'antd';
import { getStatusConfig } from '../../config/statuses.js';

// Màu chữ và nền theo tone của config/statuses.js; mọi cặp màu có độ tương phản trên 4.5:1.
const TONE_CLASSES = {
  amber: 'bg-warning-tint text-warning-deep',
  sky: 'bg-[#e5eef9] text-[#1d4f8f]',
  teal: 'bg-sea-tint text-sea-hover',
  emerald: 'bg-success-tint text-success-deep',
  violet: 'bg-[#efebf9] text-[#553c93]',
  slate: 'bg-[#eaeff2] text-[#3f5563]',
  red: 'bg-danger-tint text-danger-hover',
};

// Nhãn trạng thái, ví dụ checked_in hiện "Checked in".
export default function StatusBadge({ status, className = '' }) {
  const { label, tone } = getStatusConfig(status);
  return (
    <Tag
      variant="filled"
      className={`m-0 font-semibold whitespace-nowrap ${TONE_CLASSES[tone] ?? TONE_CLASSES.slate} ${className}`}
    >
      {label}
    </Tag>
  );
}
