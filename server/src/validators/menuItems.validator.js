import { query } from 'express-validator';
import { MENU_CATEGORIES } from '../config/food.js';
import { idParamRule, paginationRules } from './common.rules.js';

const CATEGORY_MESSAGE = `Category must be one of: ${MENU_CATEGORIES.join(', ')}`;

// location: query (lọc danh sách) hoặc body (thêm, sửa món). Bắt buộc, trừ khi gọi .optional().
export const menuCategoryRule = (location) =>
  location('category')
    .isString()
    .withMessage(CATEGORY_MESSAGE)
    .bail()
    .isIn(MENU_CATEGORIES)
    .withMessage(CATEGORY_MESSAGE);

export const menuItemIdValidator = [idParamRule('Invalid menu item ID')];

export const listMenuItemsValidator = [menuCategoryRule(query).optional(), ...paginationRules()];
