import { LoadingOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';

// Vòng xoay chờ tải cho một phần nhỏ. size: 'sm' (cạnh dòng chữ) hoặc 'md'.
export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span role="status" aria-label="Loading" className={`inline-flex ${className}`}>
      <LoadingOutlined spin aria-hidden="true" className={size === 'sm' ? 'text-base' : 'text-3xl'} />
    </span>
  );
}

// Khung xám giữ chỗ, dùng khi cả trang hoặc cả danh sách đang tải.
export function PageSpinner() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto min-h-[40vh] w-full max-w-6xl px-4 py-8">
      {/* Skeleton của antd dùng thẻ h3, nên ẩn với trình đọc màn hình. */}
      <div aria-hidden="true">
        <Skeleton active title paragraph={{ rows: 3 }} />
        <Skeleton active title={false} paragraph={{ rows: 5 }} className="mt-8" />
      </div>
    </div>
  );
}
