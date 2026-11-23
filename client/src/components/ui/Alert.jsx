import { Alert as AntAlert } from 'antd';

// Hộp thông báo. Không có nội dung thì không hiện gì.
export default function Alert({ type = 'info', children, className = '' }) {
  if (!children) {
    return null;
  }
  return (
    <AntAlert
      type={type}
      role={type === 'error' ? 'alert' : 'status'}
      showIcon
      title={children}
      className={className}
    />
  );
}
