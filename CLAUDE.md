# Smart Hotel Concierge

Web app đặt phòng khách sạn, dịch vụ khách sạn và dịch vụ du lịch. Đây là đồ án tốt nghiệp ngành IT, hạn nộp 04/12/2026.

## Tài liệu

- `docs/proposal.md`: tài liệu chuẩn về phạm vi, quy tắc nghiệp vụ và bảo mật. Đọc phần liên quan trước khi code một chức năng.
- `docs/planning.md`: danh sách công việc và tiến độ.
- Tài liệu thiết kế database và API sẽ được đặt trong `docs/`. Hãy tuân theo chúng khi đã có.

## Công nghệ

- Frontend: ReactJS + Vite, JavaScript, Tailwind CSS, Axios, Chart.js
- Backend: Node.js, Express.js, mysql2, JWT, Bcrypt, Multer
- Database: MySQL 8.0, tên database `smart_hotel_concierge`
- Môi trường: Windows, Node.js v24.11.0, npm 11.6.1

## Cấu trúc thư mục

- `client/`: frontend
- `server/`: backend
- `database/`: script SQL (`schema.sql`, `seed.sql`)
- `docs/`: tài liệu

## Vai trò của Claude Code

Claude Code viết code theo prompt và tài liệu đã duyệt. Phân tích, thiết kế và review được làm ở Claude app.

- Không tự đổi thiết kế database, thêm thư viện lớn hoặc đổi phạm vi. Nếu thấy cần, hãy nêu lý do và hỏi trước.
- Không sửa `docs/proposal.md` trừ khi được yêu cầu.
- Chỉ làm đúng phần được giao, không làm trước các chức năng khác.
- Không làm tính năng Optional khi chưa được yêu cầu rõ ràng.
- Chỉ commit hoặc push khi được yêu cầu.
- Không xóa database hoặc xóa bảng khi chưa được xác nhận.
- Trả lời bằng tiếng Việt. Tên biến, hàm, bảng và cột dùng tiếng Anh.

## Quy tắc code

- Hai vai trò: `user` và `admin`. Kiểm tra quyền ở backend, và người dùng chỉ được truy cập dữ liệu của chính mình.
- Mọi câu lệnh SQL phải dùng tham số hóa, và kiểm tra dữ liệu đầu vào ở backend.
- Đặt phòng phải chạy trong transaction để chống đặt trùng phòng (xem `docs/proposal.md`, Mục 5).
- Thông tin bí mật để trong `.env`, không commit. Tạo `.env.example` với giá trị mẫu.
- Mọi thay đổi cấu trúc database phải được cập nhật vào `database/schema.sql`.
- Mỗi API phải kiểm thử được bằng Postman, và cho biết cách test sau khi viết xong.
