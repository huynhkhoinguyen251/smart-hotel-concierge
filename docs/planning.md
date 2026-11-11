# Planning dự án Smart Hotel Concierge

Tài liệu chuẩn về phạm vi và nghiệp vụ: [proposal.md](proposal.md).

## Môi trường

| Thành phần | Phiên bản / giá trị |
|---|---|
| OS | Windows |
| Code editor | Visual Studio Code |
| Node.js | v24.11.0 |
| npm | 11.6.1 |
| Database | MySQL 8.0 |
| Tên database | `smart_hotel_concierge` |
| Repository | `smart-hotel-concierge` |
| Branch | `main` |

## Quy trình làm việc

| Công việc | Thực hiện ở đâu |
|---|---|
| Phân tích, thiết kế, viết prompt, review code | Claude app |
| Viết code | Claude Code trong VS Code |
| Duyệt thiết kế, chạy thử, commit và push | Bạn |

## Lịch làm việc

**Hạn nộp: 04/12/2026.** Làm phần cơ bản trước, phần nâng cao làm sau.

| Thời gian (2026) | Công việc |
|---|---|
| 07/11–09/11 | Thiết kế database, script SQL, danh sách API, wireframe |
| 10/11–12/11 | Khởi tạo dự án, Authentication, phân quyền, profile, deploy thử |
| 13/11–15/11 | Quản lý phòng, trang chủ, danh sách và chi tiết phòng, tìm kiếm |
| 16/11–18/11 | Kiểm tra phòng trống, đặt phòng, lịch sử, hủy và sửa đặt phòng |
| 19/11–20/11 | Dịch vụ khách sạn |
| 21/11–22/11 | Đặt đồ ăn và dịch vụ du lịch |
| 23/11–24/11 | Support ticket, đánh giá, Admin Dashboard |
| 25/11–27/11 | Tính năng Extended; Optional nếu còn thời gian và bạn đồng ý |
| 28/11–30/11 | Test toàn bộ, sửa lỗi, deploy chính thức |
| 01/12–03/12 | Báo cáo, tài liệu hướng dẫn, slide, demo |
| 04/12 | Nộp đồ án |

## Tổng quan tiến độ

| Giai đoạn | Trạng thái |
|---|---|
| Idea & Proposal | Hoàn thành |
| Environment Setup | Hoàn thành |
| Giai đoạn 1: Database Design | Hoàn thành |
| Giai đoạn 2: Backend | Đang làm |
| Giai đoạn 3: Frontend | Chưa bắt đầu |
| Giai đoạn 4: Integration | Chưa bắt đầu |
| Giai đoạn 5: Advanced Features | Chưa bắt đầu |
| Giai đoạn 6: Testing & Deployment | Chưa bắt đầu |

## Đã hoàn thành

- [x] Xác định ý tưởng project
- [x] Xây dựng danh sách chức năng
- [x] Viết Project Proposal
- [x] Chọn Technology Stack
- [x] Tạo GitHub Repository
- [x] Kết nối GitHub với VS Code
- [x] Cài đặt Node.js
- [x] Kiểm tra npm
- [x] Cài đặt MySQL Server
- [x] Cài đặt MySQL Workbench
- [x] Kết nối Local MySQL Server
- [x] Tạo database `smart_hotel_concierge`

## Giai đoạn 1: Database Design

Thiết kế cho cả tính năng Core và Extended, kể cả những phần sẽ code sau.

- [x] Phân tích các thực thể trong hệ thống
- [x] Thiết kế ERD (Entity Relationship Diagram)
- [x] Xác định Primary Key và Foreign Key
- [x] Xác định quan hệ One-to-One, One-to-Many, Many-to-Many
- [x] Thiết kế các bảng database
- [x] Viết script tạo bảng và tạo các bảng trong MySQL
- [x] Viết script và tạo dữ liệu mẫu (Seed Data)

## Giai đoạn 2: Backend Development

Test từng API bằng Postman ngay sau khi viết xong.

- [x] Tạo thư mục `server`
- [x] Khởi tạo Node.js project
- [x] Cài đặt Express.js
- [x] Cài đặt thư viện kết nối MySQL (`mysql2`)
- [x] Cấu hình Environment Variables (`.env`)
- [x] Kết nối Backend với MySQL
- [x] Xây dựng cấu trúc thư mục Backend
- [x] Lập danh sách API trong `docs/api.md`
- [x] Xây dựng Authentication API (đã test bằng Postman)
- [x] Xây dựng Authorization (User/Admin): đã test cùng API admin quản lý phòng
- [x] Deploy thử sau khi xong Authentication: backend chạy ở `https://smart-hotel-concierge-4yc0.onrender.com` (nhánh `database-design`) ngày 08/11/2026; đã test health, danh sách phòng và đăng nhập
- [x] Xây dựng Room Management API (công khai và admin, đã test bằng Postman)
- [x] Xây dựng Room Booking API, có chống đặt trùng phòng (user và admin, đã test bằng Postman)
- [x] Xây dựng Hotel Service API (user và admin, đã test bằng Postman); seed: đơn 3 kéo dài đến 06/12/2026 để test và demo
- [x] Xây dựng Food Ordering API (user và admin, đã test bằng Postman); đặt múi giờ `+07:00` cho kết nối database
- [ ] Xây dựng Tourism API (motorbike, airport pickup, local tour)
- [ ] Xây dựng Support Ticket API
- [ ] Xây dựng Review API
- [ ] Xây dựng Admin API
- [x] Xây dựng chức năng upload ảnh

