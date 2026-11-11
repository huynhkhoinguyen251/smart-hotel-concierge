import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.api.js';
import * as usersApi from '../api/users.api.js';
import { clearToken, getToken, saveToken, SESSION_EXPIRED_EVENT } from '../utils/tokenStorage.js';
import AuthContext from './authContext.js';

// Giữ trạng thái đăng nhập cho cả app: user, token, isAdmin, loading và các hàm đăng nhập.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(null);
  // Có token lúc mở trang thì phải tải hồ sơ trước khi biết đã đăng nhập hay chưa.
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => {
    // Đăng xuất chỉ xóa token ở trình duyệt, không cần gọi API.
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  // Mở trang khi đã có token: tải hồ sơ. Token sai hoặc hết hạn thì xóa đi.
  useEffect(() => {
    if (!getToken()) {
      return undefined;
    }

    let cancelled = false;
    usersApi
      .getMe()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout]);

  // API trả 401 ở bất kỳ đâu (client.js phát sự kiện này): đăng xuất.
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  const startSession = useCallback(({ token: newToken, user: newUser }) => {
    saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(
    async (credentials) => startSession(await authApi.login(credentials)),
    [startSession],
  );

  const register = useCallback(
    async (data) => startSession(await authApi.register(data)),
    [startSession],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAdmin: user?.role === 'admin',
      loading,
      login,
      register,
      logout,
      updateUser: setUser,
    }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
