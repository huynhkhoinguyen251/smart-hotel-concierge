// Các số trang cần hiện: trang đầu, trang cuối và các trang quanh trang hiện tại.
// Chỗ bị bỏ qua hiện dấu "...". Ví dụ trang 6/12: 1 ... 5 6 7 ... 12.
const getPageItems = (page, totalPages) => {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const items = [];
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) {
      items.push(`gap-${p}`);
    }
    items.push(p);
  });
  return items;
};

const BASE =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition';
const IDLE = 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50';
const ACTIVE = 'border-teal-700 bg-teal-700 text-white';
const DISABLED = 'disabled:cursor-not-allowed disabled:opacity-50';

// Phân trang. Chỉ có một trang thì không hiện.
export default function Pagination({ page, limit, total, onPageChange, className = '' }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}
    >
      <button
        type="button"
        className={`${BASE} ${IDLE} ${DISABLED}`}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      {getPageItems(page, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="px-1 text-slate-400">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            className={`${BASE} ${item === page ? ACTIVE : IDLE}`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className={`${BASE} ${IDLE} ${DISABLED}`}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
