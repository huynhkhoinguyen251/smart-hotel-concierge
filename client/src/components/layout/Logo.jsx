import { Link } from 'react-router-dom';

// Logo dẫn về trang chủ.
export default function Logo({ to = '/', onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-lg font-bold text-white">
        H
      </span>
      <span className="text-base font-bold leading-tight text-slate-900 sm:text-lg">
        Smart Hotel Concierge
      </span>
    </Link>
  );
}
