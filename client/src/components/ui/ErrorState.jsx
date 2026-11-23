import { Alert as AntAlert } from 'antd';
import Button from './Button.jsx';

// Khối báo lỗi khi tải dữ liệu thất bại, kèm nút thử lại.
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) {
  return (
    <AntAlert
      type="error"
      showIcon
      className={className}
      title={<span className="font-semibold">{title}</span>}
      description={
        <>
          {message && <p>{message}</p>}
          {onRetry && (
            <Button variant="secondary" className="mt-3" onClick={onRetry}>
              Try again
            </Button>
          )}
        </>
      }
    />
  );
}
