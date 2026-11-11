import { matchedData } from 'express-validator';
import * as foodOrdersService from '../services/foodOrders.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

// req.user do middleware authenticate gán; user luôn lấy từ token, không lấy từ body.

export const createFoodOrder = async (req, res) => {
  const foodOrder = await foodOrdersService.createFoodOrder(req.user.id, matchedData(req));
  sendSuccess(res, foodOrder, 'Food order placed successfully', 201);
};

export const getMyFoodOrders = async (req, res) => {
  const { foodOrders, pagination } = await foodOrdersService.listMyFoodOrders(
    req.user.id,
    matchedData(req),
  );
  sendPaginated(res, foodOrders, pagination);
};

export const getMyFoodOrder = async (req, res) => {
  const { id } = matchedData(req);
  const foodOrder = await foodOrdersService.getMyFoodOrder(req.user.id, id);
  sendSuccess(res, foodOrder, 'Food order retrieved successfully');
};

export const cancelMyFoodOrder = async (req, res) => {
  const { id } = matchedData(req);
  const foodOrder = await foodOrdersService.cancelMyFoodOrder(req.user.id, id);
  sendSuccess(res, foodOrder, 'Food order cancelled successfully');
};
