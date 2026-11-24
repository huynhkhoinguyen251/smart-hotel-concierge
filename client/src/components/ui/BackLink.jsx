import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

// Link quay lại ở đầu trang chi tiết.
export default function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 py-1 text-sm font-medium text-sea hover:text-sea-hover hover:underline"
    >
      <ArrowLeftOutlined aria-hidden="true" />
      {children}
    </Link>
  );
}
