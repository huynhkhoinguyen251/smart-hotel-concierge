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
- Tài khoản `admin` không được tạo đơn hay yêu cầu của khách: `POST /bookings`, `/service-bookings`, `/food-orders`, `/tour-bookings`, `/transport-bookings`, `/tickets`, `/reviews` trả `403` "Admin accounts cannot make guest bookings or requests". Các API xem dữ liệu của chính mình vẫn dùng được.
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
| POST | `/bookings` | User | Đặt phòng; `room_id`, `check_in`, `check_out`, `guests`. Đơn `pending`, kèm thanh toán QR `unpaid` (mục 11) |
| GET | `/bookings` | User | Lịch sử đặt phòng của tôi |
| GET | `/bookings/:id` | User | Chi tiết đơn |
| PUT | `/bookings/:id` | User | Đổi ngày khi đơn còn `pending`; kiểm tra lại phòng trống; số tiền thanh toán chưa trả đổi theo tổng mới, hạn thanh toán không được gia hạn |
| PATCH | `/bookings/:id/cancel` | User | Hủy khi đơn `pending` hoặc `confirmed`, và còn ít nhất 24 giờ trước 14:00 ngày check-in; tự hủy các yêu cầu dịch vụ `pending`, `confirmed` của đơn; thanh toán đã trả của đơn và của các yêu cầu đó chuyển `refunded` |

Lưu ý: `POST /bookings` và `PUT /bookings/:id` phải kiểm tra phòng trống và ghi dữ liệu trong cùng một transaction. Số khách không được vượt `capacity` của loại phòng. Đơn chuyển `confirmed` khi khách thanh toán QR (`POST /payments`), không do admin duyệt.

Mọi đơn trong các API trên (danh sách và chi tiết) có thêm object `payment` (xem mục 11); đơn tạo trước khi có thanh toán QR có `payment = null`.

### 4. Dịch vụ khách sạn

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/services` | Public | Danh sách dịch vụ đang hoạt động; lọc bằng `category` |
| GET | `/services/:id` | Public | Chi tiết dịch vụ |
| POST | `/service-bookings` | User | Đặt dịch vụ; `booking_id`, `service_id`, `scheduled_at`, `quantity`, `note`. Kèm thanh toán QR `unpaid` |
| GET | `/service-bookings` | User | Yêu cầu dịch vụ của tôi |
| GET | `/service-bookings/:id` | User | Chi tiết yêu cầu |
| PATCH | `/service-bookings/:id/cancel` | User | Hủy khi còn `pending`; đã thanh toán thì chuyển `refunded` |

Lưu ý: `booking_id` phải thuộc người dùng và đúng trạng thái theo Mục 5 của proposal. API này chỉ nhận `breakfast`, `buffet`, `massage`, `laundry`, `housekeeping`. `scheduled_at` phải ở tương lai và nằm trong thời gian lưu trú: từ 14:00 ngày nhận phòng đến hết ngày trả phòng. Yêu cầu vẫn `pending` sau khi thanh toán; admin chỉ duyệt được khi đã thanh toán. Mọi đơn trong các API trên (danh sách và chi tiết) có thêm object `payment` (xem mục 11); đơn tạo trước khi có thanh toán QR có `payment = null`.

### 5. Đồ ăn và đồ uống

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/menu-items` | Public | Thực đơn; lọc bằng `category` |
| GET | `/menu-items/:id` | Public | Chi tiết món |
| POST | `/food-orders` | User | Đặt món; `booking_id`, `items` (`menu_item_id`, `quantity`), `note`. Kèm thanh toán QR `unpaid` |
| GET | `/food-orders` | User | Đơn đồ ăn của tôi |
| GET | `/food-orders/:id` | User | Chi tiết đơn và các món |
| PATCH | `/food-orders/:id/cancel` | User | Hủy khi còn `pending`; đã thanh toán thì chuyển `refunded` |

Lưu ý: `booking_id` phải là đơn `checked_in` của người dùng. Món có `is_available = false` không đặt được. Đơn, các món và thanh toán QR được lưu trong cùng một transaction. Đơn vẫn `pending` sau khi thanh toán; admin chỉ duyệt được khi đã thanh toán. Mọi đơn trong các API trên (danh sách và chi tiết) có thêm object `payment` (xem mục 11); đơn tạo trước khi có thanh toán QR có `payment = null`.

