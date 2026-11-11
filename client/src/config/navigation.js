// Danh sách liên kết của thanh menu chính và sidebar admin, dùng chung cho layout và routes.

export const MAIN_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/rooms', label: 'Rooms' },
  { to: '/services', label: 'Services' },
  { to: '/food', label: 'Food' },
  { to: '/tours', label: 'Tours' },
];

// Các trang admin ngoài Dashboard tạm là "Coming soon"; sẽ làm ở các bước sau.
export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/rooms', label: 'Rooms' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/food-orders', label: 'Food Orders' },
  { to: '/admin/tourism', label: 'Tourism' },
  { to: '/admin/tickets', label: 'Tickets' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/users', label: 'Users' },
];
