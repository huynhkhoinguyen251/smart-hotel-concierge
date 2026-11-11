import { body, param, query } from 'express-validator';

// Giá trị lớn nhất và nhỏ nhất của cột INT trong MySQL.
export const MAX_INT = 2147483647;
export const MIN_INT = -2147483648;
export const MAX_PAGE_LIMIT = 50;

// DECIMAL(12,2): tối đa 10 chữ số phần nguyên và 2 chữ số thập phân.
export const PRICE_PATTERN = /^\d{1,10}(\.\d{1,2})?$/;

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

// Link ảnh hợp lệ: http://, https:// hoặc ảnh đã upload lên /uploads/.
export const isImageUrl = (value) => isHttpUrl(value) || UPLOAD_PATH_PATTERN.test(value);

// Chỉ nhận số hoặc chuỗi. Các validator có sẵn như isInt chạy trên từng phần tử của mảng,
// nên phải chặn mảng trước, nếu không [1, 2] sẽ lọt xuống câu SQL.
export const isScalar = (value) => typeof value === 'number' || typeof value === 'string';

// true/false trong JSON, hoặc chuỗi 'true', 'false', '1', '0'.
const BOOLEAN_STRINGS = ['true', 'false', '1', '0'];
export const isBooleanLike = (value) =>
  typeof value === 'boolean' || BOOLEAN_STRINGS.includes(value);

// isString đứng đầu để chặn số, mảng và object trước khi kiểm tra tiếp.

export const fullNameRule = () =>
  body('full_name')
    .isString()
    .withMessage('Full name is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Full name must be at most 100 characters');

// Không bắt buộc: bỏ qua khi không gửi hoặc gửi null.
export const phoneRule = () =>
  body('phone')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Phone number is invalid')
    .bail()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must be at most 20 characters');

// Mật khẩu không bị trim, vì khoảng trắng cũng là một phần của mật khẩu.
export const newPasswordRule = (field, label) =>
  body(field)
    .isString()
    .withMessage(`${label} is required`)
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage(`${label} must be 8 to 72 characters long`)
    .bail()
    // Bcrypt chỉ dùng 72 byte đầu và âm thầm bỏ phần còn lại. Chữ có dấu chiếm nhiều byte
    // hơn, nên mật khẩu dưới 72 ký tự vẫn có thể vượt giới hạn này.
    .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage(`${label} is too long; use fewer accented characters`);

// Ghi chú của đơn, không bắt buộc. null hoặc chuỗi rỗng nghĩa là không có ghi chú.
export const noteRule = () =>
  body('note')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Note must be text')
    .bail()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Note must be at most 1000 characters')
    .customSanitizer((value) => (value === '' ? null : value));

// :id trên đường dẫn.
export const idParamRule = (message) =>
  param('id').isInt({ min: 1, max: MAX_INT }).withMessage(message).bail().toInt();

// Số nguyên trên query string, không bắt buộc.
export const queryIntRule = (field, message, { min = 1, max = MAX_INT } = {}) =>
  query(field)
    .optional()
    .isString()
    .withMessage(message)
    .bail()
    .isInt({ min, max })
    .withMessage(message)
    .bail()
    .toInt();

// Số nguyên trong body JSON. Bắt buộc, trừ khi gọi thêm .optional().
export const bodyIntRule = (field, message, { min = 1, max = MAX_INT } = {}) =>
  body(field)
    .custom(isScalar)
    .withMessage(message)
    .bail()
    .isInt({ min, max })
    .withMessage(message)
    .bail()
    .toInt();

export const paginationRules = () => [
  queryIntRule('page', 'Page (page) must be an integer of at least 1'),
  queryIntRule('limit', `Page size (limit) must be an integer from 1 to ${MAX_PAGE_LIMIT}`, {
    max: MAX_PAGE_LIMIT,
  }),
];

// Body phải có ít nhất một trong các trường này, dùng cho API sửa một phần.
export const atLeastOneFieldRule = (fields, message) =>
  body()
    .custom((value) => fields.some((field) => value?.[field] !== undefined))
    .withMessage(message);
