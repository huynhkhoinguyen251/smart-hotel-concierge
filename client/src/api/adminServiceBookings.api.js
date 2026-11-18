import { makeAdminResource } from './adminResource.js';

// Yêu cầu dịch vụ khách sạn (admin). Lọc bằng status, category, user_id.
const resource = makeAdminResource('/admin/service-bookings', 'serviceBookings');

export const getAdminServiceBookings = resource.list;
export const getAdminServiceBooking = resource.get;
export const updateAdminServiceBookingStatus = (id, status) => resource.updateStatus(id, { status });
