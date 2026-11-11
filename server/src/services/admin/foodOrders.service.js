import { withTransaction } from '../../config/db.js';
import { FOOD_ORDER_TRANSITIONS } from '../../config/food.js';
import * as foodOrdersModel from '../../models/foodOrders.model.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/pagination.js';
import {
  FOOD_ORDER_NOT_FOUND,
  findFoodOrderOr404,
  getFoodOrderDetail,
  toFoodOrderResponse,
} from '../foodOrders.service.js';

export const listFoodOrders = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [foodOrders, total] = await Promise.all([
    foodOrdersModel.findFoodOrders({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    foodOrdersModel.countFoodOrders(filters),
  ]);

  return {
    foodOrders: foodOrders.map((foodOrder) => toFoodOrderResponse(foodOrder, { withUser: true })),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getFoodOrder = async (id) =>
  getFoodOrderDetail(await findFoodOrderOr404(id), { withUser: true });

// Đổi trạng thái theo luồng trong config/food.js.
export const updateFoodOrderStatus = async (id, status) => {
  await withTransaction(async (conn) => {
    const foodOrder = await foodOrdersModel.lockFoodOrderById(id, conn);
    if (!foodOrder) {
      throw new AppError(404, FOOD_ORDER_NOT_FOUND);
    }
    if (!FOOD_ORDER_TRANSITIONS[foodOrder.status]?.includes(status)) {
      throw new AppError(400, `Cannot change status from ${foodOrder.status} to ${status}`);
    }

    await foodOrdersModel.updateFoodOrderStatus(foodOrder.id, status, conn);
  });

  return getFoodOrder(id);
};
