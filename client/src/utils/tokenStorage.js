// Lưu JWT trong localStorage để giữ đăng nhập khi tải lại trang.

const TOKEN_KEY = 'shc_token';

// Sự kiện báo phiên đăng nhập hết hạn (API trả 401), để AuthContext đăng xuất.
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
