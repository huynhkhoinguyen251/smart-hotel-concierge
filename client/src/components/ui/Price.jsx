import formatCurrency from '../../utils/formatCurrency.js';

const SIZES = { sm: 'text-sm font-semibold', md: 'text-base font-semibold', lg: 'text-2xl font-bold' };

// Giá kèm đơn vị: "1,800,000 VND / night", "from 750,000 VND per person".
// prefix: chữ đứng trước giá; unit: chữ đứng sau giá.
export default function Price({ amount, unit, prefix, size = 'md', className = '' }) {
  return (
    <span className={className}>
      {prefix && <span className="text-sm text-ink-soft">{prefix} </span>}
      <span className={`whitespace-nowrap text-ink ${SIZES[size] ?? SIZES.md}`}>{formatCurrency(amount)}</span>
      {unit && <span className="text-sm text-ink-soft"> {unit}</span>}
    </span>
  );
}
