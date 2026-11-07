# ERD và khóa

**Trạng thái:** đã duyệt.

Sơ đồ nằm trong [erd.mmd](erd.mmd). Thuộc tính chi tiết và lý do thiết kế nằm trong [entity-analysis.md](entity-analysis.md).

## Quy ước

- Có 22 bảng, và mọi bảng dùng `id` (`INT AUTO_INCREMENT`) làm Primary Key.
- Mọi bảng có `created_at` và `updated_at`; sơ đồ không vẽ hai cột này cho dễ đọc.
- Ký hiệu trong sơ đồ: `PK` là khóa chính, `FK` là khóa ngoại, `UK` là giá trị duy nhất.
- Mặc định `ON DELETE RESTRICT`, để không làm mất dữ liệu đơn hàng và thanh toán. Các ngoại lệ được ghi trong bảng dưới.

## Foreign Key

| Bảng | Cột FK | Tham chiếu | NULL | Khi xóa bản ghi cha |
|---|---|---|---|---|
| `room_type_amenities` | `room_type_id` | `room_types.id` | Không | `CASCADE` |
| `room_type_amenities` | `amenity_id` | `amenities.id` | Không | `CASCADE` |
| `rooms` | `room_type_id` | `room_types.id` | Không | `RESTRICT` |
| `room_images` | `room_id` | `rooms.id` | Không | `CASCADE` |
| `bookings` | `user_id` | `users.id` | Không | `RESTRICT` |
| `bookings` | `room_id` | `rooms.id` | Không | `RESTRICT` |
| `bookings` | `voucher_id` | `vouchers.id` | Có | `RESTRICT` |
| `service_bookings` | `booking_id` | `bookings.id` | Không | `RESTRICT` |
| `service_bookings` | `service_id` | `services.id` | Không | `RESTRICT` |
| `food_orders` | `booking_id` | `bookings.id` | Không | `RESTRICT` |
| `food_orders` | `voucher_id` | `vouchers.id` | Có | `RESTRICT` |
| `food_order_items` | `food_order_id` | `food_orders.id` | Không | `CASCADE` |
| `food_order_items` | `menu_item_id` | `menu_items.id` | Không | `RESTRICT` |
| `tour_bookings` | `user_id` | `users.id` | Không | `RESTRICT` |
| `tour_bookings` | `tour_id` | `tours.id` | Không | `RESTRICT` |
| `transport_bookings` | `user_id` | `users.id` | Không | `RESTRICT` |
| `transport_bookings` | `service_id` | `services.id` | Không | `RESTRICT` |
| `support_tickets` | `user_id` | `users.id` | Không | `RESTRICT` |
| `ticket_messages` | `ticket_id` | `support_tickets.id` | Không | `CASCADE` |
| `ticket_messages` | `sender_id` | `users.id` | Không | `RESTRICT` |
| `reviews` | `user_id` | `users.id` | Không | `RESTRICT` |
| `reviews` | `booking_id` | `bookings.id` | Có | `RESTRICT` |
| `reviews` | `service_booking_id` | `service_bookings.id` | Có | `RESTRICT` |
| `reviews` | `food_order_id` | `food_orders.id` | Có | `RESTRICT` |
| `reviews` | `tour_booking_id` | `tour_bookings.id` | Có | `RESTRICT` |
| `reviews` | `transport_booking_id` | `transport_bookings.id` | Có | `RESTRICT` |
| `payments` | `user_id` | `users.id` | Không | `RESTRICT` |
| `payments` | `booking_id` | `bookings.id` | Có | `RESTRICT` |
| `payments` | `service_booking_id` | `service_bookings.id` | Có | `RESTRICT` |
| `payments` | `food_order_id` | `food_orders.id` | Có | `RESTRICT` |
| `payments` | `tour_booking_id` | `tour_bookings.id` | Có | `RESTRICT` |
| `payments` | `transport_booking_id` | `transport_bookings.id` | Có | `RESTRICT` |
| `invoices` | `payment_id` | `payments.id` | Không | `RESTRICT` |
| `notifications` | `user_id` | `users.id` | Không | `CASCADE` |

## Ràng buộc khác

| Bảng | Ràng buộc |
|---|---|
| `users` | `email` là duy nhất |
| `room_types`, `amenities` | `name` là duy nhất |
| `room_type_amenities` | Cặp (`room_type_id`, `amenity_id`) là duy nhất |
| `rooms` | `room_number` là duy nhất |
| `bookings` | `CHECK (check_out > check_in)` |
| `vouchers` | `code` là duy nhất |
| `invoices` | `payment_id` và `invoice_number` đều là duy nhất |
| `reviews` | Mỗi khóa đến đơn là duy nhất, nên mỗi đơn được đánh giá một lần |
| `reviews` | `CHECK`: `rating` từ 1 đến 5, và đúng một khóa đến đơn được điền |
| `payments` | `CHECK`: đúng một khóa đến đơn được điền |

## Quy tắc kiểm tra ở backend

Database không tự kiểm tra được các quy tắc sau, nên backend phải kiểm tra:

- Không đặt trùng phòng trong cùng thời gian, và chạy trong transaction.
- `service_bookings` chỉ dùng dịch vụ khách sạn; `transport_bookings` chỉ dùng dịch vụ vận chuyển.
- Phải có `vehicle_plate` khi duyệt yêu cầu thuê xe máy.
- Mỗi yêu cầu thuê xe máy có `quantity` = 1.
- Chỉ đánh giá được đơn của chính mình, và đơn đó phải đã hoàn thành.
