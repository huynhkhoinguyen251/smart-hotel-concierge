// Đồ ăn và đồ uống (Mục 5 của proposal.md). Giới hạn giống backend (server/src/config/food.js).

// 3 loại món trong thực đơn và nhãn hiển thị.
export const MENU_CATEGORIES = {
  food: { label: 'Food' },
  coffee: { label: 'Coffee' },
  drink: { label: 'Drinks' },
};

export const MENU_CATEGORY_KEYS = Object.keys(MENU_CATEGORIES);

export const isMenuCategory = (category) => Object.hasOwn(MENU_CATEGORIES, category);

export const getMenuCategoryLabel = (category) => MENU_CATEGORIES[category]?.label ?? category;

// Các tab lọc của trang thực đơn: All + 3 loại.
export const MENU_CATEGORY_TABS = [
  { value: '', label: 'All' },
  ...MENU_CATEGORY_KEYS.map((key) => ({ value: key, label: MENU_CATEGORIES[key].label })),
];

// Giỏ hàng: tối đa 20 món khác nhau, mỗi món 1–20 phần.
export const MAX_ORDER_LINES = 20;
export const MIN_ITEM_QUANTITY = 1;
export const MAX_ITEM_QUANTITY = 20;
// Giống noteRule của backend và ô ghi chú của trang dịch vụ.
export const FOOD_NOTE_MAX_LENGTH = 1000;

// Chỉ đơn đặt phòng đang ở trạng thái này mới nhận đồ ăn giao đến phòng (backend kiểm tra lại).
export const FOOD_ORDER_BOOKING_STATUS = 'checked_in';

// Khóa localStorage của giỏ hàng.
export const CART_STORAGE_KEY = 'shc_food_cart';

export const FOOD_ORDER_CREATED_MESSAGE = 'Your order has been placed.';
export const FOOD_ORDER_CANCELLED_MESSAGE = 'Your order has been cancelled.';
export const ADMIN_FOOD_NOTE = 'Admin accounts cannot order food.';
export const NO_CHECKED_IN_BOOKING_NOTE = 'Food delivery to your room is available after you check in.';

// Các bước của đơn đồ ăn theo thứ tự; cancelled hiện riêng.
export const FOOD_ORDER_STEPS = ['pending', 'confirmed', 'preparing', 'delivering', 'completed'];
