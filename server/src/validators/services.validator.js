import { query } from 'express-validator';
import { SERVICE_CATEGORIES } from '../config/services.js';
import { idParamRule, paginationRules } from './common.rules.js';

const CATEGORY_MESSAGE = `Category must be one of: ${SERVICE_CATEGORIES.join(', ')}`;

// location: query (lọc danh sách) hoặc body (thêm, sửa dịch vụ). Bắt buộc, trừ khi gọi .optional().
export const categoryRule = (location) =>
  location('category')
    .isString()
    .withMessage(CATEGORY_MESSAGE)
    .bail()
    .isIn(SERVICE_CATEGORIES)
    .withMessage(CATEGORY_MESSAGE);

export const serviceIdValidator = [idParamRule('Invalid service ID')];

export const listServicesValidator = [categoryRule(query).optional(), ...paginationRules()];
