import AppError from './AppError.js';

// Đổi lỗi ràng buộc của MySQL thành lỗi có mã trạng thái.
// messages gồm: duplicate (trùng UNIQUE, 409), missingReference (khóa ngoại trỏ tới dòng
// không tồn tại, 400), referenced (dòng đang được bảng khác dùng nên không xóa được, 409).
// Lỗi khác được trả lại nguyên vẹn để errorHandler xử lý như lỗi 500.
export const mapDbError = (error, messages) => {
  if (error.code === 'ER_DUP_ENTRY' && messages.duplicate) {
    return new AppError(409, messages.duplicate);
  }
  if (
    (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') &&
    messages.missingReference
  ) {
    return new AppError(400, messages.missingReference);
  }
  if (
    (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') &&
    messages.referenced
  ) {
    return new AppError(409, messages.referenced);
  }
  return error;
};
