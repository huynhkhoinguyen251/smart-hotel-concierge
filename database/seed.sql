USE smart_hotel_concierge;
SET NAMES utf8mb4;

-- Dữ liệu mẫu cho môi trường phát triển. Chạy sau schema.sql, trên các bảng còn trống.
-- Mật khẩu test xem trong database/README.md.

START TRANSACTION;

-- ============================================================
-- Người dùng
-- ============================================================

INSERT INTO users (id, full_name, email, password_hash, phone, role, is_active) VALUES
(1, 'Nguyen Minh Quan', 'admin@smarthotel.test', '$2b$10$.rk7fxaQ66SrIFRCX0IWau.92zu9auVtK5LNhLtQYramF2TgPBsWi', '0905000001', 'admin', 1),
(2, 'Tran Thi An', 'an.tran@example.com', '$2b$10$469geWb7ss3FKt7LqOTaveZ40vdKAtFV1/BmdiOHrTctolIywz3NW', '0905000002', 'user', 1),
(3, 'Le Van Binh', 'binh.le@example.com', '$2b$10$Q3UHyQreDqZ9JF1OMA9CjuvxtZlxK92ECkGQaR.0EowrRxalu1ejO', '0905000003', 'user', 1),
(4, 'Pham Thu Chi', 'chi.pham@example.com', '$2b$10$kJiVUrlPbCw7dEgdHR47hOd8BtDYynam27t/8fbYLLToJIyBSVCqC', '0905000004', 'user', 1);

-- ============================================================
-- Phòng
-- ============================================================

INSERT INTO room_types (id, name, description, price_per_night, capacity) VALUES
(1, 'Standard Room', 'A 22 m² room with one double bed, ideal for couples or business travelers.', 800000.00, 2),
(2, 'Superior Room', 'A 28 m² room with modern furniture, a minibar and a work desk.', 1200000.00, 2),
(3, 'Deluxe Room', 'A 35 m² room with a bathtub and a city view.', 1800000.00, 3),
(4, 'Family Room', 'A 48 m² room with two large beds and a balcony, ideal for families.', 2500000.00, 4);

INSERT INTO amenities (id, name) VALUES
(1, 'Free Wi-Fi'),
(2, 'Air conditioning'),
(3, 'Flat-screen TV'),
(4, 'Minibar'),
(5, 'Bathtub'),
(6, 'Balcony'),
(7, 'In-room safe'),
(8, 'Hair dryer');

INSERT INTO room_type_amenities (id, room_type_id, amenity_id) VALUES
(1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 1, 8),
(5, 2, 1), (6, 2, 2), (7, 2, 3), (8, 2, 4), (9, 2, 8),
(10, 3, 1), (11, 3, 2), (12, 3, 3), (13, 3, 4), (14, 3, 5), (15, 3, 7), (16, 3, 8),
(17, 4, 1), (18, 4, 2), (19, 4, 3), (20, 4, 4), (21, 4, 5), (22, 4, 6), (23, 4, 7), (24, 4, 8);

INSERT INTO rooms (id, room_type_id, room_number, floor, status) VALUES
(1, 1, '101', 1, 'available'),
(2, 1, '102', 1, 'available'),
(3, 1, '103', 1, 'available'),
(4, 1, '104', 1, 'maintenance'),
(5, 2, '201', 2, 'available'),
(6, 2, '202', 2, 'available'),
(7, 2, '203', 2, 'available'),
(8, 3, '301', 3, 'available'),
(9, 3, '302', 3, 'available'),
(10, 3, '303', 3, 'inactive'),
(11, 4, '401', 4, 'available'),
(12, 4, '402', 4, 'available');

