// Khung trắng bo góc, dùng cho form và các khối nội dung.
export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
