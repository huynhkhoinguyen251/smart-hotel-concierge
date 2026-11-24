import { useEffect } from 'react';
import { HOTEL_NAME } from '../config/hotel.js';

// Tiêu đề của tab trình duyệt: "My bookings | Smart Hotel Concierge".
// Rời trang thì trả về tên khách sạn, để trang sau (đang tải) không mang tiêu đề của trang trước.
export default function usePageTitle(title) {
  useEffect(() => {
    if (!title) return undefined;
    document.title = `${title} | ${HOTEL_NAME}`;
    return () => {
      document.title = HOTEL_NAME;
    };
  }, [title]);
}
