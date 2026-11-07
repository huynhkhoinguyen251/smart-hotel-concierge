# Phân tích thực thể

**Trạng thái:** đã duyệt. Sơ đồ ERD nằm trong [erd.md](erd.md).

Dựa trên [proposal.md](proposal.md). Có tất cả 22 bảng. Mọi bảng dùng `id` làm Primary Key.

## Thực thể và thuộc tính chính

### Người dùng

| Bảng | Mô tả | Thuộc tính chính |
|---|---|---|
| `users` | Tài khoản khách và admin | `full_name`, `email` (duy nhất), `password_hash`, `phone`, `role`, `is_active` |

### Phòng

| Bảng | Mô tả | Thuộc tính chính |
|---|---|---|
| `room_types` | Loại phòng và giá | `name`, `description`, `price_per_night`, `capacity` |
| `amenities` | Tiện nghi, ví dụ Wi-Fi, điều hòa | `name` |
| `room_type_amenities` | Nối loại phòng với tiện nghi | `room_type_id`, `amenity_id` |
| `rooms` | Từng phòng thực tế | `room_type_id`, `room_number` (duy nhất), `floor`, `status` |
| `room_images` | Ảnh của phòng | `room_id`, `image_url`, `is_primary` |
| `bookings` | Đặt phòng | `user_id`, `room_id`, `voucher_id`, `check_in`, `check_out`, `guests`, `price_per_night`, `discount_amount`, `total_price`, `status` |

### Dịch vụ và đồ ăn

| Bảng | Mô tả | Thuộc tính chính |
|---|---|---|
| `services` | Danh mục dịch vụ khách sạn và vận chuyển | `name`, `category`, `description`, `price`, `image_url`, `is_active` |
| `service_bookings` | Yêu cầu dịch vụ khách sạn | `booking_id`, `service_id`, `scheduled_at`, `quantity`, `unit_price`, `total_price`, `note`, `status` |
| `menu_items` | Món ăn và đồ uống | `name`, `category`, `price`, `image_url`, `is_available` |
| `food_orders` | Đơn đồ ăn giao đến phòng | `booking_id`, `voucher_id`, `discount_amount`, `total_price`, `note`, `status` |
| `food_order_items` | Từng món trong đơn | `food_order_id`, `menu_item_id`, `quantity`, `unit_price` |

### Du lịch

| Bảng | Mô tả | Thuộc tính chính |
|---|---|---|
| `tours` | Tour địa phương | `name`, `description`, `location`, `duration`, `price`, `image_url`, `is_active` |
| `tour_bookings` | Đặt tour | `user_id`, `tour_id`, `tour_date`, `participants`, `unit_price`, `total_price`, `note`, `status` |
| `transport_bookings` | Thuê xe máy, đón sân bay, xe đưa đón | `user_id`, `service_id`, `start_at`, `end_at`, `pickup_location`, `dropoff_location`, `flight_number`, `vehicle_plate`, `quantity`, `unit_price`, `total_price`, `note`, `status` |

### Hỗ trợ và đánh giá

| Bảng | Mô tả | Thuộc tính chính |
|---|---|---|
| `support_tickets` | Yêu cầu hỗ trợ | `user_id`, `subject`, `status` |
| `ticket_messages` | Tin nhắn trong yêu cầu hỗ trợ | `ticket_id`, `sender_id`, `message` |
| `reviews` | Đánh giá và chấm điểm | `user_id`, `booking_id`, `service_booking_id`, `food_order_id`, `tour_booking_id`, `transport_booking_id`, `rating`, `comment` |

### Tính năng Extended

| Bảng | Mô tả | Thuộc tính chính |
|---|---|---|
| `vouchers` | Mã giảm giá | `code` (duy nhất), `discount_type`, `discount_value`, `min_amount`, `max_uses`, `used_count`, `starts_at`, `ends_at`, `is_active` |
| `payments` | Thanh toán giả lập | `user_id`, `booking_id`, `service_booking_id`, `food_order_id`, `tour_booking_id`, `transport_booking_id`, `amount`, `method`, `status`, `paid_at` |
| `invoices` | Hóa đơn của một thanh toán | `payment_id` (duy nhất), `invoice_number` (duy nhất), `issued_at` |
| `notifications` | Thông báo trong ứng dụng | `user_id`, `title`, `message`, `type`, `is_read` |

## Quan hệ

### One-to-One

| Bảng A | Bảng B | Ý nghĩa |
|---|---|---|
| `payments` | `invoices` | Mỗi thanh toán có tối đa một hóa đơn |
| `bookings`, `service_bookings`, `food_orders`, `tour_bookings`, `transport_bookings` | `reviews` | Mỗi đơn đã hoàn thành được đánh giá tối đa một lần |

