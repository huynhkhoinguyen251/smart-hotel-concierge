USE smart_hotel_concierge;

-- Script tạo 22 bảng cho MySQL 8.0, bảng cha được tạo trước bảng con.
-- Thiết kế theo docs/entity-analysis.md và docs/erd.md.

-- ============================================================
-- Nhóm người dùng: tài khoản khách và admin
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm phòng: loại phòng, tiện nghi, phòng thực tế và ảnh phòng
-- ============================================================

CREATE TABLE IF NOT EXISTS room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    price_per_night DECIMAL(12,2) NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_room_types_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_amenities_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room_type_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_id INT NOT NULL,
    amenity_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_room_type_amenities UNIQUE (room_type_id, amenity_id),
    CONSTRAINT fk_room_type_amenities_room_type FOREIGN KEY (room_type_id)
        REFERENCES room_types (id) ON DELETE CASCADE,
    CONSTRAINT fk_room_type_amenities_amenity FOREIGN KEY (amenity_id)
        REFERENCES amenities (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    floor INT NOT NULL,
    status ENUM('available', 'maintenance', 'inactive') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_rooms_room_number UNIQUE (room_number),
    INDEX idx_rooms_status (status),
    CONSTRAINT fk_rooms_room_type FOREIGN KEY (room_type_id)
        REFERENCES room_types (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_images_room FOREIGN KEY (room_id)
        REFERENCES rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm mã giảm giá: tạo trước vì bookings và food_orders tham chiếu đến
-- ============================================================

CREATE TABLE IF NOT EXISTS vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    discount_type ENUM('percent', 'fixed') NOT NULL,
    discount_value DECIMAL(12,2) NOT NULL,
    min_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    max_uses INT NULL,
    used_count INT NOT NULL DEFAULT 0,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_vouchers_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm đặt phòng: mỗi dòng là một phòng, lưu giá tại thời điểm đặt
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    voucher_id INT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL DEFAULT 1,
    price_per_night DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bookings_room_dates (room_id, check_in, check_out),
    INDEX idx_bookings_status (status),
    CONSTRAINT chk_bookings_dates CHECK (check_out > check_in),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_room FOREIGN KEY (room_id)
        REFERENCES rooms (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_voucher FOREIGN KEY (voucher_id)
        REFERENCES vouchers (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm dịch vụ khách sạn: danh mục dịch vụ và yêu cầu dịch vụ
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category ENUM('breakfast', 'buffet', 'massage', 'laundry', 'housekeeping', 'motorbike_rental', 'airport_pickup', 'shuttle') NOT NULL,
    description TEXT NULL,
    price DECIMAL(12,2) NOT NULL,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_services_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    note TEXT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_bookings_status (status),
    CONSTRAINT fk_service_bookings_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_service_bookings_service FOREIGN KEY (service_id)
        REFERENCES services (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm đồ ăn và đồ uống: thực đơn, đơn giao đến phòng và từng món trong đơn
-- ============================================================

CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category ENUM('food', 'coffee', 'drink') NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    image_url VARCHAR(500) NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_menu_items_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    voucher_id INT NULL,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12,2) NOT NULL,
    note TEXT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_food_orders_status (status),
    CONSTRAINT fk_food_orders_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_food_orders_voucher FOREIGN KEY (voucher_id)
        REFERENCES vouchers (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_food_order_items_food_order FOREIGN KEY (food_order_id)
        REFERENCES food_orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_food_order_items_menu_item FOREIGN KEY (menu_item_id)
        REFERENCES menu_items (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm du lịch: tour địa phương, đặt tour và đặt xe (không cần đặt phòng)
-- ============================================================

CREATE TABLE IF NOT EXISTS tours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    location VARCHAR(200) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tour_id INT NOT NULL,
    tour_date DATE NOT NULL,
    participants INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    note TEXT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tour_bookings_status (status),
    CONSTRAINT fk_tour_bookings_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tour_bookings_tour FOREIGN KEY (tour_id)
        REFERENCES tours (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transport_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NULL,
    pickup_location VARCHAR(255) NULL,
    dropoff_location VARCHAR(255) NULL,
    flight_number VARCHAR(20) NULL,
    vehicle_plate VARCHAR(20) NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    note TEXT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_transport_bookings_status (status),
    CONSTRAINT fk_transport_bookings_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transport_bookings_service FOREIGN KEY (service_id)
        REFERENCES services (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm hỗ trợ: yêu cầu hỗ trợ và tin nhắn trao đổi với lễ tân
-- ============================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    status ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_support_tickets_status (status),
    CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ticket_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id)
        REFERENCES support_tickets (id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_messages_sender FOREIGN KEY (sender_id)
        REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm đánh giá: mỗi dòng gắn với đúng một đơn, mỗi đơn được đánh giá một lần
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NULL,
    service_booking_id INT NULL,
    food_order_id INT NULL,
    tour_booking_id INT NULL,
    transport_booking_id INT NULL,
    rating TINYINT NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_reviews_booking UNIQUE (booking_id),
    CONSTRAINT uq_reviews_service_booking UNIQUE (service_booking_id),
    CONSTRAINT uq_reviews_food_order UNIQUE (food_order_id),
    CONSTRAINT uq_reviews_tour_booking UNIQUE (tour_booking_id),
    CONSTRAINT uq_reviews_transport_booking UNIQUE (transport_booking_id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_reviews_one_target CHECK (
        (booking_id IS NOT NULL)
        + (service_booking_id IS NOT NULL)
        + (food_order_id IS NOT NULL)
        + (tour_booking_id IS NOT NULL)
        + (transport_booking_id IS NOT NULL) = 1
    ),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reviews_service_booking FOREIGN KEY (service_booking_id)
        REFERENCES service_bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reviews_food_order FOREIGN KEY (food_order_id)
        REFERENCES food_orders (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reviews_tour_booking FOREIGN KEY (tour_booking_id)
        REFERENCES tour_bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reviews_transport_booking FOREIGN KEY (transport_booking_id)
        REFERENCES transport_bookings (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm thanh toán và hóa đơn: thanh toán giả lập, mỗi dòng gắn với đúng một đơn
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NULL,
    service_booking_id INT NULL,
    food_order_id INT NULL,
    tour_booking_id INT NULL,
    transport_booking_id INT NULL,
    amount DECIMAL(12,2) NOT NULL,
    method ENUM('cash', 'card', 'e_wallet') NOT NULL,
    status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    paid_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payments_status (status),
    CONSTRAINT chk_payments_one_target CHECK (
        (booking_id IS NOT NULL)
        + (service_booking_id IS NOT NULL)
        + (food_order_id IS NOT NULL)
        + (tour_booking_id IS NOT NULL)
        + (transport_booking_id IS NOT NULL) = 1
    ),
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_service_booking FOREIGN KEY (service_booking_id)
        REFERENCES service_bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_food_order FOREIGN KEY (food_order_id)
        REFERENCES food_orders (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_tour_booking FOREIGN KEY (tour_booking_id)
        REFERENCES tour_bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_transport_booking FOREIGN KEY (transport_booking_id)
        REFERENCES transport_bookings (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    issued_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_invoices_payment UNIQUE (payment_id),
    CONSTRAINT uq_invoices_invoice_number UNIQUE (invoice_number),
    CONSTRAINT fk_invoices_payment FOREIGN KEY (payment_id)
        REFERENCES payments (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Nhóm thông báo: thông báo trong ứng dụng
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
