import { body, query } from 'express-validator';
import {
  FOOD_ORDER_STATUSES,
  MAX_ITEM_QUANTITY,
  MAX_ORDER_LINES,
  MIN_ITEM_QUANTITY,
  MIN_ORDER_LINES,
} from '../config/food.js';
import { bodyIntRule, idParamRule, noteRule, paginationRules } from './common.rules.js';

const STATUS_MESSAGE = `Status must be one of: ${FOOD_ORDER_STATUSES.join(', ')}`;

// location: query (lọc danh sách) hoặc body (admin đổi trạng thái).
// Bắt buộc, trừ khi gọi .optional().
export const foodOrderStatusRule = (location) =>
  location('status')
    .isString()
    .withMessage(STATUS_MESSAGE)
    .bail()
    .isIn(FOOD_ORDER_STATUSES)
    .withMessage(STATUS_MESSAGE);

export const foodOrderIdValidator = [idParamRule('Invalid food order ID')];

// Chạy sau các rule của từng món, nên menu_item_id hợp lệ đã được đổi sang số nguyên.
const hasNoDuplicateMenuItems = (items) => {
  if (!Array.isArray(items)) {
    return true;
  }
  const ids = items.map((item) => String(item?.menu_item_id));
  return new Set(ids).size === ids.length;
};

// Giá không có trong danh sách này, nên giá do client gửi lên bị bỏ qua.
export const createFoodOrderValidator = [
  bodyIntRule('booking_id', 'Booking (booking_id) must be a positive integer'),
  body('items')
    .isArray({ min: MIN_ORDER_LINES, max: MAX_ORDER_LINES })
    .withMessage(`Items must be a list of ${MIN_ORDER_LINES} to ${MAX_ORDER_LINES} menu items`),
  bodyIntRule('items.*.menu_item_id', 'Menu item (menu_item_id) must be a positive integer'),
  bodyIntRule(
    'items.*.quantity',
    `Quantity must be an integer from ${MIN_ITEM_QUANTITY} to ${MAX_ITEM_QUANTITY}`,
    { min: MIN_ITEM_QUANTITY, max: MAX_ITEM_QUANTITY },
  ),
  body('items')
    .custom(hasNoDuplicateMenuItems)
    .withMessage('Each menu item can appear only once in an order'),
  noteRule(),
];

export const listMyFoodOrdersValidator = [
  foodOrderStatusRule(query).optional(),
  ...paginationRules(),
];