### One-to-Many

| Bảng "một" | Bảng "nhiều" |
|---|---|
| `users` | `bookings`, `tour_bookings`, `transport_bookings`, `support_tickets`, `ticket_messages`, `reviews`, `payments`, `notifications` |
| `room_types` | `rooms` |
| `rooms` | `room_images`, `bookings` |
| `bookings` | `service_bookings`, `food_orders` |
| `services` | `service_bookings`, `transport_bookings` |
| `tours` | `tour_bookings` |
| `support_tickets` | `ticket_messages` |
| `vouchers` | `bookings`, `food_orders` |
| `bookings`, `service_bookings`, `food_orders`, `tour_bookings`, `transport_bookings` | `payments` |

### Many-to-Many

| Bảng A | Bảng B | Nối qua |
|---|---|---|
| `room_types` | `amenities` | `room_type_amenities` |
| `food_orders` | `menu_items` | `food_order_items` |
| `bookings` | `services` | `service_bookings` |
| `users` | `tours` | `tour_bookings` |

## Các quyết định thiết kế

1. **Tách `room_types` và `rooms`:** giá và sức chứa nằm ở loại phòng, còn việc đặt phòng gắn với từng phòng thực tế. Nhờ đó có thể chống đặt trùng phòng. Mỗi dòng trong `bookings` là một phòng, còn một người dùng có thể có nhiều dòng, kể cả cho nhiều phòng trong cùng thời gian.
2. **Lưu giá tại thời điểm đặt:** `bookings`, `service_bookings`, `food_order_items`, `tour_bookings` và `transport_bookings` đều lưu giá riêng, nên đổi giá sau này không ảnh hưởng đơn cũ.
3. **Yêu cầu dịch vụ và đơn đồ ăn gắn với `bookings`:** kiểm tra được khách đang lưu trú hay chưa, và biết phải giao đến phòng nào. Người đặt được suy ra từ `bookings.user_id`.
4. **Dịch vụ du lịch không gắn với `bookings`:** theo proposal, người dùng đã đăng nhập có thể đặt mà không cần đặt phòng.
5. **Xe máy và xe đưa đón nằm trong `services`:** chúng dùng chung danh mục và giá với dịch vụ khách sạn, phân biệt bằng `category`. Hệ thống không quản lý từng chiếc xe và không giới hạn số xe; admin tự duyệt yêu cầu (`confirmed`) hoặc từ chối (`cancelled`). Khi duyệt yêu cầu thuê xe máy, admin phải nhập biển số vào `vehicle_plate` để user xem; với đón sân bay và xe đưa đón thì không bắt buộc. Mỗi yêu cầu thuê xe máy chỉ có một xe (`quantity` = 1); cần nhiều xe thì tạo nhiều yêu cầu.
6. **`reviews` và `payments` có nhiều khóa ngoại có thể NULL:** mỗi dòng chỉ được điền đúng một khóa, và ràng buộc này được kiểm tra bằng `CHECK`. Cách này giữ được khóa ngoại thật, thay vì dùng cột loại và cột id tự do.
7. **Đánh giá theo từng đơn:** người dùng đánh giá được phòng, dịch vụ khách sạn, đơn đồ ăn và dịch vụ du lịch sau khi hoàn thành. Đơn đồ ăn được đánh giá theo cả đơn, không theo từng món.

## Giá trị được phép

| Cột | Giá trị |
|---|---|
| `users.role` | `user`, `admin` |
| `rooms.status` | `available`, `maintenance`, `inactive` |
| `bookings.status` | `pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled` |
| `services.category` | `breakfast`, `buffet`, `massage`, `laundry`, `housekeeping`, `motorbike_rental`, `airport_pickup`, `shuttle` |
| `service_bookings.status`, `tour_bookings.status`, `transport_bookings.status` | `pending`, `confirmed`, `in_progress`, `completed`, `cancelled` |
| `menu_items.category` | `food`, `coffee`, `drink` |
| `food_orders.status` | `pending`, `confirmed`, `preparing`, `delivering`, `completed`, `cancelled` |
| `support_tickets.status` | `open`, `in_progress`, `resolved` |
| `reviews.rating` | Số nguyên từ 1 đến 5 |
| `vouchers.discount_type` | `percent`, `fixed` |
| `payments.method` | `cash`, `card`, `e_wallet` (giả lập) |
| `payments.status` | `unpaid`, `paid`, `refunded` |
