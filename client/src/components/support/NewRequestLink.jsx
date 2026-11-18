import { Link } from 'react-router-dom';

// Nút "New request" dẫn tới /support/new.
export default function NewRequestLink({ className = '' }) {
  return (
    <Link
      to="/support/new"
      className={`inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 ${className}`}
    >
      New request
    </Link>
  );
}
