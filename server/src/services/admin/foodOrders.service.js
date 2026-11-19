import { withTransaction } from '../../config/db.js';
import { ORDER_NOT_PAID } from '../../config/payments.js';
import { FOOD_ORDER_TRANSITIONS } from '../../config/food.js';
import * as paymentsModel from '../../models/payments.model.js';
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

    // Phương án A: chỉ duyệt khi khách đã thanh toán QR.
    if (status === 'confirmed') {
      const paymentStatus = await paymentsModel.findPaymentStatusByTarget(
        'food_order_id',
        foodOrder.id,
        conn,
      );
      if (paymentStatus !== 'paid') {
        throw new AppError(400, ORDER_NOT_PAID);
      }
    }

    await foodOrdersModel.updateFoodOrderStatus(foodOrder.id, status, conn);
    if (status === 'cancelled') {
      // Hủy đơn đã thanh toán thì hoàn tiền.
      await paymentsModel.refundPaidPayment('food_order_id', foodOrder.id, conn);
    }
  });

  return getFoodOrder(id);
};
