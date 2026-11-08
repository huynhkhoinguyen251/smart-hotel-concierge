import { body } from 'express-validator';
import { fullNameRule, newPasswordRule, phoneRule } from './common.rules.js';

const emailRule = () =>
  body('email')
    .isString()
    .withMessage('Email is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isLength({ max: 150 })
    .withMessage('Email must be at most 150 characters')
    .bail()
    .isEmail()
    .withMessage('Email format is invalid')
    .bail()
    .toLowerCase();

export const registerValidator = [
  fullNameRule(),
  emailRule(),
  newPasswordRule('password', 'Password'),
  phoneRule(),
];

export const loginValidator = [
  emailRule(),
  body('password')
    .isString()
    .withMessage('Password is required')
    .bail()
    .notEmpty()
    .withMessage('Password is required'),
];
