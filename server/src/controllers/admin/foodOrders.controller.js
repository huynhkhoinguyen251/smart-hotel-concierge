import { matchedData } from 'express-validator';
import * as foodOrdersService from '../../services/admin/foodOrders.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getFoodOrders = async (req, res) => {
  const { foodOrders, pagination } = await foodOrdersService.listFoodOrders(matchedData(req));
  sendPaginated(res, foodOrders, pagination);
};

export const getFoodOrder = async (req, res) => {
  const { id } = matchedData(req);
  const foodOrder = await foodOrdersService.getFoodOrder(id);
  sendSuccess(res, foodOrder, 'Food order retrieved successfully');
};

export const updateFoodOrderStatus = async (req, res) => {
  const { id, status } = matchedData(req);
  const foodOrder = await foodOrdersService.updateFoodOrderStatus(id, status);
  sendSuccess(res, foodOrder, 'Food order status updated successfully');
};
