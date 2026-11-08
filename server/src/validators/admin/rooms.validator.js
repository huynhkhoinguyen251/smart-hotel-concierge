import { body, query } from 'express-validator';
import {
  atLeastOneFieldRule,
  bodyIntRule,
  idParamRule,
  MAX_INT,
  MIN_INT,
  paginationRules,
  queryIntRule,
} from '../common.rules.js';
import { roomIdValidator } from '../rooms.validator.js';

export const ROOM_STATUSES = ['available', 'maintenance', 'inactive'];
const STATUS_MESSAGE = `Status must be one of: ${ROOM_STATUSES.join(', ')}`;

// Ảnh đã upload có dạng /uploads/<uuid>.<jpg|png|webp>, đúng như middleware uploadImage tạo ra.
const UPLOAD_PATH_PATTERN = /^\/uploads\/[A-Za-z0-9-]+\.(jpg|png|webp)$/;

const isHttpUrl = (value) => {
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const statusRule = (location) =>
  location('status')
    .isString()
    .withMessage(STATUS_MESSAGE)
    .bail()
    .isIn(ROOM_STATUSES)
    .withMessage(STATUS_MESSAGE);

const roomTypeIdRule = () =>
  bodyIntRule('room_type_id', 'Room type (room_type_id) must be a positive integer');

const roomNumberRule = () =>
  body('room_number')
    .isString()
    .withMessage('Room number is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Room number is required')
    .bail()
    .isLength({ max: 10 })
    .withMessage('Room number must be at most 10 characters');

const floorRule = () =>
  bodyIntRule('floor', 'Floor must be an integer', { min: MIN_INT, max: MAX_INT });

export const listAdminRoomsValidator = [
  statusRule(query).optional(),
  queryIntRule('room_type_id', 'Room type (room_type_id) must be a positive integer'),
  query('search')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Search (search) must be text')
    .bail()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Search (search) must be at most 10 characters'),
  ...paginationRules(),
];

export const createRoomValidator = [
  roomTypeIdRule(),
  roomNumberRule(),
  floorRule(),
  statusRule(body).optional(),
];

export const updateRoomValidator = [
  ...roomIdValidator,
  atLeastOneFieldRule(
    ['room_type_id', 'room_number', 'floor'],
    'Provide room_type_id, room_number or floor to update',
  ),
  roomTypeIdRule().optional(),
  roomNumberRule().optional(),
  floorRule().optional(),
];

export const updateRoomStatusValidator = [...roomIdValidator, statusRule(body)];

export const addRoomImageValidator = [
  ...roomIdValidator,
  body('image_url')
    .isString()
    .withMessage('Image URL is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .bail()
    .isLength({ max: 500 })
    .withMessage('Image URL must be at most 500 characters')
    .bail()
    .custom((value) => isHttpUrl(value) || UPLOAD_PATH_PATTERN.test(value))
    .withMessage('Image URL must be a valid link starting with http://, https:// or /uploads/'),
  body('is_primary')
    .optional()
    .custom((value) => typeof value === 'boolean' || ['true', 'false', '1', '0'].includes(value))
    .withMessage('is_primary must be true or false')
    .bail()
    .toBoolean(true),
];

export const imageIdValidator = [idParamRule('Invalid image ID')];
