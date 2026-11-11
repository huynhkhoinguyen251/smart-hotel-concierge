import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/layout/AuthCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import useAuth from '../hooks/useAuth.js';

const EMPTY_FORM = { full_name: '', email: '', phone: '', password: '', confirm_password: '' };

// Trình duyệt chỉ kiểm tra trường bắt buộc và hai mật khẩu khớp nhau.
// Quy tắc thật (độ dài, định dạng email, email đã dùng) do backend kiểm tra và trả thông báo.
const validate = (form) => {
  const errors = {};
  if (!form.full_name.trim()) errors.full_name = 'Full name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  if (!form.password) errors.password = 'Password is required';
  if (!form.confirm_password) {
    errors.confirm_password = 'Please confirm your password';
  } else if (form.password !== form.confirm_password) {
    errors.confirm_password = 'Passwords do not match';
  }
  return errors;
};

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user && !submitting) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setServerError('');
    setSubmitting(true);
    try {
      // Đăng ký thành công thì backend trả token, nên người dùng được đăng nhập luôn.
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      const from = location.state?.from;
      navigate(from?.pathname ? `${from.pathname}${from.search ?? ''}` : '/', { replace: true });
    } catch (error) {
      setServerError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle="Register to book rooms, services and tours."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert type="error">{serverError}</Alert>
        <Input
          label="Full name"
          name="full_name"
          autoComplete="name"
          value={form.full_name}
          onChange={handleChange}
          error={errors.full_name}
        />
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
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="8 to 72 characters."
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          value={form.confirm_password}
          onChange={handleChange}
          error={errors.confirm_password}
        />
        <Button type="submit" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
