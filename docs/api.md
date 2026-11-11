# Danh sách API

Dựa trên [proposal.md](proposal.md) và [erd.md](erd.md). Tài liệu này chỉ gồm tính năng Core và Extended; tính năng Optional chỉ được thêm khi đã được đồng ý.

## Quy ước chung

### Địa chỉ và quyền truy cập

- Mọi API bắt đầu bằng `/api`, ví dụ `POST /api/auth/login`.
- Dữ liệu gửi và nhận ở dạng JSON, trừ API upload ảnh.
- API cần đăng nhập nhận token trong header: `Authorization: Bearer <token>`.

| Quyền | Ý nghĩa |
|---|---|
| Public | Không cần đăng nhập |
| User | Đã đăng nhập, và chỉ truy cập dữ liệu của chính mình |
| Admin | Đã đăng nhập với vai trò `admin`; mọi API `/admin/...` đều cần quyền này |

### Định dạng phản hồi

Thành công:

```json
{ "success": true, "data": {}, "message": "Room booked successfully" }
```

Danh sách có phân trang, với tham số `?page=1&limit=10`:

```json
{ "success": true, "data": [], "pagination": { "page": 1, "limit": 10, "total": 42 } }
```

Thất bại:

```json
{ "success": false, "message": "This room is already booked for the selected dates" }
```

Mọi `message`, `reason` và dữ liệu hiển thị cho người dùng phải bằng tiếng Anh (xem mục Ngôn ngữ trong `CLAUDE.md`).

### Mã trạng thái

| Mã | Khi nào dùng |
|---|---|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `400` | Dữ liệu gửi lên không hợp lệ |
| `401` | Chưa đăng nhập hoặc token không hợp lệ |
| `403` | Không có quyền, hoặc truy cập dữ liệu của người khác |
| `404` | Không tìm thấy |
| `409` | Xung đột, ví dụ trùng phòng, email đã dùng, hoặc xóa dữ liệu đang được đơn khác dùng |
| `500` | Lỗi phía server |

### Quy tắc bắt buộc

- Backend tự lấy giá từ database và tự tính tổng tiền; không tin giá do frontend gửi lên.
- `user_id` lấy từ token, không lấy từ dữ liệu gửi lên.
- Không bao giờ trả `password_hash`.
- Trạng thái chỉ được đổi theo luồng ở Mục 5 của `proposal.md`.
- Khi khai báo route, đặt địa chỉ cố định trước địa chỉ có tham số, ví dụ `/rooms/compare` trước `/rooms/:id`.

## Core

### 1. Xác thực và hồ sơ

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | Public | Đăng ký; luôn tạo vai trò `user` |
| POST | `/auth/login` | Public | Đăng nhập, trả token và thông tin người dùng |
| GET | `/users/me` | User | Xem hồ sơ |
| PUT | `/users/me` | User | Sửa họ tên, số điện thoại |
| PUT | `/users/me/password` | User | Đổi mật khẩu; phải nhập mật khẩu cũ |

- Đăng xuất do frontend thực hiện bằng cách xóa token, nên không cần API.
- Sai email và sai mật khẩu trả cùng một thông báo. Tài khoản có `is_active = false` không đăng nhập được.

### 2. Phòng

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/rooms` | Public | Tìm kiếm và lọc phòng |
| GET | `/rooms/:id` | Public | Chi tiết phòng: giá, loại phòng, ảnh, tiện nghi, điểm đánh giá |
| GET | `/rooms/:id/availability` | Public | Kiểm tra phòng trống theo `check_in`, `check_out` |
| GET | `/room-types` | Public | Danh sách loại phòng |
| GET | `/amenities` | Public | Danh sách tiện nghi |

Tham số của `GET /rooms`: `check_in`, `check_out`, `guests`, `room_type_id`, `min_price`, `max_price`, `amenity_ids`, `sort`, `page`, `limit`. Chỉ trả phòng có `status = available`; nếu có ngày thì loại các phòng đã bị đặt.

### 3. Đặt phòng

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/bookings` | User | Đặt phòng; `room_id`, `check_in`, `check_out`, `guests` |
| GET | `/bookings` | User | Lịch sử đặt phòng của tôi |
| GET | `/bookings/:id` | User | Chi tiết đơn |
| PUT | `/bookings/:id` | User | Đổi ngày khi đơn còn `pending`; kiểm tra lại phòng trống |
| PATCH | `/bookings/:id/cancel` | User | Hủy khi đơn `pending` hoặc `confirmed`, và còn ít nhất 24 giờ trước 14:00 ngày check-in; tự hủy các yêu cầu dịch vụ `pending`, `confirmed` của đơn |

Lưu ý: `POST /bookings` và `PUT /bookings/:id` phải kiểm tra phòng trống và ghi dữ liệu trong cùng một transaction. Số khách không được vượt `capacity` của loại phòng.

