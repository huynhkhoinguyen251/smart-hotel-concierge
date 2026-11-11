import { body, query } from 'express-validator';
import { paginationRules, queryIntRule } from '../common.rules.js';
import { foodOrderIdValidator, foodOrderStatusRule } from '../foodOrders.validator.js';

export const listAdminFoodOrdersValidator = [
  foodOrderStatusRule(query).optional(),
  queryIntRule('user_id', 'User (user_id) must be a positive integer'),
  ...paginationRules(),
];

export const updateFoodOrderStatusValidator = [...foodOrderIdValidator, foodOrderStatusRule(body)];

// Dùng chung với user: kiểm tra :id.
export { foodOrderIdValidator };
