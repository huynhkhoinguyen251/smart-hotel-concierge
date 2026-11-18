// Quản lý danh mục phòng (admin): phòng, loại phòng, tiện nghi và ảnh phòng.
// Giới hạn giống validator của backend (server/src/validators/admin/*.validator.js và uploadImage.js).

// Thanh điều hướng phụ trong mục Rooms. match(pathname): tab nào đang được chọn.
// Bước sau dùng lại cách này cho dịch vụ, thực đơn và tour.
export const ROOM_CATALOG_TABS = [
  {
    to: '/admin/rooms',
    label: 'Rooms',
    match: (pathname) => !/^\/admin\/rooms\/(types|amenities)(\/|$)/.test(pathname),
  },
  { to: '/admin/rooms/types', label: 'Room types', match: (pathname) => pathname.startsWith('/admin/rooms/types') },
  { to: '/admin/rooms/amenities', label: 'Amenities', match: (pathname) => pathname.startsWith('/admin/rooms/amenities') },
];

export const ROOM_NUMBER_MAX_LENGTH = 10;
export const ROOM_SEARCH_MAX_LENGTH = 10;
// Tầng là số nguyên (cột INT), có thể âm (tầng hầm).
export const FLOOR_MIN = -2147483648;
export const FLOOR_MAX = 2147483647;

export const ROOM_TYPE_NAME_MAX_LENGTH = 100;
export const ROOM_TYPE_DESCRIPTION_MAX_LENGTH = 5000;
export const MIN_CAPACITY = 1;
export const MAX_CAPACITY = 20;
// Giá: tối đa 10 chữ số phần nguyên và 2 chữ số thập phân, lớn hơn 0.
export const PRICE_PATTERN = /^\d{1,10}(\.\d{1,2})?$/;

export const AMENITY_NAME_MAX_LENGTH = 100;

// Ảnh: JPEG, PNG hoặc WebP, tối đa 5 MB, gửi ở trường "image".
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',');
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_URL_MAX_LENGTH = 500;
// Ảnh đã upload có dạng /uploads/<tên>.<jpg|png|webp>.
export const UPLOAD_PATH_PATTERN = /^\/uploads\/[A-Za-z0-9-]+\.(jpg|png|webp)$/;

export const ADMIN_ROOMS_PAGE_SIZE = 10;

export const ROOM_HAS_BOOKINGS_NOTE = 'This room has bookings and cannot be deleted. Set it to inactive instead.';
export const ROOM_TYPE_IN_USE_NOTE = 'Remove or move the rooms of this type first.';
export const INACTIVE_ROOM_NOTE = 'Guests will no longer see or book this room.';

// ---- Danh mục dịch vụ, thực đơn và tour (bước 11) ----
// Giới hạn giống server/src/validators/admin/{services,menuItems,tours}.validator.js và common.rules.js.

export const CATALOG_NAME_MAX_LENGTH = 150;
export const CATALOG_DESCRIPTION_MAX_LENGTH = 5000;
export const TOUR_LOCATION_MAX_LENGTH = 200;
export const TOUR_DURATION_MAX_LENGTH = 50;
export const CATALOG_PAGE_SIZE = 10;

export const CATALOG_IN_USE_NOTE = 'This item already has orders and cannot be deleted. Switch it off instead.';
export const SWITCH_OFF_NOTE = 'Guests will no longer see this item.';
export const TRANSPORT_SERVICES_NOTE =
  'Transport services (motorbike rental, airport pickup, shuttle) are booked from the Tours page by guests.';

// Tab phụ của mục Services, Food Orders và Tourism. Trang chi tiết đơn cũng thuộc tab danh sách đơn.
export const SERVICE_SECTION_TABS = [
  {
    to: '/admin/services',
    label: 'Requests',
    match: (pathname) => !pathname.startsWith('/admin/services/catalog'),
  },
  { to: '/admin/services/catalog', label: 'Catalog', match: (pathname) => pathname.startsWith('/admin/services/catalog') },
];

export const FOOD_SECTION_TABS = [
  {
    to: '/admin/food-orders',
    label: 'Orders',
    match: (pathname) => !pathname.startsWith('/admin/food-orders/menu'),
  },
  { to: '/admin/food-orders/menu', label: 'Menu', match: (pathname) => pathname.startsWith('/admin/food-orders/menu') },
];

export const TOURISM_SECTION_TABS = [
  {
    to: '/admin/tourism',
    label: 'Tour bookings',
    match: (pathname) => pathname === '/admin/tourism' || pathname.startsWith('/admin/tourism/tours/'),
  },
  { to: '/admin/tourism/transport', label: 'Transport', match: (pathname) => pathname.startsWith('/admin/tourism/transport') },
  { to: '/admin/tourism/catalog', label: 'Tours', match: (pathname) => pathname.startsWith('/admin/tourism/catalog') },
];
