import ButtonLink from './ButtonLink.jsx';
import PlainMessage from './PlainMessage.jsx';

// Trang "không tìm thấy" của một mục cụ thể (đơn, yêu cầu, dịch vụ...), kèm link quay lại.
export default function NotFoundView({ title, message, to, linkLabel }) {
  return <PlainMessage title={title} message={message} action={<ButtonLink to={to}>{linkLabel}</ButtonLink>} />;
}
