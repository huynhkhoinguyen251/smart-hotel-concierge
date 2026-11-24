// Danh sách liên kết của thanh menu chính và sidebar admin, dùng chung cho layout và routes.

export const MAIN_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/rooms', label: 'Rooms' },
  { to: '/services', label: 'Services' },
  { to: '/food', label: 'Food' },
  { to: '/tours', label: 'Tours' },
];

// Mục của khách trong menu tài khoản (máy tính và điện thoại). Admin không thấy các mục này.
export const GUEST_ACCOUNT_NAV = [
  { to: '/my-bookings', label: 'My bookings' },
  { to: '/my-services', label: 'My service requests' },
  { to: '/my-food-orders', label: 'My food orders' },
  { to: '/my-trips', label: 'My trips' },
  { to: '/my-payments', label: 'My payments' },
  { to: '/my-reviews', label: 'My reviews' },
  { to: '/support', label: 'Support' },
];

// Các mục của cột trái khu admin, chia nhóm; mỗi mục có một trang riêng (routes/AppRoutes.jsx).
export const ADMIN_NAV_GROUPS = [
  { label: '', items: [{ to: '/admin', label: 'Dashboard', end: true }] },
  {
    label: 'Front desk',
    items: [
      { to: '/admin/bookings', label: 'Bookings' },
      { to: '/admin/services', label: 'Services' },
      { to: '/admin/food-orders', label: 'Food Orders' },
      { to: '/admin/tourism', label: 'Tourism' },
      { to: '/admin/tickets', label: 'Tickets' },
    ],
  },
  {
    label: 'Hotel',
    items: [
      { to: '/admin/rooms', label: 'Rooms' },
      { to: '/admin/reviews', label: 'Reviews' },
      { to: '/admin/users', label: 'Users' },
    ],
  },
  {
    label: 'Money',
    items: [
      { to: '/admin/payments', label: 'Payments' },
      { to: '/admin/vouchers', label: 'Vouchers' },
    ],
  },
];

// Trang đang mở thuộc nhóm và mục nào, để hiện trên thanh trên cùng.
export const getAdminPageContext = (pathname) => {
  if (pathname.startsWith('/admin/notifications')) return { group: '', label: 'Notifications' };
  for (const group of ADMIN_NAV_GROUPS) {
    const item = group.items.find((entry) =>
      entry.end ? pathname === entry.to : pathname === entry.to || pathname.startsWith(`${entry.to}/`),
    );
    if (item) return { group: group.label, label: item.label };
  }
  return { group: '', label: 'Admin' };
};
