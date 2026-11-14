// Đọc và ghi bộ lọc của trang /rooms trên địa chỉ trang (query string).
// Địa chỉ trang là nguồn dữ liệu duy nhất: tải lại trang hoặc bấm Back vẫn giữ bộ lọc.

export const EMPTY_ROOM_FILTERS = {
  check_in: '',
  check_out: '',
  guests: '',
  room_type_id: '',
  min_price: '',
  max_price: '',
  amenity_ids: [],
  sort: '',
};

export const SORT_OPTIONS = [
  { value: '', label: 'Default order' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating_desc', label: 'Top rated' },
];

// URLSearchParams thành object bộ lọc; amenity_ids là mảng chuỗi id.
export const readRoomFilters = (searchParams) => {
  const filters = { ...EMPTY_ROOM_FILTERS };
  Object.keys(EMPTY_ROOM_FILTERS).forEach((key) => {
    const value = searchParams.get(key) ?? '';
    filters[key] = key === 'amenity_ids' ? value.split(',').filter(Boolean) : value;
  });
  return filters;
};

// Có ít nhất một bộ lọc đang bật (không tính thứ tự sắp xếp).
export const hasActiveFilters = (filters) =>
  Object.entries(filters).some(([key, value]) =>
    key === 'sort' ? false : Array.isArray(value) ? value.length > 0 : value !== '',
  );

// Kiểm tra giá ở trình duyệt. Trả object lỗi theo tên ô.
export const getPriceErrors = ({ min_price, max_price }) => {
  const errors = {};
  const isValidPrice = (value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0);

  if (!isValidPrice(min_price)) errors.min_price = 'Enter a number of 0 or more';
  if (!isValidPrice(max_price)) errors.max_price = 'Enter a number of 0 or more';
  if (
    !errors.min_price &&
    !errors.max_price &&
    min_price !== '' &&
    max_price !== '' &&
    Number(min_price) > Number(max_price)
  ) {
    errors.max_price = 'Max price must be at least the min price';
  }
  return errors;
};
