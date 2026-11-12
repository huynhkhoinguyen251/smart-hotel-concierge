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

// { check_in: '2026-12-06', guests: 2 } thành "?check_in=2026-12-06&guests=2"; không có gì thì "".
// Giữ dấu phẩy dễ đọc trong amenity_ids=1,2,3.
export const toQueryString = (params) => {
  const query = new URLSearchParams(cleanParams(params)).toString().replace(/%2C/gi, ',');
  return query ? `?${query}` : '';
};
