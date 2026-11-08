// Các hàm nhỏ dùng chung khi viết SQL trong models.

export const placeholders = (values) => values.map(() => '?').join(', ');

// Tạo phần SET cho câu UPDATE. Chỉ nhận cột trong danh sách cho phép, bỏ qua giá trị undefined.
// Tên cột cố định trong code, còn giá trị đi qua tham số.
export const buildSetClause = (data, allowedColumns) => {
  const columns = allowedColumns.filter((column) => data[column] !== undefined);
  return {
    setClause: columns.map((column) => `${column} = ?`).join(', '),
    values: columns.map((column) => data[column]),
  };
};

// Dùng với LIKE ... ESCAPE '!': để %, _ và ! do người dùng nhập được hiểu là ký tự thường.
export const LIKE_ESCAPE = '!';
export const escapeLike = (value) => value.replace(/[!%_]/g, (char) => `${LIKE_ESCAPE}${char}`);
