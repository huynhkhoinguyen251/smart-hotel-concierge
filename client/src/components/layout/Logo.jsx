import { Link } from 'react-router-dom';
import { HOTEL_NAME } from '../../config/hotel.js';

// Tên khách sạn bằng chữ, dẫn về trang chủ (khách) hoặc trang tổng quan (admin).
export default function Logo({ to = '/', onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-base leading-tight font-bold tracking-tight text-ink hover:text-sea sm:text-lg"
    >
      {HOTEL_NAME}
    </Link>
  );
}