INSERT INTO room_images (id, room_id, image_url, is_primary) VALUES
(1, 1, 'https://placehold.co/800x600?text=Room+101', 1),
(2, 1, 'https://placehold.co/800x600?text=Room+101+Bathroom', 0),
(3, 2, 'https://placehold.co/800x600?text=Room+102', 1),
(4, 2, 'https://placehold.co/800x600?text=Room+102+Bathroom', 0),
(5, 3, 'https://placehold.co/800x600?text=Room+103', 1),
(6, 3, 'https://placehold.co/800x600?text=Room+103+Bathroom', 0),
(7, 4, 'https://placehold.co/800x600?text=Room+104', 1),
(8, 4, 'https://placehold.co/800x600?text=Room+104+Bathroom', 0),
(9, 5, 'https://placehold.co/800x600?text=Room+201', 1),
(10, 5, 'https://placehold.co/800x600?text=Room+201+Bathroom', 0),
(11, 6, 'https://placehold.co/800x600?text=Room+202', 1),
(12, 6, 'https://placehold.co/800x600?text=Room+202+Bathroom', 0),
(13, 7, 'https://placehold.co/800x600?text=Room+203', 1),
(14, 7, 'https://placehold.co/800x600?text=Room+203+Bathroom', 0),
(15, 8, 'https://placehold.co/800x600?text=Room+301', 1),
(16, 8, 'https://placehold.co/800x600?text=Room+301+Bathroom', 0),
(17, 9, 'https://placehold.co/800x600?text=Room+302', 1),
(18, 9, 'https://placehold.co/800x600?text=Room+302+Bathroom', 0),
(19, 10, 'https://placehold.co/800x600?text=Room+303', 1),
(20, 10, 'https://placehold.co/800x600?text=Room+303+Bathroom', 0),
(21, 11, 'https://placehold.co/800x600?text=Room+401', 1),
(22, 11, 'https://placehold.co/800x600?text=Room+401+Bathroom', 0),
(23, 12, 'https://placehold.co/800x600?text=Room+402', 1),
(24, 12, 'https://placehold.co/800x600?text=Room+402+Bathroom', 0);

-- ============================================================
-- Mã giảm giá: used_count bằng số đơn đang dùng mã trong file này
-- ============================================================

INSERT INTO vouchers (id, code, discount_type, discount_value, min_amount, max_uses, used_count, starts_at, ends_at, is_active) VALUES
(1, 'WELCOME10', 'percent', 10.00, 1000000.00, 100, 2, '2026-11-01 00:00:00', '2027-01-31 23:59:59', 1),
(2, 'FOOD50K', 'fixed', 50000.00, 200000.00, 50, 1, '2026-11-01 00:00:00', '2026-12-31 23:59:59', 1),
(3, 'NEWYEAR2027', 'percent', 15.00, 2000000.00, 30, 1, '2026-11-01 00:00:00', '2027-01-15 23:59:59', 1),
(4, 'BLACKFRIDAY', 'fixed', 200000.00, 1500000.00, 20, 0, '2026-11-20 00:00:00', '2026-11-30 23:59:59', 0);

-- ============================================================
-- Danh mục dịch vụ, thực đơn và tour
-- ============================================================

INSERT INTO services (id, name, category, description, price, image_url, is_active) VALUES
(1, 'Restaurant breakfast', 'breakfast', 'Breakfast buffet from 6:30 to 9:30, priced per person.', 150000.00, 'https://placehold.co/800x600?text=Breakfast', 1),
(2, 'Seafood dinner buffet', 'buffet', 'Seafood buffet from 18:00 to 21:00, priced per person.', 450000.00, 'https://placehold.co/800x600?text=Buffet', 1),
(3, '60-minute relaxing massage', 'massage', 'Full-body massage with natural essential oils, priced per person.', 500000.00, 'https://placehold.co/800x600?text=Massage', 1),
(4, 'Laundry by the kilogram', 'laundry', 'Washing, drying and ironing, returned to your room within 24 hours.', 60000.00, 'https://placehold.co/800x600?text=Laundry', 1),
(5, 'On-demand housekeeping', 'housekeeping', 'Room cleaning and fresh towels and bed linen at a time you choose.', 100000.00, 'https://placehold.co/800x600?text=Housekeeping', 1),
(6, 'Daily motorbike rental', 'motorbike_rental', 'Automatic scooter with two helmets. Priced per bike for each 24 hours.', 150000.00, 'https://placehold.co/800x600?text=Motorbike', 1),
(7, 'Da Nang airport pickup', 'airport_pickup', 'A 4-seat car from the airport to the hotel, priced per trip.', 350000.00, 'https://placehold.co/800x600?text=Airport+Pickup', 1),
(8, 'City center shuttle', 'shuttle', 'Shuttle between the hotel and the city center, priced per person.', 80000.00, 'https://placehold.co/800x600?text=Shuttle', 1);

