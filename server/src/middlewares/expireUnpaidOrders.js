import { expireUnpaidOrders as expireOrders } from '../services/payments.service.js';

// Hủy các đơn quá hạn thanh toán trước khi xử lý request (mục 11 của docs/api.md).
// Render gói Free ngủ khi không có người dùng, nên không dùng bộ đếm giờ chạy nền; thay vào đó
// các route cần dữ liệu đúng (danh sách và chi tiết đơn, tìm phòng, kiểm tra phòng trống,
// đặt phòng, thanh toán) khai báo middleware này. Không có đơn quá hạn thì chỉ tốn một câu SELECT.
const expireUnpaidOrders = async (req, res, next) => {
  await expireOrders();
  next();
};

export default expireUnpaidOrders;