### 6. Du lịch

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/tours` | Public | Danh sách tour đang hoạt động |
| GET | `/tours/:id` | Public | Chi tiết tour |
| POST | `/tour-bookings` | User | Đặt tour; `tour_id`, `tour_date`, `participants`, `note`. Kèm thanh toán QR `unpaid` |
| GET | `/tour-bookings` | User | Đơn tour của tôi |
| GET | `/tour-bookings/:id` | User | Chi tiết đơn |
| PATCH | `/tour-bookings/:id/cancel` | User | Hủy khi còn `pending`; đã thanh toán thì chuyển `refunded` |
| POST | `/transport-bookings` | User | Thuê xe máy, đón sân bay hoặc xe đưa đón. Kèm thanh toán QR `unpaid` |
| GET | `/transport-bookings` | User | Đơn vận chuyển của tôi; có `vehicle_plate` khi đã được nhập |
| GET | `/transport-bookings/:id` | User | Chi tiết đơn |
| PATCH | `/transport-bookings/:id/cancel` | User | Hủy khi còn `pending`; đã thanh toán thì chuyển `refunded` |

Dữ liệu của `POST /transport-bookings`: `service_id`, `start_at`, `end_at`, `pickup_location`, `dropoff_location`, `flight_number`, `quantity`, `note`. API này chỉ nhận `motorbike_rental`, `airport_pickup`, `shuttle`. Khi thuê xe máy, `quantity` phải bằng 1 và phải có `end_at`.

Cách tính tiền và giới hạn:

| Loại | `quantity` | Tổng tiền | Bắt buộc thêm |
|---|---|---|---|
| `motorbike_rental` | Luôn là 1 | Giá × số ngày thuê (mỗi 24 giờ bắt đầu tính là 1 ngày, từ 1 đến 30 ngày) | `end_at` sau `start_at` |
| `airport_pickup` | Số xe, 1–5 | Giá × số xe | `flight_number`; không gửi `end_at` |
| `shuttle` | Số người, 1–20 | Giá × số người | Không gửi `end_at` |
| Tour | `participants` 1–20 | Giá × số người | `tour_date` |

`start_at` và `tour_date` phải ở tương lai và không quá 1 năm. `pickup_location` và `dropoff_location` bắt buộc với cả 3 loại vận chuyển. Admin nhập `vehicle_plate` khi duyệt (`confirmed`): bắt buộc với thuê xe máy, không bắt buộc với đón sân bay và xe đưa đón. Admin chỉ duyệt được đơn đã thanh toán QR.

Mọi đơn trong các API trên (danh sách và chi tiết) có thêm object `payment` (xem mục 11); đơn tạo trước khi có thanh toán QR có `payment = null`.

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

Bổ sung:

- "Đã hoàn thành" nghĩa là đơn đặt phòng `checked_out`; yêu cầu dịch vụ, đơn đồ ăn, tour và vận chuyển `completed`.
- Đánh giá không sửa và không xóa được.
- `GET /services/:id/reviews` gồm đánh giá của cả yêu cầu dịch vụ khách sạn lẫn đơn vận chuyển dùng dịch vụ đó.
- Các API đánh giá công khai có phân trang. `data` có dạng `{ summary: { average_rating, review_count }, reviews: [] }`, trong đó `average_rating` làm tròn 1 chữ số và bằng `null` khi chưa có đánh giá. Mỗi đánh giá chỉ hiện họ tên người viết, không hiện email.
- TiDB không kiểm tra `CHECK`, nên backend phải tự kiểm tra `rating` từ 1 đến 5 và đúng một khóa đến đơn.

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
| GET | `/admin/rooms/:id` | Chi tiết phòng ở mọi trạng thái, kèm `images` và `amenities` của loại phòng; `404` nếu không có |
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
| PATCH | `/admin/bookings/:id/status` | Đổi trạng thái theo luồng; hủy được cả khi còn dưới 24 giờ. Không đổi `pending` → `confirmed` được (trả `400`): đơn tự `confirmed` khi khách thanh toán |

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

Trạng thái đổi theo luồng ở Mục 5 của proposal. Admin hủy được khi đơn còn `pending` hoặc `confirmed`; hủy đơn đã thanh toán thì thanh toán chuyển `refunded`. Admin chỉ duyệt (`confirmed`) được đơn đã thanh toán QR, nếu chưa thì trả `400` "This order has not been paid yet." (Phương án A, mục 11).

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

Danh sách và chi tiết của 5 loại đơn trong API admin có object `payment` giống API của khách (mục 11). Thanh toán của admin xem ở `GET /admin/payments` (mục 11).

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

Bổ sung cho quản lý người dùng:

- `search` tìm trong họ tên, email và số điện thoại. Danh sách có phân trang, người mới nhất trước. Không bao giờ trả `password_hash`.
- Admin không tự khóa và không tự đổi vai trò của chính mình (trả `400`). Vì vậy hệ thống luôn còn ít nhất một admin đang hoạt động.
- Tài khoản bị khóa không đăng nhập được, và token cũ của tài khoản đó bị từ chối ngay (`403`), vì middleware luôn đọc trạng thái mới nhất từ database.
- Gửi lại đúng trạng thái hoặc vai trò hiện tại vẫn trả `200`.

Bổ sung cho thống kê:

- Mỗi khoản doanh thu được tính vào tháng của ngày sử dụng: đơn đặt phòng theo `check_out`, yêu cầu dịch vụ theo `scheduled_at`, đơn đồ ăn theo `created_at`, tour theo `tour_date`, vận chuyển theo `start_at`.
- `GET /admin/stats/overview`: tổng số đơn đặt phòng (không tính đơn `cancelled`) kèm số đơn theo từng trạng thái, tổng doanh thu kèm phần của từng loại, số người dùng vai trò `user` và số đang hoạt động.
- `GET /admin/stats/revenue?year=2026`: luôn trả đủ 12 tháng, tháng không có doanh thu bằng 0. Mặc định là năm hiện tại.
- `GET /admin/stats/top-rooms` và `/top-services`: tham số `limit` (mặc định 5, tối đa 20). Số lượt dùng không tính đơn `cancelled`. Top dịch vụ gồm cả yêu cầu dịch vụ khách sạn và đơn vận chuyển; tour không nằm trong danh sách này.
- `GET /admin/stats/feedback`: điểm trung bình, tổng số đánh giá, số đánh giá của từng mức 1–5 sao (luôn đủ 5 mức) và điểm trung bình theo từng loại đơn.

## Extended

Chỉ làm sau khi toàn bộ phần Core đã chạy ổn.

### 10. Thông báo

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/notifications` | User, Admin | Thông báo của tôi, mới nhất trước, có phân trang; lọc `unread_only=true`; kèm `unread_count` |
| PATCH | `/notifications/read-all` | User, Admin | Đánh dấu tất cả thông báo của tôi đã đọc; trả `unread_count` mới (bằng 0) |
| PATCH | `/notifications/:id/read` | User, Admin | Đánh dấu một thông báo đã đọc; gọi lại vẫn `200` |