INSERT INTO menu_items (id, name, category, price, image_url, is_available) VALUES
(1, 'Pho Bo (beef noodle soup)', 'food', 75000.00, 'https://placehold.co/800x600?text=Pho+Bo', 1),
(2, 'Seafood fried rice', 'food', 95000.00, 'https://placehold.co/800x600?text=Seafood+Fried+Rice', 1),
(3, 'Mi Quang with chicken', 'food', 70000.00, 'https://placehold.co/800x600?text=Mi+Quang', 1),
(4, 'Grilled pork Banh Mi', 'food', 45000.00, 'https://placehold.co/800x600?text=Banh+Mi', 1),
(5, 'Goi Cuon (fresh spring rolls)', 'food', 60000.00, 'https://placehold.co/800x600?text=Goi+Cuon', 0),
(6, 'Ca Phe Sua Da (iced milk coffee)', 'coffee', 35000.00, 'https://placehold.co/800x600?text=Iced+Milk+Coffee', 1),
(7, 'Black coffee', 'coffee', 30000.00, 'https://placehold.co/800x600?text=Black+Coffee', 1),
(8, 'Bac Xiu (Vietnamese white coffee)', 'coffee', 40000.00, 'https://placehold.co/800x600?text=Bac+Xiu', 1),
(9, 'Orange juice', 'drink', 50000.00, 'https://placehold.co/800x600?text=Orange+Juice', 1),
(10, 'Peach lemongrass tea', 'drink', 55000.00, 'https://placehold.co/800x600?text=Peach+Lemongrass+Tea', 1);

INSERT INTO tours (id, name, description, location, duration, price, image_url, is_active) VALUES
(1, 'Ba Na Hills Discovery', 'Visit the Golden Bridge and the French Village and ride the cable car, with a buffet lunch.', 'Da Nang', '1 day', 1250000.00, 'https://placehold.co/800x600?text=Ba+Na+Hills', 1),
(2, 'Hoi An Ancient Town by Night', 'Walk the ancient town, release lanterns on the Hoai River and taste local specialties.', 'Hoi An', 'Half day', 650000.00, 'https://placehold.co/800x600?text=Hoi+An', 1),
(3, 'My Son Sanctuary', 'Explore the Cham temple complex with a tour guide.', 'Quang Nam', 'Half day', 750000.00, 'https://placehold.co/800x600?text=My+Son', 1),
(4, 'Marble Mountains and Non Nuoc Beach', 'Climb Thuy Son Mountain, visit the stone carving village and swim at Non Nuoc Beach.', 'Da Nang', 'Half day', 450000.00, 'https://placehold.co/800x600?text=Marble+Mountains', 1);

-- ============================================================
-- Đặt phòng: total_price = số đêm x price_per_night - discount_amount
-- Đơn 8 (đã hủy) trùng ngày với đơn 7 ở phòng 302 để minh họa: đơn đã hủy không giữ phòng.
-- ============================================================

