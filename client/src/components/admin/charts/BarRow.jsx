// Một thanh ngang của biểu đồ dạng danh sách: nhãn, thanh màu, số liệu bằng chữ.
// Chữ luôn là màu mực; màu chỉ nằm trên thanh. share: từ 0 đến 1.
export default function BarRow({ label, share, color = 'var(--color-sea)', value }) {
  return (
    <span className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-x-4 text-sm">
      <span className="min-w-0 wrap-anywhere text-ink">{label}</span>
      <span aria-hidden="true" className="h-4">
        <span
          className="block h-full rounded-r-sm"
          style={{ width: `${share * 100}%`, minWidth: share > 0 ? 3 : 0, backgroundColor: color }}
        />
      </span>
      <span className="text-right text-ink">{value}</span>
    </span>
  );
}