### 4. Dịch vụ khách sạn

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/services` | Public | Danh sách dịch vụ đang hoạt động; lọc bằng `category` |
| GET | `/services/:id` | Public | Chi tiết dịch vụ |
| POST | `/service-bookings` | User | Đặt dịch vụ; `booking_id`, `service_id`, `scheduled_at`, `quantity`, `note` |
| GET | `/service-bookings` | User | Yêu cầu dịch vụ của tôi |
| GET | `/service-bookings/:id` | User | Chi tiết yêu cầu |
| PATCH | `/service-bookings/:id/cancel` | User | Hủy khi còn `pending` |

Lưu ý: `booking_id` phải thuộc người dùng và đúng trạng thái theo Mục 5 của proposal. API này chỉ nhận `breakfast`, `buffet`, `massage`, `laundry`, `housekeeping`. `scheduled_at` phải ở tương lai và nằm trong thời gian lưu trú: từ 14:00 ngày nhận phòng đến hết ngày trả phòng.

### 5. Đồ ăn và đồ uống

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/menu-items` | Public | Thực đơn; lọc bằng `category` |
| GET | `/menu-items/:id` | Public | Chi tiết món |
| POST | `/food-orders` | User | Đặt món; `booking_id`, `items` (`menu_item_id`, `quantity`), `note` |
| GET | `/food-orders` | User | Đơn đồ ăn của tôi |
| GET | `/food-orders/:id` | User | Chi tiết đơn và các món |
| PATCH | `/food-orders/:id/cancel` | User | Hủy khi còn `pending` |

Lưu ý: `booking_id` phải là đơn `checked_in` của người dùng. Món có `is_available = false` không đặt được. Đơn và các món được lưu trong cùng một transaction.

### 6. Du lịch

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/tours` | Public | Danh sách tour đang hoạt động |
| GET | `/tours/:id` | Public | Chi tiết tour |
| POST | `/tour-bookings` | User | Đặt tour; `tour_id`, `tour_date`, `participants`, `note` |
| GET | `/tour-bookings` | User | Đơn tour của tôi |
| GET | `/tour-bookings/:id` | User | Chi tiết đơn |
| PATCH | `/tour-bookings/:id/cancel` | User | Hủy khi còn `pending` |
| POST | `/transport-bookings` | User | Thuê xe máy, đón sân bay hoặc xe đưa đón |
| GET | `/transport-bookings` | User | Đơn vận chuyển của tôi; có `vehicle_plate` khi đã được nhập |
| GET | `/transport-bookings/:id` | User | Chi tiết đơn |
| PATCH | `/transport-bookings/:id/cancel` | User | Hủy khi còn `pending` |

Dữ liệu của `POST /transport-bookings`: `service_id`, `start_at`, `end_at`, `pickup_location`, `dropoff_location`, `flight_number`, `quantity`, `note`. API này chỉ nhận `motorbike_rental`, `airport_pickup`, `shuttle`. Khi thuê xe máy, `quantity` phải bằng 1 và phải có `end_at`.

Cách tính tiền và giới hạn:

| Loại | `quantity` | Tổng tiền | Bắt buộc thêm |
|---|---|---|---|
| `motorbike_rental` | Luôn là 1 | Giá × số ngày thuê (mỗi 24 giờ bắt đầu tính là 1 ngày, từ 1 đến 30 ngày) | `end_at` sau `start_at` |
| `airport_pickup` | Số xe, 1–5 | Giá × số xe | `flight_number`; không gửi `end_at` |
| `shuttle` | Số người, 1–20 | Giá × số người | Không gửi `end_at` |
| Tour | `participants` 1–20 | Giá × số người | `tour_date` |

`start_at` và `tour_date` phải ở tương lai và không quá 1 năm. `pickup_location` và `dropoff_location` bắt buộc với cả 3 loại vận chuyển. Admin nhập `vehicle_plate` khi duyệt (`confirmed`): bắt buộc với thuê xe máy, không bắt buộc với đón sân bay và xe đưa đón.

### 7. Hỗ trợ

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/tickets` | User | Tạo yêu cầu; `subject`, `message` |
| GET | `/tickets` | User | Yêu cầu của tôi |
| GET | `/tickets/:id` | User | Chi tiết và các tin nhắn |
| POST | `/tickets/:id/messages` | User | Gửi thêm tin nhắn; yêu cầu chưa `resolved` |

Lưu ý: yêu cầu và tin nhắn đầu tiên được lưu trong cùng một transaction. Khi admin trả lời một yêu cầu đang `open`, yêu cầu tự chuyển sang `in_progress`. Yêu cầu đã `resolved` thì cả user lẫn admin đều không gửi thêm tin nhắn được. Admin đổi trạng thái chỉ theo một chiều: `open` → `in_progress` → `resolved`. Mỗi tin nhắn mới cập nhật `updated_at` của yêu cầu, và danh sách sắp xếp theo `updated_at` mới nhất.

