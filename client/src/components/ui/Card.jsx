import { Card as AntCard } from 'antd';

// Phần thân của antd Card dùng display: contents, nên className bố cục của nơi gọi (flex, gap, padding)
// tác động thẳng lên nội dung như trước.
const CLASS_NAMES = { body: 'contents before:hidden after:hidden' };

// Khung trắng bo góc, dùng cho form và các khối nội dung. Không lồng Card trong Card.
export default function Card({ children, className = '' }) {
  return (
    <AntCard classNames={CLASS_NAMES} className={`p-6 ${className}`}>
      {children}
    </AntCard>
  );
}
