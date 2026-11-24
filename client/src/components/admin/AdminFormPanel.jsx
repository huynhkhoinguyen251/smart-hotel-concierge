// Khung trắng bọc một form của admin.
export default function AdminFormPanel({ children }) {
  return <div className="rounded-panel border border-line-soft bg-white p-4 sm:p-6 lg:p-8">{children}</div>;
}
