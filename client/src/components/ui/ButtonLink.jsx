import { Button as AntButton } from 'antd';
import { useHref, useLinkClickHandler } from 'react-router-dom';

const SIZES = { md: 'medium', sm: 'small' };

// Link trong ứng dụng có hình dáng của nút (vẫn là thẻ <a>, mở được ở tab mới).
// state: dữ liệu kèm theo khi chuyển trang, ví dụ { from } của trang đăng nhập.
export default function ButtonLink({
  to,
  state,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  children,
  ...props
}) {
  const href = useHref(to);
  const navigate = useLinkClickHandler(to, { state });

  return (
    <AntButton
      type={variant === 'primary' ? 'primary' : 'default'}
      size={SIZES[size] ?? SIZES.md}
      block={fullWidth}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        navigate(event);
      }}
      {...props}
    >
      {children}
    </AntButton>
  );
}
