import { useContext } from 'react';
import AuthContext from '../context/authContext.js';

// Đọc trạng thái đăng nhập: { user, token, isAdmin, loading, login, register, logout, updateUser }.
export default function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