INSERT INTO bookings (id, user_id, room_id, voucher_id, check_in, check_out, guests, price_per_night, discount_amount, total_price, status) VALUES
(1, 2, 1, NULL, '2026-11-01', '2026-11-04', 2, 800000.00, 0.00, 2400000.00, 'checked_out'),
(2, 3, 5, 1, '2026-11-02', '2026-11-05', 2, 1200000.00, 360000.00, 3240000.00, 'checked_out'),
(3, 2, 8, NULL, '2026-11-05', '2026-11-10', 2, 1800000.00, 0.00, 9000000.00, 'checked_in'),
(4, 4, 11, NULL, '2026-11-06', '2026-11-09', 4, 2500000.00, 0.00, 7500000.00, 'checked_in'),
(5, 3, 6, NULL, '2026-12-10', '2026-12-13', 2, 1200000.00, 0.00, 3600000.00, 'confirmed'),
(6, 4, 2, 1, '2026-12-20', '2026-12-22', 2, 800000.00, 160000.00, 1440000.00, 'confirmed'),
(7, 2, 9, NULL, '2026-12-24', '2026-12-27', 2, 1800000.00, 0.00, 5400000.00, 'pending'),
(8, 3, 9, NULL, '2026-12-25', '2026-12-28', 2, 1800000.00, 0.00, 5400000.00, 'cancelled'),
(9, 2, 12, 3, '2026-12-30', '2027-01-02', 4, 2500000.00, 1125000.00, 6375000.00, 'confirmed');

-- ============================================================
-- Yêu cầu dịch vụ khách sạn: total_price = quantity x unit_price
-- Giặt ủi và dọn phòng gắn với đơn checked_in; bữa sáng, buffet và massage gắn với đơn confirmed hoặc checked_in.
-- ============================================================

INSERT INTO service_bookings (id, booking_id, service_id, scheduled_at, quantity, unit_price, total_price, note, status) VALUES
(1, 3, 1, '2026-11-06 07:30:00', 2, 150000.00, 300000.00, NULL, 'completed'),
(2, 3, 4, '2026-11-06 09:00:00', 3, 60000.00, 180000.00, 'Please iron the shirts carefully.', 'completed'),
(3, 3, 4, '2026-11-07 09:00:00', 2, 60000.00, 120000.00, NULL, 'in_progress'),
(4, 4, 5, '2026-11-08 10:00:00', 1, 100000.00, 100000.00, 'Please bring extra bath towels.', 'confirmed'),
(5, 4, 3, '2026-11-08 16:00:00', 2, 500000.00, 1000000.00, NULL, 'confirmed'),
(6, 5, 2, '2026-12-11 18:30:00', 2, 450000.00, 900000.00, 'A table near the window, please.', 'pending'),
(7, 6, 3, '2026-12-21 15:00:00', 1, 500000.00, 500000.00, NULL, 'pending'),
(8, 9, 1, '2026-12-31 07:30:00', 4, 150000.00, 600000.00, NULL, 'cancelled');

-- ============================================================
-- Đơn đồ ăn: chỉ gắn với đơn checked_in
-- total_price = tổng (quantity x unit_price) của các món - discount_amount
-- ============================================================

INSERT INTO food_orders (id, booking_id, voucher_id, discount_amount, total_price, note, status) VALUES
(1, 3, 2, 50000.00, 170000.00, NULL, 'completed'),
(2, 4, NULL, 0.00, 390000.00, 'Less spicy, please.', 'completed'),
(3, 3, NULL, 0.00, 145000.00, NULL, 'preparing'),
(4, 4, NULL, 0.00, 170000.00, 'Please deliver before 8 AM.', 'delivering'),
(5, 3, NULL, 0.00, 30000.00, 'No sugar.', 'pending'),
(6, 4, NULL, 0.00, 75000.00, NULL, 'cancelled'),
(7, 4, NULL, 0.00, 80000.00, NULL, 'confirmed');

INSERT INTO food_order_items (id, food_order_id, menu_item_id, quantity, unit_price) VALUES
(1, 1, 1, 2, 75000.00),
(2, 1, 6, 2, 35000.00),
(3, 2, 3, 4, 70000.00),
(4, 2, 10, 2, 55000.00),
(5, 3, 2, 1, 95000.00),
(6, 3, 9, 1, 50000.00),
(7, 4, 4, 2, 45000.00),
(8, 4, 8, 2, 40000.00),
(9, 5, 7, 1, 30000.00),
(10, 6, 1, 1, 75000.00),
(11, 7, 4, 1, 45000.00),
(12, 7, 6, 1, 35000.00);

