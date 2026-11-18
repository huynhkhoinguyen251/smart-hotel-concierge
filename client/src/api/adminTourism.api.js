import { makeAdminResource } from './adminResource.js';

// Đơn tour và đơn vận chuyển (admin).
const tours = makeAdminResource('/admin/tour-bookings', 'tourBookings');
const transport = makeAdminResource('/admin/transport-bookings', 'transportBookings');

export const getAdminTourBookings = tours.list;
export const getAdminTourBooking = tours.get;
export const updateAdminTourBookingStatus = (id, status) => tours.updateStatus(id, { status });

// Lọc bằng status và category (motorbike_rental, airport_pickup, shuttle).
export const getAdminTransportBookings = transport.list;
export const getAdminTransportBooking = transport.get;

// vehicle_plate chỉ gửi khi duyệt (confirmed) và khi có giá trị; backend tự viết hoa.
export const updateAdminTransportBookingStatus = (id, status, vehicle_plate) =>
  transport.updateStatus(id, { status, ...(vehicle_plate ? { vehicle_plate } : {}) });
