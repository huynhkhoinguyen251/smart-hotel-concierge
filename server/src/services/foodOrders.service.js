import { withTransaction } from '../config/db.js';
import {
  FOOD_ORDER_BOOKING_STATUS,
  USER_CANCELLABLE_FOOD_ORDER_STATUS,
} from '../config/food.js';
import * as bookingsModel from '../models/bookings.model.js';
import * as foodOrderItemsModel from '../models/foodOrderItems.model.js';
import * as foodOrdersModel from '../models/foodOrders.model.js';
import * as menuItemsModel from '../models/menuItems.model.js';
import AppError from '../utils/AppError.js';
import { getPagination } from '../utils/pagination.js';
import { BOOKING_NOT_FOUND } from './bookings.service.js';

export const FOOD_ORDER_NOT_FOUND = 'Food order not found';
const FOOD_ORDER_FORBIDDEN = 'You do not have permission to access this food order';

// Tính tiền theo đơn vị xu (x100) để tránh sai số khi nhân và cộng số thập phân trong JavaScript.
const toCents = (amount) => Math.round(amount * 100);
const fromCents = (cents) => cents / 100;
const calculateLineTotal = (quantity, unitPrice) => fromCents(quantity * toCents(unitPrice));

const toFoodOrderItemResponse = (item) => ({
  ...item,
  line_total: calculateLineTotal(item.quantity, item.unit_price),
});

// Dữ liệu trả về của một đơn. Danh sách không kèm các món; chi tiết có thêm items.
// Đơn trong API admin có thêm user.
export const toFoodOrderResponse = (foodOrder, { items, withUser = false } = {}) => ({
  id: foodOrder.id,
  status: foodOrder.status,
  discount_amount: foodOrder.discount_amount,
  total_price: foodOrder.total_price,
  note: foodOrder.note,
  created_at: foodOrder.created_at,
  item_count: foodOrder.item_count,
  booking: foodOrder.booking,
  can_cancel: foodOrder.status === USER_CANCELLABLE_FOOD_ORDER_STATUS,
  ...(withUser && { user: foodOrder.user }),
  ...(items && { items: items.map(toFoodOrderItemResponse) }),
});

export const findFoodOrderOr404 = async (id, conn) => {
  const foodOrder = await foodOrdersModel.findFoodOrderById(id, conn);
  if (!foodOrder) {
    throw new AppError(404, FOOD_ORDER_NOT_FOUND);
  }
  return foodOrder;
};

// Đơn kèm các món, dùng cho API chi tiết.
export const getFoodOrderDetail = async (foodOrder, { withUser = false } = {}) => {
  const items = await foodOrderItemsModel.findItemsByFoodOrderId(foodOrder.id);
  return toFoodOrderResponse(foodOrder, { items, withUser });
};

// Lấy các món được đặt bằng một câu lệnh, rồi kiểm tra từng món theo thứ tự trong yêu cầu.
const loadOrderedMenuItems = async (items, conn) => {
  const menuItems = await menuItemsModel.findMenuItemsByIds(
    items.map((item) => item.menu_item_id),
    conn,
  );
  const menuItemsById = new Map(menuItems.map((menuItem) => [menuItem.id, menuItem]));

  return items.map(({ menu_item_id, quantity }) => {
    const menuItem = menuItemsById.get(menu_item_id);
    if (!menuItem) {
      throw new AppError(404, `Menu item ${menu_item_id} not found`);
    }
    if (!menuItem.is_available) {
      throw new AppError(400, `Menu item ${menuItem.name} is not available`);
    }
    // Giá lấy từ database, không tin giá do frontend gửi lên.
    return { menu_item_id, quantity, unit_price: menuItem.price };
  });
};

export const createFoodOrder = async (userId, { booking_id, items, note = null }) => {
  const id = await withTransaction(async (conn) => {
    // Khóa đơn đặt phòng, để đơn không bị đổi trạng thái trong lúc đặt món.
    const booking = await bookingsModel.lockBookingById(booking_id, conn);
    if (!booking) {
      throw new AppError(404, BOOKING_NOT_FOUND);
    }
    if (booking.user_id !== userId) {
      throw new AppError(403, 'You do not have permission to access this booking');
    }
    if (booking.status !== FOOD_ORDER_BOOKING_STATUS) {
      throw new AppError(
        400,
        `Food orders require a checked-in booking; this booking is ${booking.status}`,
      );
    }

    const lines = await loadOrderedMenuItems(items, conn);
    const totalCents = lines.reduce(
      (sum, line) => sum + line.quantity * toCents(line.unit_price),
      0,
    );

    // Voucher là tính năng Extended, chưa làm: không có voucher và không giảm giá.
    const foodOrderId = await foodOrdersModel.createFoodOrder(
      {
        booking_id: booking.id,
        voucher_id: null,
        discount_amount: 0,
        total_price: fromCents(totalCents),
        note,
      },
      conn,
    );
    await foodOrderItemsModel.createFoodOrderItems(foodOrderId, lines, conn);
    return foodOrderId;
  });

  return getFoodOrderDetail(await findFoodOrderOr404(id));
};

export const listMyFoodOrders = async (userId, { page, limit, status }) => {
  const pagination = getPagination({ page, limit });
  const filters = { user_id: userId, status };

  const [foodOrders, total] = await Promise.all([
    foodOrdersModel.findFoodOrders({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    foodOrdersModel.countFoodOrders(filters),
  ]);

  return {
    foodOrders: foodOrders.map((foodOrder) => toFoodOrderResponse(foodOrder)),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getMyFoodOrder = async (userId, id) => {
  const foodOrder = await findFoodOrderOr404(id);
  if (foodOrder.user.id !== userId) {
    throw new AppError(403, FOOD_ORDER_FORBIDDEN);
  }
  return getFoodOrderDetail(foodOrder);
};

// User chỉ tự hủy được đơn còn pending.
export const cancelMyFoodOrder = async (userId, id) => {
  await withTransaction(async (conn) => {
    const foodOrder = await foodOrdersModel.lockFoodOrderById(id, conn);
    if (!foodOrder) {
      throw new AppError(404, FOOD_ORDER_NOT_FOUND);
    }
    if (foodOrder.user_id !== userId) {
      throw new AppError(403, FOOD_ORDER_FORBIDDEN);
    }
    if (foodOrder.status !== USER_CANCELLABLE_FOOD_ORDER_STATUS) {
      throw new AppError(400, 'Only pending food orders can be cancelled');
    }

    await foodOrdersModel.updateFoodOrderStatus(foodOrder.id, 'cancelled', conn);
  });

  return getFoodOrderDetail(await findFoodOrderOr404(id));
};
