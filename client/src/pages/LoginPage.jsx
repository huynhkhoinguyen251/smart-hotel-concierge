import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/layout/AuthCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import useAuth from '../hooks/useAuth.js';

// Sau khi đăng nhập: về trang đã nhớ (ProtectedRoute lưu lại), nếu không thì admin vào /admin,
// người dùng thường về trang chủ.
const getRedirectPath = (user, from) => {
  if (from?.pathname && from.pathname !== '/login') {
    return `${from.pathname}${from.search ?? ''}`;
  }
  return user.role === 'admin' ? '/admin' : '/';
};

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Đã đăng nhập mà mở /login: chuyển đi luôn.
  if (user && !submitting) {
    return <Navigate to={getRedirectPath(user, from)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setServerError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login({ email: form.email.trim(), password: form.password });
      navigate(getRedirectPath(loggedInUser, from), { replace: true });
    } catch (error) {
      // Thông báo của backend, ví dụ "Invalid email or password" hoặc "Account is locked".
      setServerError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back. Log in to manage your bookings and requests."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" state={{ from }} className="font-semibold text-teal-700 hover:text-teal-800">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert type="error">{serverError}</Alert>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Button type="submit" fullWidth loading={submitting}>
          Log in
        </Button>
      </form>
    </AuthCard>
  );
}