-- ============================================================
-- Đặt tour và đặt xe: yêu cầu thuê xe máy đã duyệt đều có vehicle_plate
-- Các đơn thuê xe máy trong file này đều kéo dài đúng 24 giờ.
-- ============================================================

INSERT INTO tour_bookings (id, user_id, tour_id, tour_date, participants, unit_price, total_price, note, status) VALUES
(1, 2, 2, '2026-11-03', 2, 650000.00, 1300000.00, NULL, 'completed'),
(2, 3, 1, '2026-12-11', 2, 1250000.00, 2500000.00, 'We need a child seat.', 'confirmed'),
(3, 4, 3, '2026-12-21', 1, 750000.00, 750000.00, NULL, 'pending'),
(4, 2, 4, '2027-01-05', 3, 450000.00, 1350000.00, 'Cancelled due to a change in my work schedule.', 'cancelled'),
(5, 4, 4, '2026-11-07', 4, 450000.00, 1800000.00, NULL, 'in_progress');

INSERT INTO transport_bookings (id, user_id, service_id, start_at, end_at, pickup_location, dropoff_location, flight_number, vehicle_plate, quantity, unit_price, total_price, note, status) VALUES
(1, 2, 7, '2026-11-01 09:30:00', NULL, 'Da Nang International Airport', 'Hotel', 'VN118', '43A-123.45', 1, 350000.00, 350000.00, NULL, 'completed'),
(2, 3, 6, '2026-11-03 08:00:00', '2026-11-04 08:00:00', 'Hotel', 'Hotel', NULL, '43B1-234.56', 1, 150000.00, 150000.00, NULL, 'completed'),
(3, 4, 6, '2026-11-07 08:00:00', '2026-11-08 08:00:00', 'Hotel', 'Hotel', NULL, '43B1-345.67', 1, 150000.00, 150000.00, NULL, 'in_progress'),
(4, 3, 6, '2026-12-10 08:00:00', '2026-12-11 08:00:00', 'Hotel', 'Hotel', NULL, '43B1-456.78', 1, 150000.00, 150000.00, 'Please include a raincoat.', 'confirmed'),
(5, 4, 6, '2026-12-20 08:00:00', '2026-12-21 08:00:00', 'Hotel', 'Hotel', NULL, NULL, 1, 150000.00, 150000.00, NULL, 'pending'),
(6, 3, 8, '2026-12-12 09:00:00', NULL, 'Hotel', 'Han Market', NULL, NULL, 2, 80000.00, 160000.00, NULL, 'pending'),
(7, 2, 6, '2026-12-24 08:00:00', '2026-12-25 08:00:00', 'Hotel', 'Hotel', NULL, NULL, 1, 150000.00, 150000.00, 'No longer needed.', 'cancelled');

-- ============================================================
-- Hỗ trợ
-- ============================================================

INSERT INTO support_tickets (id, user_id, subject, status) VALUES
(1, 2, 'Unstable Wi-Fi in room 301', 'in_progress'),
(2, 3, 'Invoice request for my room booking', 'resolved'),
(3, 4, 'Late check-out request', 'open');

INSERT INTO ticket_messages (id, ticket_id, sender_id, message) VALUES
(1, 1, 2, 'The Wi-Fi in room 301 keeps disconnecting in the evening. Could reception please check it?'),
(2, 1, 1, 'We have noted the issue and will send a technician to check it today.'),
(3, 2, 3, 'I need an invoice for my stay from 2 Nov to 5 Nov.'),
(4, 2, 1, 'The invoice is available in the payments section of your account. Please check there.'),
(5, 2, 3, 'I have received it, thank you.'),
(6, 3, 4, 'My family would like to check out at 14:00 on 9 Nov. Is that possible?');

-- ============================================================
-- Đánh giá: chỉ gắn với đơn đã hoàn thành của đúng người dùng
-- ============================================================

