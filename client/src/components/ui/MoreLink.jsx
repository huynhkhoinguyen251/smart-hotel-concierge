import { RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

// Link "xem thêm" đi sang trang khác, có mũi tên ở cuối.
export default function MoreLink({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-sea hover:text-sea-hover hover:underline ${className}`}
    >
      {children}
      <RightOutlined aria-hidden="true" className="text-xs" />
    </Link>
  );
}
