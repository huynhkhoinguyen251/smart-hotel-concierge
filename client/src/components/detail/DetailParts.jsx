import formatCurrency from '../../utils/formatCurrency.js';

// Các phần của trang chi tiết đơn, dùng chung cho khách và admin.

// Một phần có tiêu đề. subtitle: dòng nhỏ dưới tiêu đề; action: nút nhỏ bên phải tiêu đề.
export function DetailSection({ title, subtitle, action, children }) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold wrap-anywhere text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// Danh sách "nhãn, giá trị" ở cột chính: nhãn thành một cột riêng, nên dễ đọc trên màn hình rộng.
export function DetailFacts({ children }) {
  return <dl className="text-sm">{children}</dl>;
}

export function DetailFact({ label, children }) {
  return (
    <div className="grid gap-x-6 gap-y-0.5 py-1.5 sm:grid-cols-[11rem_minmax(0,1fr)]">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="min-w-0 wrap-anywhere font-medium text-ink">{children}</dd>
    </div>
  );
}

// Bảng giá ở cột bên. rows: [{ label, value }]; total: tổng tiền.
export function DetailPriceSection({ rows, total }) {
  return (
    <DetailSection title="Price">
      <dl className="text-sm">
        {rows.map((row) => (
          // Số tiền không xuống dòng; nhãn dài (mã giảm giá) thì xuống dòng.
          <div key={row.label} className="flex items-start justify-between gap-4 py-2.5">
            <dt className="min-w-0 wrap-anywhere text-ink-soft">{row.label}</dt>
            <dd className="shrink-0 text-right font-medium whitespace-nowrap text-ink">{row.value}</dd>
          </div>
        ))}
        <div className="mt-1 flex items-start justify-between gap-4 border-t border-line-soft py-2.5">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="text-right text-lg font-bold whitespace-nowrap text-ink">{formatCurrency(total)}</dd>
        </div>
      </dl>
    </DetailSection>
  );
}