INSERT INTO reviews (id, user_id, booking_id, service_booking_id, food_order_id, tour_booking_id, transport_booking_id, rating, comment) VALUES
(1, 2, 1, NULL, NULL, NULL, NULL, 5, 'Clean room and friendly staff.'),
(2, 3, 2, NULL, NULL, NULL, NULL, 4, 'Nice room, but a little noisy in the morning.'),
(3, 2, NULL, 1, NULL, NULL, NULL, 5, 'A varied and delicious breakfast.'),
(4, 2, NULL, NULL, 1, NULL, NULL, 4, 'Tasty pho, but the delivery was a bit slow.'),
(5, 2, NULL, NULL, NULL, 1, NULL, 5, 'An enthusiastic guide, and the ancient town is beautiful at night.'),
(6, 3, NULL, NULL, NULL, NULL, 2, 4, 'The bike ran well and the paperwork was quick.');

-- ============================================================
-- Thanh toán giả lập và hóa đơn: amount bằng total_price của đơn
-- Chỉ thanh toán có trạng thái paid mới có hóa đơn trong file này.
-- ============================================================

INSERT INTO payments (id, user_id, booking_id, service_booking_id, food_order_id, tour_booking_id, transport_booking_id, amount, method, status, paid_at) VALUES
(1, 2, 1, NULL, NULL, NULL, NULL, 2400000.00, 'card', 'paid', '2026-11-04 10:00:00'),
(2, 3, 2, NULL, NULL, NULL, NULL, 3240000.00, 'e_wallet', 'paid', '2026-11-05 11:00:00'),
(3, 2, 3, NULL, NULL, NULL, NULL, 9000000.00, 'card', 'paid', '2026-11-05 14:30:00'),
(4, 3, 5, NULL, NULL, NULL, NULL, 3600000.00, 'e_wallet', 'unpaid', NULL),
(5, 2, NULL, 1, NULL, NULL, NULL, 300000.00, 'cash', 'paid', '2026-11-06 08:30:00'),
(6, 2, NULL, NULL, 1, NULL, NULL, 170000.00, 'cash', 'paid', '2026-11-06 19:00:00'),
(7, 2, NULL, NULL, NULL, 1, NULL, 1300000.00, 'card', 'paid', '2026-11-02 20:00:00'),
(8, 3, NULL, NULL, NULL, NULL, 2, 150000.00, 'cash', 'paid', '2026-11-04 08:30:00'),
(9, 3, 8, NULL, NULL, NULL, NULL, 5400000.00, 'card', 'refunded', '2026-11-06 15:00:00');

INSERT INTO invoices (id, payment_id, invoice_number, issued_at) VALUES
(1, 1, 'INV-202611-0001', '2026-11-04 10:00:00'),
(2, 2, 'INV-202611-0002', '2026-11-05 11:00:00'),
(3, 3, 'INV-202611-0003', '2026-11-05 14:30:00'),
(4, 5, 'INV-202611-0004', '2026-11-06 08:30:00'),
(5, 6, 'INV-202611-0005', '2026-11-06 19:00:00'),
(6, 7, 'INV-202611-0006', '2026-11-02 20:00:00'),
(7, 8, 'INV-202611-0007', '2026-11-04 08:30:00');

-- ============================================================
-- Thông báo trong ứng dụng
-- ============================================================

INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
(1, 2, 'Booking awaiting confirmation', 'Your booking for room 302 from 24 Dec to 27 Dec is awaiting hotel confirmation.', 'booking', 0),
(2, 3, 'Booking confirmed', 'Your booking for room 202 from 10 Dec to 13 Dec has been confirmed.', 'booking', 1),
(3, 4, 'Service confirmed', 'Your massage request at 16:00 on 8 Nov has been confirmed.', 'service', 0),
(4, 2, 'Food order being prepared', 'The kitchen is preparing your food order #3.', 'food_order', 0),
(5, 3, 'Motorbike rental approved', 'Your motorbike rental on 10 Dec has been approved. License plate: 43B1-456.78.', 'transport', 0),
(6, 3, 'Refund completed', 'Your payment of 5,400,000 VND for the cancelled room booking has been refunded.', 'payment', 1),
(7, 1, 'New support request', 'Guest Pham Thu Chi has submitted a request: Late check-out request.', 'support', 0);

COMMIT;