### 8. Đánh giá

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/reviews` | User | Tạo đánh giá; `rating`, `comment`, và đúng một khóa đến đơn |
| GET | `/reviews` | User | Đánh giá của tôi |
| GET | `/rooms/:id/reviews` | Public | Đánh giá của một phòng |
| GET | `/services/:id/reviews` | Public | Đánh giá của một dịch vụ |
| GET | `/tours/:id/reviews` | Public | Đánh giá của một tour |
| GET | `/food-reviews` | Public | Mục chung "Đánh giá đồ ăn" ở trang thực đơn; trả họ tên người đánh giá, điểm, nhận xét, ngày và điểm trung bình |

Lưu ý: `GET /food-reviews` lấy các dòng trong `reviews` có `food_order_id` khác NULL, không theo từng món và không cần đổi database. Khóa đến đơn là một trong `booking_id`, `service_booking_id`, `food_order_id`, `tour_booking_id`, `transport_booking_id`. Đơn phải thuộc người dùng và đã hoàn thành. Đánh giá lại cùng một đơn trả `409`.

### 9. Quản trị

**Người dùng**

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/users` | Danh sách; tìm bằng `search`, lọc bằng `role`, `is_active` |
| GET | `/admin/users/:id` | Chi tiết |
| PATCH | `/admin/users/:id/status` | Khóa hoặc mở tài khoản; không tự khóa chính mình |
| PATCH | `/admin/users/:id/role` | Đổi vai trò; không tự đổi vai trò của chính mình |

**Upload ảnh**

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/admin/uploads` | Upload một ảnh (`multipart/form-data`), trả `image_url`; giới hạn loại file và dung lượng |

Ảnh đã upload được phục vụ tại `GET /uploads/:filename`, ngoài `/api`, không cần đăng nhập.

**Phòng**

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/rooms` | Tất cả phòng, kể cả phòng `maintenance`, `inactive` |
| POST | `/admin/rooms` | Thêm phòng |
| PUT | `/admin/rooms/:id` | Sửa phòng |
| PATCH | `/admin/rooms/:id/status` | Đổi `available`, `maintenance`, `inactive` |
| DELETE | `/admin/rooms/:id` | Xóa; trả `409` nếu phòng đã có đơn |
| POST | `/admin/rooms/:id/images` | Thêm ảnh; `image_url`, `is_primary` |
| PATCH | `/admin/room-images/:id/primary` | Đặt làm ảnh chính |
| DELETE | `/admin/room-images/:id` | Xóa ảnh |
| POST | `/admin/room-types` | Thêm loại phòng, kèm giá và `amenity_ids` |
| PUT | `/admin/room-types/:id` | Sửa loại phòng, giá và tiện nghi |
| DELETE | `/admin/room-types/:id` | Xóa; trả `409` nếu còn phòng thuộc loại này |
| POST | `/admin/amenities` | Thêm tiện nghi |
| PUT | `/admin/amenities/:id` | Sửa tiện nghi |
| DELETE | `/admin/amenities/:id` | Xóa tiện nghi |

**Đơn đặt phòng**

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/bookings` | Tất cả đơn; lọc bằng `status`, `room_id`, `user_id`, ngày |
| GET | `/admin/bookings/:id` | Chi tiết đơn |
| PATCH | `/admin/bookings/:id/status` | Đổi trạng thái theo luồng; hủy được cả khi còn dưới 24 giờ |

**Danh mục dịch vụ, thực đơn và tour**

Không xóa được dữ liệu đã có đơn (trả `409`); khi đó dùng API sửa để tắt `is_active` hoặc `is_available`.

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/services` | Tất cả dịch vụ, kể cả đã tắt |
| POST | `/admin/services` | Thêm dịch vụ |
| PUT | `/admin/services/:id` | Sửa hoặc tắt dịch vụ |
| DELETE | `/admin/services/:id` | Xóa dịch vụ |
| GET | `/admin/menu-items` | Tất cả món, kể cả đã tắt |
| POST | `/admin/menu-items` | Thêm món |
| PUT | `/admin/menu-items/:id` | Sửa hoặc tắt món |
| DELETE | `/admin/menu-items/:id` | Xóa món |
| GET | `/admin/tours` | Tất cả tour, kể cả đã tắt |
| POST | `/admin/tours` | Thêm tour |
| PUT | `/admin/tours/:id` | Sửa hoặc tắt tour |
| DELETE | `/admin/tours/:id` | Xóa tour |

**Các yêu cầu từ khách**