Thông báo được backend tự tạo khi trạng thái đơn hoặc yêu cầu hỗ trợ thay đổi, nên không có API tạo hay xóa thông báo. Admin dùng chung các API này cho thông báo của chính mình.

- Route `/notifications/read-all` được khai báo trước `/notifications/:id/read`.
- Mỗi thông báo: `id`, `type` (`booking`, `service`, `food_order`, `tour`, `transport`, `payment`, `support`), `title`, `message`, `link_path` (trang của frontend mở khi bấm, ví dụ `/my-food-orders/12`, hoặc `null`), `is_read`, `created_at`.
- `unread_count` (số thông báo chưa đọc của tôi) nằm ở cấp ngoài cùng của phản hồi, giống `pagination`:

```json
{
  "success": true,
  "data": [ { "id": 12, "type": "food_order", "title": "Food order confirmed", "message": "Your food order #12 has been confirmed.", "link_path": "/my-food-orders/12", "is_read": false, "created_at": "2026-11-21 14:05:00" } ],
  "pagination": { "page": 1, "limit": 10, "total": 1 },
  "unread_count": 1
}
```

- `PATCH /notifications/:id/read` trả `data` là thông báo (đã đọc) và `unread_count` ở cấp ngoài cùng. Thông báo của người khác: `403`; không có: `404`.
- `PATCH /notifications/read-all` trả `data: { "unread_count": 0 }` và `unread_count` ở cấp ngoài cùng.
- `unread_only` chỉ nhận `true` hoặc `false`, nếu không thì `400`.

