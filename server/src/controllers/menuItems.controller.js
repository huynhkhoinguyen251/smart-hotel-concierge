import { matchedData } from 'express-validator';
import * as menuItemsService from '../services/menuItems.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export const getMenuItems = async (req, res) => {
  const { menuItems, pagination } = await menuItemsService.listMenuItems(matchedData(req));
  sendPaginated(res, menuItems, pagination);
};

export const getMenuItem = async (req, res) => {
  const { id } = matchedData(req);
  const menuItem = await menuItemsService.getMenuItem(id);
  sendSuccess(res, menuItem, 'Menu item retrieved successfully');
};
