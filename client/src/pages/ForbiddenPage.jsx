import { Link } from 'react-router-dom';

// Hiện khi người dùng đã đăng nhập nhưng không có quyền admin.
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-6xl font-bold text-teal-700">403</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Access not allowed</h1>
      <p className="mt-2 max-w-md text-slate-600">
        You do not have permission to view this page. It is only available to hotel staff.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
      >
        Back to home
      </Link>
    </div>
  );
}
