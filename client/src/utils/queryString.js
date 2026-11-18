// Bỏ các giá trị rỗng (undefined, null, '', mảng rỗng); mảng được nối bằng dấu phẩy.
// Dùng cho cả params của axios lẫn đường dẫn trên trình duyệt.
export const cleanParams = (params = {}) => {
  const result = {};
  Object.entries(params).forEach(([key, value]) => {
    const finalValue = Array.isArray(value) ? value.join(',') : value;
    if (finalValue !== undefined && finalValue !== null && finalValue !== '') {
      result[key] = String(finalValue);
    }
  });
  return result;
};

// Trang hiện tại trong ?page=...; giá trị lạ thì về trang 1.
export const readPage = (searchParams) => {
  const page = Number(searchParams.get('page'));
  return Number.isInteger(page) && page >= 1 ? page : 1;
};

// { check_in: '2026-12-06', guests: 2 } thành "?check_in=2026-12-06&guests=2"; không có gì thì "".
// Giữ dấu phẩy dễ đọc trong amenity_ids=1,2,3.
export const toQueryString = (params) => {
  const query = new URLSearchParams(cleanParams(params)).toString().replace(/%2C/gi, ',');
  return query ? `?${query}` : '';
};

// Id dương trên địa chỉ trang (ví dụ ?user_id=4); giá trị lạ thì trả '' (bỏ qua).
export const readId = (searchParams, key) => {
  const value = searchParams.get(key) ?? '';
  return /^[1-9]\d{0,9}$/.test(value) && Number(value) <= 2147483647 ? value : '';
};
