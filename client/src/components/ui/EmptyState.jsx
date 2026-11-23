import { InboxOutlined } from '@ant-design/icons';
import { Empty } from 'antd';

// Khối hiện khi danh sách không có dữ liệu. action: nút hoặc link tùy chọn.
export default function EmptyState({ title, message, action, className = '' }) {
  return (
    <Empty
      className={`px-4 py-12 ${className}`}
      image={<InboxOutlined aria-hidden="true" className="text-5xl text-sea-line" />}
      styles={{ image: { height: 'auto' } }}
      description={
        <>
          <p className="text-lg font-semibold text-ink">{title}</p>
          {message && <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">{message}</p>}
        </>
      }
    >
      {action}
    </Empty>
  );
}
