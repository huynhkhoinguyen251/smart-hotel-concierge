import { body } from 'express-validator';
import { idParamRule } from '../common.rules.js';

export const amenityIdValidator = [idParamRule('Invalid amenity ID')];

const nameRule = () =>
  body('name')
    .isString()
    .withMessage('Amenity name is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Amenity name is required')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Amenity name must be at most 100 characters');

export const createAmenityValidator = [nameRule()];

export const updateAmenityValidator = [...amenityIdValidator, nameRule()];