**Khi nào có thông báo.** Thông báo được tạo trong cùng transaction với thay đổi gây ra nó: thay đổi bị từ chối hoặc rollback thì không có thông báo. Không báo cho người dùng về hành động của chính họ (ví dụ khách tự hủy đơn), trừ xác nhận thanh toán. Tiêu đề và nội dung nằm trong `server/src/config/notifications.js`.

| Sự kiện | Người nhận | Tiêu đề (ví dụ) | `link_path` |
|---|---|---|---|
| Khách thanh toán đơn đặt phòng | Khách | "Booking confirmed" (kèm số phòng và ngày) | `/my-bookings/:id` |
| Khách thanh toán 4 loại đơn còn lại | Khách | "Payment received, waiting for confirmation" | Trang chi tiết đơn của khách |
| Khách thanh toán đơn đặt phòng | Mọi admin | "New paid booking" | `/admin/bookings/:id` |
| Khách thanh toán 4 loại đơn còn lại | Mọi admin | "Food order waiting for confirmation"… | Trang chi tiết đơn của admin |
| Admin đổi trạng thái đơn (`confirmed`, `checked_in`, `checked_out`, `in_progress`, `preparing`, `delivering`, `completed`, `cancelled`) | Khách | "Food order confirmed", "Checked in"… Hủy đơn đã trả có thêm "Your payment has been refunded."; duyệt thuê xe máy có biển số | Trang chi tiết đơn của khách |
| Yêu cầu dịch vụ bị hủy theo đơn đặt phòng | Khách | "Service request cancelled" | `/my-services/:id` |
| Đơn bị hủy vì quá hạn thanh toán | Khách | "... cancelled" ("not paid within 15 minutes") | Trang chi tiết đơn của khách |
| Khách tạo yêu cầu hỗ trợ | Mọi admin | "New support request" | `/admin/tickets/:id` |
| Khách gửi thêm tin nhắn | Mọi admin | "New message from a guest" | `/admin/tickets/:id` |
| Lễ tân trả lời | Khách | "Reception replied" | `/support/:id` |
| Admin đánh dấu yêu cầu `resolved` | Khách | "Support request resolved" | `/support/:id` |

Trang chi tiết đơn của khách: `/my-bookings/:id`, `/my-services/:id`, `/my-food-orders/:id`, `/my-trips/tours/:id`, `/my-trips/transport/:id`. Của admin: `/admin/bookings/:id`, `/admin/services/:id`, `/admin/food-orders/:id`, `/admin/tourism/tours/:id`, `/admin/tourism/transport/:id`.

Frontend tải `unread_count` sau khi đăng nhập, mỗi 60 giây khi tab đang mở, khi đổi trang và ngay sau khi đánh dấu đã đọc. Không dùng WebSocket.

