// Biểu tượng tiện nghi, cùng một kiểu nét (bộ @ant-design/icons không có bồn tắm, điều hòa, ban công...).
// Admin thêm được tiện nghi mới: tên không khớp từ khóa nào thì dùng dấu kiểm.
const DEFAULT_PATH = 'M5 12.5l4.5 4.5L19 7.5';
const ICONS = [
  [/wi-?fi|internet/i, 'M3 9.5a13 13 0 0118 0M6 13a8.6 8.6 0 0112 0M9 16.3a4.3 4.3 0 016 0M12 19.5h.01'],
  [/air ?con/i, 'M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5'],
  [/\btv\b|television/i, 'M4 5.5h16a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9a1 1 0 011-1zM8.5 20h7'],
  [/minibar|fridge/i, 'M7 3.5h10a1 1 0 011 1v15a1 1 0 01-1 1H7a1 1 0 01-1-1v-15a1 1 0 011-1zM6 10h12M9 6.3v1.4M9 12.8v2.4'],
  [/bath/i, 'M3 12h18v2a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 14zM6.5 18.5L5.7 21M17.5 18.5l.8 2.5M6 12V6a2.2 2.2 0 014.3-.7'],
  [/balcon/i, 'M3 13h18M3 20.5h18M4.5 13v7.5M9.5 13v7.5M14.5 13v7.5M19.5 13v7.5M7 13V4.5h10V13M12 4.5V13'],
  [/safe/i, 'M5 4.5h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1v-12a1 1 0 011-1zM7 18.5v2M17 18.5v2M12 8.5a3 3 0 110 6 3 3 0 010-6zM12 8.5v-1.2M12 15.7v-1.2M9 11.5H7.8M16.2 11.5H15'],
  [/dryer/i, 'M4 5.5h8.5L20 4v9l-7.5-1.5H8A4 4 0 014 8zM8.5 11.7l1 8.3h3l-.8-8.4M16 7v3'],
];

export default function AmenityIcon({ name, className = 'size-5' }) {
  const path = ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? DEFAULT_PATH;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-ink-soft ${className}`}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
