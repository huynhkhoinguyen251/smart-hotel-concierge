import { Link } from 'react-router-dom';

// Trang "không tìm thấy" của một mục cụ thể (đơn, yêu cầu, dịch vụ...), kèm link quay lại.
export default function NotFoundView({ title, message, to, linkLabel }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="text-6xl font-bold text-teal-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{message}</p>
      <Link
        to={to}
        className="mt-8 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
