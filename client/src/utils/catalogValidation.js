import {
  AMENITY_NAME_MAX_LENGTH,
  FLOOR_MAX,
  FLOOR_MIN,
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  IMAGE_URL_MAX_LENGTH,
  MAX_CAPACITY,
  MIN_CAPACITY,
  PRICE_PATTERN,
  ROOM_NUMBER_MAX_LENGTH,
  ROOM_TYPE_DESCRIPTION_MAX_LENGTH,
  ROOM_TYPE_NAME_MAX_LENGTH,
  UPLOAD_PATH_PATTERN,
} from '../config/adminCatalog.js';

// Kiểm tra form danh mục phòng ở trình duyệt, giống validator của backend (backend vẫn kiểm tra lại).
// Các hàm validate* trả { tên ô: lỗi }; object rỗng nghĩa là hợp lệ.

const INTEGER_PATTERN = /^-?\d+$/;

const requiredText = (value, label, max) => {
  const text = String(value ?? '').trim();
  if (!text) return `${label} is required`;
  if (text.length > max) return `${label} must be at most ${max} characters`;
  return '';
};

// form: { room_type_id, room_number, floor } (giá trị của ô nhập, dạng chuỗi).
export const validateRoomForm = (form) => {
  const errors = {};
  if (!form.room_type_id) errors.room_type_id = 'Choose a room type';
  const numberError = requiredText(form.room_number, 'Room number', ROOM_NUMBER_MAX_LENGTH);
  if (numberError) errors.room_number = numberError;
  const floor = String(form.floor ?? '').trim();
  if (!floor) errors.floor = 'Floor is required';
  else if (!INTEGER_PATTERN.test(floor) || Number(floor) < FLOOR_MIN || Number(floor) > FLOOR_MAX) {
    errors.floor = 'Floor must be a whole number';
  }
  return errors;
};

// Dữ liệu gửi lên từ form phòng (số phòng đã trim, các id và tầng là số).
export const toRoomPayload = (form) => ({
  room_type_id: Number(form.room_type_id),
  room_number: form.room_number.trim(),
  floor: Number(form.floor),
});

// form: { name, description, price_per_night, capacity, amenity_ids: [số] }.
export const validateRoomTypeForm = (form) => {
  const errors = {};
  const nameError = requiredText(form.name, 'Name', ROOM_TYPE_NAME_MAX_LENGTH);
  if (nameError) errors.name = nameError;
  if (form.description.trim().length > ROOM_TYPE_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be at most ${ROOM_TYPE_DESCRIPTION_MAX_LENGTH} characters`;
  }
  const price = String(form.price_per_night ?? '').trim();
  if (!PRICE_PATTERN.test(price) || Number(price) <= 0) {
    errors.price_per_night = 'Enter a price greater than 0, with at most 2 decimal places';
  }
  const capacity = String(form.capacity ?? '').trim();
  if (!/^\d+$/.test(capacity) || Number(capacity) < MIN_CAPACITY || Number(capacity) > MAX_CAPACITY) {
    errors.capacity = `Capacity must be a whole number from ${MIN_CAPACITY} to ${MAX_CAPACITY}`;
  }
  return errors;
};

// Mô tả rỗng gửi null để xóa mô tả. amenity_ids được sắp xếp để so sánh dễ.
export const toRoomTypePayload = (form) => ({
  name: form.name.trim(),
  description: form.description.trim() || null,
  price_per_night: Number(form.price_per_night),
  capacity: Number(form.capacity),
  amenity_ids: [...form.amenity_ids].sort((a, b) => a - b),
});

export const validateAmenityName = (name) => requiredText(name, 'Amenity name', AMENITY_NAME_MAX_LENGTH);

// Chỉ giữ các trường có giá trị khác bản gốc (so sánh mảng bằng JSON), để PUT chỉ gửi phần đã đổi.
export const getChangedFields = (next, original) =>
  Object.fromEntries(
    Object.entries(next).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(original[key])),
  );

// File ảnh trước khi upload: đúng loại và không quá 5 MB. Trả lỗi hoặc ''.
export const validateImageFile = (file) => {
  if (!file) return 'Choose an image file';
  if (!IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG and WebP images are allowed';
  if (file.size > IMAGE_MAX_BYTES) return 'Image must be at most 5 MB';
  return '';
};

// Link ảnh: http(s)://... hợp lệ, hoặc ảnh đã upload /uploads/<tên>.<jpg|png|webp>. Trả lỗi hoặc ''.
export const validateImageUrl = (value) => {
  const url = value.trim();
  if (!url) return 'Enter an image URL';
  if (url.length > IMAGE_URL_MAX_LENGTH) return `Image URL must be at most ${IMAGE_URL_MAX_LENGTH} characters`;
  if (UPLOAD_PATH_PATTERN.test(url)) return '';
  if (/^https?:\/\//.test(url)) {
    try {
      new URL(url);
      return '';
    } catch {
      // Rơi xuống thông báo bên dưới.
    }
  }
  return 'Use a link starting with http://, https:// or /uploads/';
};

// 1536000 thành "1.5 MB".
export const formatFileSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// ---- Form danh mục dịch vụ, thực đơn và tour (bước 11) ----
// fields: [{ name, label, kind, required?, max?, options? }], kind là một trong
// 'text' | 'textarea' | 'select' | 'price' | 'image'. Một danh sách fields dùng cho cả form,
// kiểm tra dữ liệu và dữ liệu gửi lên, nên ba danh mục dùng chung một form.

// Giá trị ban đầu của form: từ mục đang sửa (item), hoặc rỗng khi thêm mới.
// flag: 'is_active' hoặc 'is_available'; mục mới mặc định đang bật.
export const toCatalogForm = (item, fields, flag) => ({
  ...Object.fromEntries(
    fields.map((field) => {
      const value = item?.[field.name];
      return [field.name, value === null || value === undefined ? '' : String(value)];
    }),
  ),
  [flag]: item ? Boolean(item[flag]) : true,
});

export const validateCatalogForm = (form, fields) => {
  const errors = {};
  fields.forEach((field) => {
    const text = String(form[field.name] ?? '').trim();
    let error = '';
    if (field.kind === 'text') {
      error = requiredText(text, field.label, field.max);
    } else if (field.kind === 'textarea') {
      if (text.length > field.max) error = `${field.label} must be at most ${field.max} characters`;
    } else if (field.kind === 'select') {
      if (!field.options.some((option) => option.value && option.value === text)) {
        error = `Choose a ${field.label.toLowerCase()}`;
      }
    } else if (field.kind === 'price') {
      if (!PRICE_PATTERN.test(text)) error = 'Enter a price of at least 0, with at most 2 decimal places';
    } else if (field.kind === 'image') {
      if (text) error = validateImageUrl(text);
    }
    if (error) errors[field.name] = error;
  });
  return errors;
};

// Dữ liệu gửi lên cho POST và PUT. PUT sửa toàn bộ, nên luôn gửi đủ mọi trường:
// mô tả và ảnh rỗng gửi null (xóa), giá là số. values: form, hoặc một mục trong danh sách
// (dùng khi bật/tắt nhanh: gửi lại đúng dữ liệu cũ, chỉ đổi flag).
export const toCatalogPayload = (values, fields, flag, flagValue = values[flag]) => ({
  ...Object.fromEntries(
    fields.map((field) => {
      const text = String(values[field.name] ?? '').trim();
      if (field.kind === 'price') return [field.name, Number(text)];
      if (field.kind === 'textarea' || field.kind === 'image') return [field.name, text || null];
      return [field.name, text];
    }),
  ),
  [flag]: Boolean(flagValue),
});
