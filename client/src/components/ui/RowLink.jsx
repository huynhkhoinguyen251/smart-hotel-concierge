import { Link } from 'react-router-dom';

// Link tiêu đề của một dòng danh sách. Vùng bấm phủ cả dòng (phần tử cha cần lớp "group relative"),
// nhưng bàn phím và trình đọc màn hình chỉ gặp một link.
export default function RowLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sea group-hover:text-sea-hover group-hover:underline after:absolute after:inset-0 after:rounded-control focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-sea"
    >
      {children}
    </Link>
  );
}
