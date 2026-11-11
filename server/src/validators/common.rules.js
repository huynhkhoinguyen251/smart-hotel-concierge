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

// Chuỗi bắt buộc, được trim, không rỗng và tối đa max ký tự. location: body hoặc query.
export const requiredTextRule = (field, label, max, location = body) =>
  location(field)
    .isString()
    .withMessage(`${label} is required`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .bail()
    .isLength({ max })
    .withMessage(`${label} must be at most ${max} characters`);

// Giá trong body, dùng cho danh mục dịch vụ, thực đơn và tour. Được phép bằng 0.
export const priceRule = () =>
  body('price')
    .custom((value) => isScalar(value) && PRICE_PATTERN.test(String(value)))
    .withMessage('Price must be a number of at least 0 with at most 2 decimal places')
    .bail()
    .toFloat();

// Link ảnh không bắt buộc. null hoặc chuỗi rỗng nghĩa là không có ảnh.
export const imageUrlRule = () =>
  body('image_url')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Image URL must be text')
    .bail()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Image URL must be at most 500 characters')
    .bail()
    .custom((value) => value === '' || isImageUrl(value))
    .withMessage('Image URL must be a valid link starting with http://, https:// or /uploads/')
    .customSanitizer((value) => (value === '' ? null : value));

// Mô tả không bắt buộc. null hoặc chuỗi rỗng nghĩa là không có mô tả.
export const descriptionRule = () =>
  body('description')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Description must be text')
    .bail()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be at most 5000 characters')
    .customSanitizer((value) => (value === '' ? null : value));

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
