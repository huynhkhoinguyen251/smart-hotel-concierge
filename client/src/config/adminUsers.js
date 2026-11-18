// Quản lý người dùng (admin), mục 9 của docs/api.md. Giống server/src/config/users.js.

// Giá trị role của backend: 'user' (khách) và 'admin'. badge: khóa trong STATUS_CONFIG.
export const USER_ROLES = {
  user: { label: 'Guest', badge: 'guest' },
  admin: { label: 'Admin', badge: 'admin' },
};
export const getRoleBadge = (role) => USER_ROLES[role]?.badge ?? role;

export const USER_ROLE_TABS = [
  { value: '', label: 'All' },
  { value: 'user', label: 'Guests' },
  { value: 'admin', label: 'Admins' },
];
export const USER_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Locked' },
];

// Bằng độ dài cột email (VARCHAR(150)), giống MAX_USER_SEARCH_LENGTH của backend.
export const USER_SEARCH_MAX_LENGTH = 150;
export const ADMIN_USERS_PAGE_SIZE = 10;

export const LOCK_ACCOUNT_NOTE = 'This user will be signed out and cannot log in until the account is unlocked.';
export const UNLOCK_ACCOUNT_NOTE = 'This user will be able to log in again.';
export const MAKE_ADMIN_NOTE = 'This user will get full access to the admin dashboard.';
export const MAKE_GUEST_NOTE = 'This user will lose access to the admin dashboard.';
export const OWN_ACCOUNT_NOTE = 'You cannot change your own status or role.';

// Link đến các danh sách của admin, lọc theo khách (user_id). Chỉ hiện cho tài khoản khách.
export const USER_ACTIVITY_LINKS = [
  { label: 'Bookings', path: '/admin/bookings' },
  { label: 'Service requests', path: '/admin/services' },
  { label: 'Food orders', path: '/admin/food-orders' },
  { label: 'Tour bookings', path: '/admin/tourism' },
  { label: 'Transport', path: '/admin/tourism/transport' },
  { label: 'Support requests', path: '/admin/tickets' },
];
