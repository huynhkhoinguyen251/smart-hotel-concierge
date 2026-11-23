import { Button as AntButton } from 'antd';
import { useHref, useLinkClickHandler } from 'react-router-dom';

// Trang "không tìm thấy" của một mục cụ thể (đơn, yêu cầu, dịch vụ...), kèm link quay lại.
export default function NotFoundView({ title, message, to, linkLabel }) {
  const href = useHref(to);
  const handleClick = useLinkClickHandler(to);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="text-5xl font-bold text-sea">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-ink-soft">{message}</p>
      <AntButton type="primary" href={href} onClick={handleClick} className="mt-8">
        {linkLabel}
      </AntButton>
    </div>
  );
}
