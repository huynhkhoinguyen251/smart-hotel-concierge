import { matchedData } from 'express-validator';
import * as menuItemsService from '../../services/admin/menuItems.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getMenuItems = async (req, res) => {
  const { menuItems, pagination } = await menuItemsService.listMenuItems(matchedData(req));
  sendPaginated(res, menuItems, pagination);
};

export const createMenuItem = async (req, res) => {
  const menuItem = await menuItemsService.createMenuItem(matchedData(req));
  sendSuccess(res, menuItem, 'Menu item created successfully', 201);
};

export const updateMenuItem = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const menuItem = await menuItemsService.updateMenuItem(id, data);
  sendSuccess(res, menuItem, 'Menu item updated successfully');
};

export const deleteMenuItem = async (req, res) => {
  const { id } = matchedData(req);
  await menuItemsService.deleteMenuItem(id);
  sendSuccess(res, null, 'Menu item deleted successfully');
};
