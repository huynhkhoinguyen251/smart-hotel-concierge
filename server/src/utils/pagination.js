export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

// page và limit đã được validator kiểm tra; ở đây chỉ điền giá trị mặc định và tính offset.
export const getPagination = ({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) => ({
  page,
  limit,
  offset: (page - 1) * limit,
});
