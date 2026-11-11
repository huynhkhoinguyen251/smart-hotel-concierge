import * as menuItemsModel from '../models/menuItems.model.js';
import AppError from '../utils/AppError.js';
import { getPagination } from '../utils/pagination.js';

export const MENU_ITEM_NOT_FOUND = 'Menu item not found';

// Dữ liệu trả về cho khách; không có is_available và thời gian tạo/sửa.
const toPublicMenuItem = ({ id, name, category, price, image_url }) => ({
  id,
  name,
  category,
  price,
  image_url,
});

// Chỉ trả món đang bán.
export const listMenuItems = async ({ page, limit, category }) => {
  const pagination = getPagination({ page, limit });
  const filters = { category, is_available: true };

  const [menuItems, total] = await Promise.all([
    menuItemsModel.findMenuItems({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    menuItemsModel.countMenuItems(filters),
  ]);

  return {
    menuItems: menuItems.map(toPublicMenuItem),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

// Món đã tắt được xem như không tồn tại.
export const getMenuItem = async (id) => {
  const menuItem = await menuItemsModel.findMenuItemById(id);
  if (!menuItem || !menuItem.is_available) {
    throw new AppError(404, MENU_ITEM_NOT_FOUND);
  }
  return toPublicMenuItem(menuItem);
};
