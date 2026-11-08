# Smart Hotel Concierge

Web app đặt phòng khách sạn, dịch vụ khách sạn và dịch vụ du lịch. Đây là đồ án tốt nghiệp ngành IT, hạn nộp 04/12/2026.

## Tài liệu

- `docs/proposal.md`: tài liệu chuẩn về phạm vi, quy tắc nghiệp vụ và bảo mật. Đọc phần liên quan trước khi code một chức năng.
- `docs/planning.md`: danh sách công việc và tiến độ.
- `docs/entity-analysis.md`, `docs/erd.md`, `docs/erd.mmd`: thiết kế database.
- `docs/api.md`: danh sách API và quy ước phản hồi. Backend phải tuân theo tài liệu này.

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

## Kiến trúc backend: MVC kèm Service

Luồng xử lý: `routes` → `middlewares` và `validators` → `controllers` → `services` → `models` → MySQL.

| Tầng | Thư mục | Nhiệm vụ | Không được làm |
|---|---|---|---|
| Model | `server/src/models/*.model.js` | Câu lệnh SQL và chuyển đổi dữ liệu từ database | Chứa quy tắc nghiệp vụ, đọc `req`/`res` |
| View | `client/`, phản hồi JSON | Hiển thị dữ liệu | Truy cập database |
| Controller | `server/src/controllers/*.controller.js` | Nhận `req`, gọi service, gửi phản hồi | Chứa SQL hoặc quy tắc nghiệp vụ |
| Service | `server/src/services/*.service.js` | Quy tắc nghiệp vụ và transaction | Chứa SQL, đọc `req`/`res` |

- Chỉ `models` và `config/db.js` được import `pool`, trừ khi service cần `pool.getConnection()` để mở transaction.
- Hàm trong model nhận kết nối qua tham số cuối `conn = pool`, để dùng được trong transaction.
- Route chỉ khai báo địa chỉ và thứ tự middleware, không viết xử lý trong route.
- Mọi module mới phải đi đủ các tầng này.

## Vai trò của Claude Code

Claude Code viết code theo prompt và tài liệu đã duyệt. Phân tích, thiết kế và review được làm ở Claude app.

- Không tự đổi thiết kế database, thêm thư viện lớn hoặc đổi phạm vi. Nếu thấy cần, hãy nêu lý do và hỏi trước.
- Không sửa `docs/proposal.md` trừ khi được yêu cầu.
- Chỉ làm đúng phần được giao, không làm trước các chức năng khác.
- Không làm tính năng Optional khi chưa được yêu cầu rõ ràng.
- Chỉ commit hoặc push khi được yêu cầu.
- Không xóa database hoặc xóa bảng khi chưa được xác nhận.
- Trả lời và báo cáo cho tôi bằng tiếng Việt. Còn nội dung trong source code theo mục Ngôn ngữ bên dưới.

## Ngôn ngữ trong source code (yêu cầu của trường)

Source code nộp cho trường phải bằng **tiếng Anh**, kể cả mọi chữ hiển thị trên web.

| Nội dung | Ngôn ngữ |
|---|---|
| Tên biến, hàm, file, bảng, cột | Tiếng Anh |
| `message`, `reason`, thông báo lỗi và mọi chữ trên giao diện | Tiếng Anh |
| Dữ liệu mẫu trong `database/seed.sql` | Tiếng Anh |
| README trong `server/`, `client/`, `database/` và file Postman | Tiếng Anh |
| Comment trong code (`//`, `--`) | Được dùng tiếng Việt |
| Tài liệu cá nhân trong `docs/` và file `CLAUDE.md` | Được dùng tiếng Việt |

- Tên riêng tiếng Việt viết **không dấu**, ví dụ `Da Nang`, `Hoi An`, `Nguyen Van An`, `Pho Bo`.
- Không được có chữ tiếng Việt có dấu trong chuỗi hiển thị, dữ liệu mẫu và README.

## Quy tắc code

- Hai vai trò: `user` và `admin`. Kiểm tra quyền ở backend, và người dùng chỉ được truy cập dữ liệu của chính mình.
- Mọi câu lệnh SQL phải dùng tham số hóa, và kiểm tra dữ liệu đầu vào ở backend.
- Đặt phòng phải chạy trong transaction để chống đặt trùng phòng (xem `docs/proposal.md`, Mục 5).
- Thông tin bí mật để trong `.env`, không commit. Tạo `.env.example` với giá trị mẫu.
- Mọi thay đổi cấu trúc database phải được cập nhật vào `database/schema.sql`.
- Mỗi API phải kiểm thử được bằng Postman, và cho biết cách test sau khi viết xong.