## Giai đoạn 3: Frontend Development

- [ ] Khởi tạo ReactJS + Vite
- [ ] Cài đặt Tailwind CSS
- [ ] Thiết kế giao diện Home Page
- [ ] Thiết kế Login/Register
- [ ] Thiết kế Room Listing
- [ ] Thiết kế Room Detail
- [ ] Thiết kế Booking Page
- [ ] Thiết kế Service Booking
- [ ] Thiết kế Food Ordering
- [ ] Thiết kế Tourism Service
- [ ] Thiết kế Support Ticket
- [ ] Thiết kế User Profile
- [ ] Thiết kế Admin Dashboard

## Giai đoạn 4: Integration

Làm song song với Giai đoạn 2 và 3: mỗi chức năng đi lần lượt từ API, giao diện đến kết nối và test, rồi mới sang chức năng tiếp theo.

- [ ] Kết nối Frontend với Backend
- [ ] Tích hợp Authentication
- [ ] Tích hợp Room Booking
- [ ] Tích hợp Service Booking
- [ ] Tích hợp Food Ordering
- [ ] Tích hợp Tourism Service
- [ ] Tích hợp Support Ticket và Review
- [ ] Hiển thị dữ liệu từ MySQL lên giao diện
- [ ] Kiểm tra phân quyền User/Admin

## Giai đoạn 5: Advanced Features

Chỉ bắt đầu khi toàn bộ tính năng Core đã chạy ổn.

**Extended (đã lên kế hoạch):**

- [ ] Notification System
- [ ] Payment Simulation
- [ ] Invoice Generation
- [ ] Voucher & Discount
- [ ] So sánh phòng và dịch vụ
- [ ] Smart Recommendation

**Optional (chỉ làm khi còn thời gian; phải hỏi bạn trước khi bắt đầu):**

- [ ] Voice Search
- [ ] Đăng nhập bằng Google
- [ ] Online check-in và check-out
- [ ] Chat real-time với lễ tân
- [ ] Đa ngôn ngữ (Anh, Việt)
- [ ] QR code gọi dịch vụ nhanh
- [ ] AI chatbot

## Giai đoạn 6: Testing & Deployment

- [ ] Test toàn bộ API bằng Postman
- [ ] Test các chức năng Frontend
- [ ] Kiểm tra bảo mật cơ bản
- [ ] Fix bugs
- [ ] Deploy Frontend
- [ ] Deploy Backend
- [ ] Cấu hình Database production
- [ ] Viết tài liệu hướng dẫn sử dụng
- [ ] Hoàn thiện báo cáo tốt nghiệp
- [ ] Chuẩn bị slide và demo
- [ ] Cập nhật lại proposal cho khớp với sản phẩm cuối

## Thay đổi so với planning và proposal ban đầu

| Nội dung | Ban đầu | Hiện tại |
|---|---|---|
| Frontend | ReactJS hoặc VueJS | ReactJS + Vite |
| UI | Bootstrap hoặc Tailwind | Tailwind CSS |
| Database | MongoDB hoặc MySQL | MySQL 8.0 |
| Vai trò | Lễ tân và quản lý chưa rõ vai trò | Chỉ có `user` và `admin`; lễ tân và quản lý dùng `admin` |
| Liên hệ lễ tân | Chat hoặc support ticket | Support ticket là Core; chat real-time là Optional |
| Review & Rating | Nằm ở cả Giai đoạn 2 và 5 | Core, làm ở Giai đoạn 2–4 |
| Local Tour Booking | Nằm ở Giai đoạn 5 của planning | Core, vì là một phần của tên đề tài |
| Tiến trình | 12 tuần; làm giao diện trước, backend sau | Lịch đến 04/12/2026; làm trọn từng chức năng; deploy thử trong đợt 10–12/11 |
| Voice Search | Làm nếu có thể | Optional |
| Đánh giá | Phòng và dịch vụ | Phòng, dịch vụ và đơn đồ ăn; đánh giá đồ ăn hiện ở mục chung trên trang thực đơn |
| Đăng nhập Google | Chưa có | Optional |
| Kiến trúc backend | Chưa quy định | MVC kèm tầng Service |
| Ngôn ngữ source code | Chưa quy định | Tiếng Anh, kể cả giao diện và dữ liệu mẫu; comment và `docs/` được dùng tiếng Việt |
| Hosting (deploy thử) | Chưa chọn | Backend trên Render (gói Free), database trên TiDB Cloud Starter (miễn phí, tương thích MySQL). Aiven đã ngừng gói MySQL miễn phí từ 11/2026. Đã nạp `schema.sql` và `seed.sql` lên TiDB `8.0.11-TiDB-v8.5.3-serverless` ngày 08/11/2026; khóa ngoại được kiểm tra và hoạt động, còn `CHECK` không được TiDB kiểm tra nên do backend đảm nhiệm |
| Thuê xe máy | Chưa có quy tắc duyệt | Admin duyệt hoặc từ chối, và nhập biển số khi duyệt |
| Upload ảnh | Cloudinary hoặc local | Multer, lưu local; chuyển Cloudinary nếu hosting cần |
| Nội dung mới | Chưa có | Mức ưu tiên, quy tắc nghiệp vụ, bảo mật, danh sách API, Support Ticket API |
