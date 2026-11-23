import { Button as AntButton } from 'antd';

const VARIANTS = {
  primary: { type: 'primary' },
  secondary: {},
  danger: { type: 'primary', danger: true },
};

const SIZES = { md: 'medium', sm: 'small' };

// Nút dùng chung. loading: hiện vòng xoay và tự khóa nút để không gửi hai lần.
// Mỗi màn hình chỉ nên có một nút primary (màu vàng).
export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  return (
    <AntButton
      {...VARIANTS[variant]}
      htmlType={type}
      size={SIZES[size] ?? SIZES.md}
      loading={loading}
      disabled={disabled || loading}
      block={fullWidth}
      className={className}
      {...props}
    >
      {children}
    </AntButton>
  );
}
