import {
  CATALOG_DESCRIPTION_MAX_LENGTH,
  CATALOG_NAME_MAX_LENGTH,
  TOUR_DURATION_MAX_LENGTH,
  TOUR_LOCATION_MAX_LENGTH,
} from './adminCatalog.js';
import { MENU_CATEGORIES, MENU_CATEGORY_KEYS } from './food.js';
import { HOTEL_SERVICE_CATEGORIES, HOTEL_SERVICE_CATEGORY_KEYS } from './services.js';
import { TRANSPORT_CATEGORIES, TRANSPORT_CATEGORY_KEYS } from './tourism.js';

// Các trường của form thêm/sửa dịch vụ, món ăn và tour, giống validator của backend
// (server/src/validators/admin/{services,menuItems,tours}.validator.js). Xem toCatalogForm,
// validateCatalogForm và toCatalogPayload trong utils/catalogValidation.js.

// 8 loại dịch vụ: 5 loại dịch vụ khách sạn và 3 loại vận chuyển (ghi rõ "Transport: ...").
export const getAdminServiceCategoryLabel = (category) => {
  if (HOTEL_SERVICE_CATEGORIES[category]) return HOTEL_SERVICE_CATEGORIES[category].label;
  if (TRANSPORT_CATEGORIES[category]) return `Transport: ${TRANSPORT_CATEGORIES[category].label}`;
  return category;
};

// Đơn vị giá hiện sau giá, ví dụ "per person". Lấy theo loại, vì bảng services không có cột đơn vị.
export const getAdminServicePriceUnit = (category) =>
  HOTEL_SERVICE_CATEGORIES[category]?.priceUnit ?? TRANSPORT_CATEGORIES[category]?.priceUnit ?? '';

export const ADMIN_SERVICE_CATEGORY_OPTIONS = [...HOTEL_SERVICE_CATEGORY_KEYS, ...TRANSPORT_CATEGORY_KEYS].map(
  (key) => ({ value: key, label: getAdminServiceCategoryLabel(key) }),
);

export const ADMIN_MENU_CATEGORY_OPTIONS = MENU_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: MENU_CATEGORIES[key].label,
}));

const nameField = { name: 'name', label: 'Name', kind: 'text', max: CATALOG_NAME_MAX_LENGTH };
const descriptionField = {
  name: 'description',
  label: 'Description (optional)',
  kind: 'textarea',
  max: CATALOG_DESCRIPTION_MAX_LENGTH,
};
const imageField = { name: 'image_url', label: 'Image (optional)', kind: 'image' };

export const SERVICE_FIELDS = [
  { ...nameField, placeholder: 'For example: Full body massage' },
  {
    name: 'category',
    label: 'Category',
    kind: 'select',
    half: true,
    options: [{ value: '', label: 'Choose a category' }, ...ADMIN_SERVICE_CATEGORY_OPTIONS],
  },
  { name: 'price', label: 'Price (VND)', kind: 'price', half: true, hint: 'Per unit of the category, for example per person. 0 means free.' },
  descriptionField,
  imageField,
];

export const MENU_ITEM_FIELDS = [
  { ...nameField, placeholder: 'For example: Pho Bo' },
  {
    name: 'category',
    label: 'Category',
    kind: 'select',
    half: true,
    options: [{ value: '', label: 'Choose a category' }, ...ADMIN_MENU_CATEGORY_OPTIONS],
  },
  { name: 'price', label: 'Price (VND)', kind: 'price', half: true },
  imageField,
];

export const TOUR_FIELDS = [
  { ...nameField, placeholder: 'For example: Hoi An Ancient Town' },
  {
    name: 'location',
    label: 'Location',
    kind: 'text',
    half: true,
    max: TOUR_LOCATION_MAX_LENGTH,
    placeholder: 'For example: Da Nang',
  },
  {
    name: 'duration',
    label: 'Duration',
    kind: 'text',
    half: true,
    max: TOUR_DURATION_MAX_LENGTH,
    placeholder: 'For example: Half day',
  },
  { name: 'price', label: 'Price per person (VND)', kind: 'price', half: true },
  descriptionField,
  imageField,
];
