import * as menuItemsModel from '../../models/menuItems.model.js';
import AppError from '../../utils/AppError.js';
import { mapDbError } from '../../utils/dbErrors.js';
import { getPagination } from '../../utils/pagination.js';
import { MENU_ITEM_NOT_FOUND } from '../menuItems.service.js';

const MENU_ITEM_IN_USE = 'This menu item is used in existing orders. Make it unavailable instead.';

const MENU_ITEM_DB_ERRORS = { referenced: MENU_ITEM_IN_USE };

const findMenuItemOr404 = async (id, conn) => {
  const menuItem = await menuItemsModel.findMenuItemById(id, conn);
  if (!menuItem) {
    throw new AppError(404, MENU_ITEM_NOT_FOUND);
  }
  return menuItem;
};

// Trường không gửi lên nhận giá trị mặc định, dùng chung cho thêm mới và sửa toàn bộ.
const withDefaults = ({ name, category, price, image_url, is_available }) => ({
  name,
  category,
  price,
  image_url: image_url ?? null,
  is_available: is_available ?? true,
});

// Admin xem tất cả món, kể cả đã tắt.
export const listMenuItems = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [menuItems, total] = await Promise.all([
    menuItemsModel.findMenuItems({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    menuItemsModel.countMenuItems(filters),
  ]);

  return { menuItems, pagination: { page: pagination.page, limit: pagination.limit, total } };
};

export const createMenuItem = async (data) => {
  const id = await menuItemsModel.createMenuItem(withDefaults(data));
  return findMenuItemOr404(id);
};

// Sửa toàn bộ: image_url và is_available không gửi lên sẽ về giá trị mặc định.
export const updateMenuItem = async (id, data) => {
  await findMenuItemOr404(id);
  await menuItemsModel.updateMenuItem(id, withDefaults(data));
  return findMenuItemOr404(id);
};

export const deleteMenuItem = async (id) => {
  await findMenuItemOr404(id);
  if (await menuItemsModel.isMenuItemOrdered(id)) {
    throw new AppError(409, MENU_ITEM_IN_USE);
  }

  try {
    await menuItemsModel.deleteMenuItem(id);
  } catch (error) {
    // Có đơn mới dùng món này ngay sau bước kiểm tra ở trên.
    throw mapDbError(error, MENU_ITEM_DB_ERRORS);
  }
};
