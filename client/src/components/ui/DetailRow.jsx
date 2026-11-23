// Một dòng "nhãn — giá trị" trong <dl> của các trang chi tiết đơn.
export default function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-ink-soft">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-ink">{children}</dd>
    </div>
  );
}
