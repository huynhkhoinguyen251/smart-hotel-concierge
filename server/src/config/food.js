// Hằng số nghiệp vụ của đồ ăn và đồ uống, theo Mục 5 của proposal.md.

// 3 giá trị ENUM của cột menu_items.category trong database/schema.sql.
export const MENU_CATEGORIES = ['food', 'coffee', 'drink'];

export const FOOD_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'delivering',
  'completed',
  'cancelled',
];

// Luồng trạng thái của đơn đồ ăn. Admin hủy được khi còn pending hoặc confirmed.
export const FOOD_ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['delivering'],
  delivering: ['completed'],
};

// Chỉ đơn đặt phòng đang ở trạng thái này mới đặt được đồ ăn giao đến phòng.
export const FOOD_ORDER_BOOKING_STATUS = 'checked_in';

// User chỉ tự hủy được đơn còn ở trạng thái này.
export const USER_CANCELLABLE_FOOD_ORDER_STATUS = 'pending';

// Số món khác nhau trong một đơn, và số lượng của mỗi món.
export const MIN_ORDER_LINES = 1;
export const MAX_ORDER_LINES = 20;
export const MIN_ITEM_QUANTITY = 1;
export const MAX_ITEM_QUANTITY = 20;
