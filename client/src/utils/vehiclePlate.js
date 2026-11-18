import {
  PLATE_REQUIRED_CATEGORIES,
  VEHICLE_PLATE_MAX_LENGTH,
  VEHICLE_PLATE_PATTERN,
} from '../config/adminRequests.js';

// Ô "Licence plate" trong hộp thoại duyệt đơn vận chuyển (chỉ khi chuyển sang confirmed).
// Bắt buộc với thuê xe máy; với đón sân bay và xe đưa đón thì không bắt buộc.
export const getPlateField = (category) => (action) => {
  if (action.status !== 'confirmed') return null;
  const required = PLATE_REQUIRED_CATEGORIES.includes(category);
  return {
    label: 'Licence plate',
    placeholder: 'For example: 43B1-567.89',
    hint: required ? 'Required for a motorbike rental. The guest will see it.' : 'Optional',
    maxLength: VEHICLE_PLATE_MAX_LENGTH,
    validate: (value) => {
      const plate = value.trim();
      if (!plate) return required ? 'Enter the licence plate of the motorbike' : '';
      if (plate.length > VEHICLE_PLATE_MAX_LENGTH) return `Use at most ${VEHICLE_PLATE_MAX_LENGTH} characters`;
      if (!VEHICLE_PLATE_PATTERN.test(plate)) return 'Use only letters, digits, "-" and "."';
      return '';
    },
  };
};
