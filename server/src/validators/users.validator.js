import { body } from 'express-validator';
import { fullNameRule, newPasswordRule, phoneRule } from './common.rules.js';

export const updateMeValidator = [
  // Phải gửi ít nhất một trường. Trường không gửi thì giữ nguyên.
  body()
    .custom((value) => value?.full_name !== undefined || value?.phone !== undefined)
    .withMessage('Please provide a full name or phone number to update'),
  fullNameRule().optional(),
  phoneRule(),
];

export const changePasswordValidator = [
  body('current_password')
    .isString()
    .withMessage('Current password is required')
    .bail()
    .notEmpty()
    .withMessage('Current password is required'),
  newPasswordRule('new_password', 'New password')
    .bail()
    .custom((value, { req }) => value !== req.body.current_password)
    .withMessage('New password must be different from the current password'),
];
