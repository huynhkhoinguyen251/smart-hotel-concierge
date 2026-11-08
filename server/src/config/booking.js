// Hằng số nghiệp vụ của đặt phòng, theo Mục 5 của proposal.md.

// Giờ nhận phòng (giờ địa phương của server).
export const CHECK_IN_HOUR = 14;

// Số đêm tối đa của một đơn, và số ngày tối đa được đặt trước.
export const MAX_NIGHTS = 30;
export const MAX_ADVANCE_DAYS = 365;

// User chỉ tự hủy được khi còn ít nhất chừng này giờ trước giờ nhận phòng.
export const CANCEL_DEADLINE_HOURS = 24;

export const BOOKING_STATUSES = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

// Đơn ở các trạng thái này giữ phòng; đơn cancelled hoặc checked_out thì không.
export const BLOCKING_BOOKING_STATUSES = ['pending', 'confirmed', 'checked_in'];

// Đơn ở các trạng thái này mới được hủy.
export const CANCELLABLE_BOOKING_STATUSES = ['pending', 'confirmed'];

// Khi hủy đơn, các yêu cầu dịch vụ ở trạng thái này cũng bị hủy theo.
export const CANCELLABLE_SERVICE_STATUSES = ['pending', 'confirmed'];