### 11. Thanh toán giả lập và hóa đơn

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/payments` | User | "I have paid": thanh toán QR giả lập; `method` (`e_wallet`) và đúng một khóa đến đơn |
| GET | `/payments` | User | Thanh toán của tôi, mới nhất trước, có phân trang |
| GET | `/payments/:id` | User | Chi tiết thanh toán của tôi |
| GET | `/payments/:id/invoice` | User | Hóa đơn của thanh toán của tôi; `404` nếu chưa thanh toán |
| GET | `/admin/payments` | Admin | Tất cả thanh toán; lọc bằng `status`, `type`; có phân trang |
| PATCH | `/admin/payments/:id/refund` | Admin | Đánh dấu đã hoàn tiền; chỉ khi thanh toán `paid` và đơn đã `cancelled` |

Lưu ý: số tiền do backend lấy từ đơn. Hóa đơn được tạo tự động khi thanh toán thành công. Không xử lý tiền thật, không kết nối ngân hàng.

Thanh toán QR cho cả 5 loại đơn (Phương án A, chủ dự án duyệt ngày 19/11/2026; thay cho phương án chỉ áp dụng cho đơn đặt phòng thống nhất ngày 13/11 và 14/11/2026):

- **Tạo đơn:** `POST /bookings`, `/service-bookings`, `/food-orders`, `/tour-bookings`, `/transport-bookings` tạo luôn một thanh toán trong cùng transaction: `status = unpaid`, `method = e_wallet`, `amount` = `total_price` của đơn, `user_id` là khách. Đơn ở trạng thái `pending`. Frontend hiện mã QR giả lập và đồng hồ đếm ngược; khách bấm "I have paid" để mô phỏng việc quét QR.
- **Hạn thanh toán:** 15 phút từ `created_at` của đơn (`PAYMENT_HOLD_MINUTES` trong `server/src/config/payments.js`). Đổi ngày hoặc số khách của đơn đặt phòng (`PUT /bookings/:id`) không gia hạn, nhưng `amount` của thanh toán chưa trả đổi theo tổng mới trong cùng transaction. Khách thoát ra vẫn thanh toán tiếp được từ chi tiết đơn nếu còn hạn.
- **Hết hạn:** không dùng bộ đếm giờ chạy nền (Render gói Free ngủ khi không có người dùng). Trước các API dưới đây, backend hủy mọi đơn `pending` của 5 loại có thanh toán `unpaid` (hoặc không có thanh toán) và `created_at` cũ hơn 15 phút, so bằng giờ của database (`NOW() - INTERVAL 15 MINUTE`, múi giờ +07:00); mỗi loại đơn một transaction. Hủy đơn đặt phòng quá hạn cũng hủy các yêu cầu dịch vụ `pending`, `confirmed` của đơn. Khi không có đơn quá hạn, việc kiểm tra chỉ là một câu `SELECT` nhẹ. Các API có kiểm tra:
  - Danh sách và chi tiết của 5 loại đơn, của khách và của admin.
  - `GET /rooms` (tìm phòng), `GET /rooms/:id/availability`, `POST /bookings`, `PUT /bookings/:id`.
  - `POST /payments`, `GET /payments`, `GET /payments/:id`, `GET /admin/payments`.
- **Thanh toán (`POST /payments`):** body `{ "method": "e_wallet", "food_order_id": 12 }`, đúng một trong `booking_id`, `service_booking_id`, `food_order_id`, `tour_booking_id`, `transport_booking_id`. Trong một transaction có khóa dòng:
  - Đơn không có: `404` (ví dụ "Food order not found").
  - Đơn của người khác: `403`. Tài khoản admin: `403`.
  - Thanh toán đã `paid` (hoặc đã `refunded`): `409` (ví dụ "This food order has already been paid").
  - Đơn quá hạn (còn `pending` nhưng quá 15 phút, hoặc đã bị hủy và quá 15 phút): `400` "The payment time has expired. Please make a new booking."
  - Đơn không còn `pending` (ví dụ khách đã hủy): `400`.
  - Thành công: thanh toán chuyển `paid`, `paid_at` = bây giờ; tạo hóa đơn `invoice_number` dạng `INV-YYYYMMDD-000042` (ngày theo giờ database, số là id thanh toán), `issued_at` = bây giờ. **Chỉ đơn đặt phòng tự chuyển `confirmed`.** Yêu cầu dịch vụ, đơn đồ ăn, đơn tour, đơn vận chuyển vẫn `pending` và chờ admin duyệt. Trả `200` với dữ liệu thanh toán.
- **Admin:**
  - Đơn đặt phòng: admin không đổi `pending` → `confirmed` được nữa (`400` "Bookings are confirmed automatically when the guest pays."). Admin vẫn hủy (`pending`, `confirmed`), check-in và check-out như cũ.
  - Yêu cầu dịch vụ, đơn đồ ăn, đơn tour, đơn vận chuyển: admin chỉ duyệt (`confirmed`) được khi thanh toán đã `paid`, nếu chưa thì `400` "This order has not been paid yet.". Các bước khác không đổi; quy tắc biển số khi duyệt thuê xe máy giữ nguyên.
- **Hoàn tiền:** mỗi khi một đơn đã thanh toán bị hủy (khách tự hủy theo quy tắc hiện có, admin hủy, hoặc bị hủy theo khi đơn đặt phòng bị hủy), thanh toán của đơn chuyển `refunded` trong cùng transaction. Thanh toán chưa trả của đơn bị hủy giữ nguyên `unpaid`. `PATCH /admin/payments/:id/refund` chỉ là lưới an toàn: thanh toán phải `paid` và đơn phải `cancelled`, nếu không thì `400`.
- **Thống kê** vẫn tính theo trạng thái đơn như cũ, không theo thanh toán.
- QR được lưu với `method = e_wallet`, nên không cần đổi cấu trúc database. Mã QR do frontend tạo bằng thư viện `qrcode` (cài ở bước frontend).

**Object `payment` trong dữ liệu đơn.** Mọi đơn trong danh sách và chi tiết của 5 loại đơn (API của khách và của admin) có thêm trường `payment`; các trường cũ giữ nguyên. Đơn tạo trước khi có thanh toán QR có `payment = null`.

```json
"payment": {
  "id": 42,
  "status": "unpaid",
  "method": "e_wallet",
  "amount": 150000,
  "paid_at": null,
  "expires_at": "2026-11-19 18:15:00",
  "seconds_left": 612,
  "invoice_number": null
}
```

- `expires_at` (giờ địa phương, `YYYY-MM-DD HH:mm:ss`) và `seconds_left` (số nguyên ≥ 0, tính từ giờ của database) chỉ có giá trị khi đơn `pending` và thanh toán `unpaid`; các trường hợp khác là `null`.
- `invoice_number` có khi đã thanh toán (kể cả đã hoàn tiền), nếu không là `null`.

**Thanh toán trong `GET /payments`, `GET /payments/:id`, `POST /payments` và API admin:** các trường của object `payment` ở trên, cộng `created_at`, `target` (`type`: `room`, `service`, `food_order`, `tour`, `transport`; `id` của đơn; `name`, ví dụ "Room 301", tên dịch vụ, "Food order #5") và `order_status`. API admin có thêm `user` (`id`, `full_name`, `email`). `GET /payments/:id` của người khác trả `403`, không có thì `404`.

**Hóa đơn (`GET /payments/:id/invoice`):** `invoice_number`, `issued_at`, `guest` (`full_name`, `email`, `phone`), `payment` (`id`, `status`, `method`, `amount`, `paid_at`), `order` (`type`, `id`, `name`, `status`), `lines`, `subtotal`, `discount`, `total`. Mỗi dòng trong `lines` có `description`, `detail`, `quantity`, `unit`, `unit_price`, `amount`:

| Loại đơn | Dòng hóa đơn |
|---|---|
| Đặt phòng | Một dòng: loại phòng và số phòng; `quantity` = số đêm, `unit` = `night`, đơn giá mỗi đêm; `discount` = `discount_amount` |
| Yêu cầu dịch vụ | Một dòng: tên dịch vụ, `quantity` và đơn vị theo loại (`person`, `kg`, `visit`) |
| Đơn đồ ăn | Mỗi món một dòng: tên món, số lượng, đơn giá; `discount` = `discount_amount` |
| Đơn tour | Một dòng: tên tour, `quantity` = số người |
| Đơn vận chuyển | Một dòng: tên dịch vụ; thuê xe máy `quantity` = số ngày thuê (`day`), đón sân bay = số xe (`car`), xe đưa đón = số người (`person`) |

**Thử nhanh việc hết hạn:** đặt `PAYMENT_HOLD_MINUTES=1` trong `server/.env` rồi khởi động lại server (giá trị hợp lệ 1–1440; không đặt thì 15), hoặc lùi `created_at` của đơn trong MySQL Workbench, ví dụ `UPDATE food_orders SET created_at = NOW() - INTERVAL 16 MINUTE WHERE id = 12;`, rồi gọi một API có kiểm tra ở trên.

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