Trạng thái đổi theo luồng ở Mục 5 của proposal. Admin hủy được khi đơn còn `pending` hoặc `confirmed`.

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/service-bookings` | Tất cả yêu cầu dịch vụ; lọc bằng `status`, `category` |
| GET | `/admin/service-bookings/:id` | Chi tiết yêu cầu |
| PATCH | `/admin/service-bookings/:id/status` | Đổi trạng thái |
| GET | `/admin/food-orders` | Tất cả đơn đồ ăn; lọc bằng `status` |
| GET | `/admin/food-orders/:id` | Chi tiết đơn |
| PATCH | `/admin/food-orders/:id/status` | Đổi trạng thái |
| GET | `/admin/tour-bookings` | Tất cả đơn tour; lọc bằng `status` |
| GET | `/admin/tour-bookings/:id` | Chi tiết đơn |
| PATCH | `/admin/tour-bookings/:id/status` | Đổi trạng thái |
| GET | `/admin/transport-bookings` | Tất cả đơn vận chuyển; lọc bằng `status`, `category` |
| GET | `/admin/transport-bookings/:id` | Chi tiết đơn |
| PATCH | `/admin/transport-bookings/:id/status` | Duyệt hoặc từ chối; `status`, `vehicle_plate` |
| GET | `/admin/tickets` | Tất cả yêu cầu hỗ trợ; lọc bằng `status` |
| GET | `/admin/tickets/:id` | Chi tiết và các tin nhắn |
| POST | `/admin/tickets/:id/messages` | Trả lời khách |
| PATCH | `/admin/tickets/:id/status` | Đổi trạng thái |

Lưu ý: khi duyệt thuê xe máy (`confirmed`) mà thiếu `vehicle_plate` thì trả `400`.

**Đánh giá và thống kê**

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/reviews` | Tất cả đánh giá; lọc bằng `rating` |
| GET | `/admin/stats/overview` | Tổng số đơn đặt phòng, doanh thu, số người dùng |
| GET | `/admin/stats/revenue` | Doanh thu theo tháng, dùng để vẽ biểu đồ |
| GET | `/admin/stats/top-rooms` | Các phòng được đặt nhiều nhất |
| GET | `/admin/stats/top-services` | Các dịch vụ được dùng nhiều nhất |
| GET | `/admin/stats/feedback` | Điểm trung bình và số đánh giá theo từng mức sao |

Doanh thu được tính từ `total_price` của đơn đặt phòng `checked_out` và các đơn dịch vụ, đồ ăn, tour, vận chuyển `completed`. Nhờ đó, thống kê chạy được ngay cả khi chưa làm phần thanh toán giả lập.

## Extended

Chỉ làm sau khi toàn bộ phần Core đã chạy ổn.

### 10. Thông báo

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/notifications` | User | Thông báo của tôi, kèm số chưa đọc |
| PATCH | `/notifications/:id/read` | User | Đánh dấu đã đọc |
| PATCH | `/notifications/read-all` | User | Đánh dấu tất cả đã đọc |

Thông báo được backend tự tạo khi trạng thái đơn thay đổi, nên không có API tạo thông báo.

### 11. Thanh toán giả lập và hóa đơn

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/payments` | User | Thanh toán giả lập; `method` và đúng một khóa đến đơn |
| GET | `/payments` | User | Thanh toán của tôi |
| GET | `/payments/:id` | User | Chi tiết thanh toán |
| GET | `/payments/:id/invoice` | User | Hóa đơn của thanh toán |
| GET | `/admin/payments` | Admin | Tất cả thanh toán; lọc bằng `status` |
| PATCH | `/admin/payments/:id/refund` | Admin | Đánh dấu đã hoàn tiền |

Lưu ý: số tiền do backend lấy từ đơn. Hóa đơn được tạo tự động khi thanh toán thành công. Không xử lý tiền thật.

### 12. Voucher

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/vouchers/validate` | User | Kiểm tra mã và tính số tiền giảm; `code`, `amount` |
| GET | `/admin/vouchers` | Admin | Danh sách voucher |
| POST | `/admin/vouchers` | Admin | Thêm voucher |
| PUT | `/admin/vouchers/:id` | Admin | Sửa hoặc tắt voucher |
| DELETE | `/admin/vouchers/:id` | Admin | Xóa; trả `409` nếu đã được dùng |

Khi làm phần này, `POST /bookings` và `POST /food-orders` nhận thêm `voucher_code`. Backend kiểm tra lại mã, tính giảm giá và tăng `used_count` trong cùng transaction với đơn.

### 13. So sánh và gợi ý

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/rooms/compare?ids=1,2,3` | Public | So sánh phòng theo giá, tiện nghi và điểm đánh giá |
| GET | `/services/compare?ids=1,2,3` | Public | So sánh dịch vụ theo giá và điểm đánh giá |
| GET | `/recommendations` | User | Gợi ý phòng và dịch vụ theo quy tắc: lịch sử đặt, điểm đánh giá, độ phổ biến |
