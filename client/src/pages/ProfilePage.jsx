import { useState } from 'react';
import * as usersApi from '../api/users.api.js';
import { DetailFact, DetailFacts } from '../components/detail/DetailParts.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import useAuth from '../hooks/useAuth.js';
import formatDate from '../utils/formatDate.js';

// Một phần của trang: tiêu đề bên trái, nội dung bên phải (điện thoại: xếp dọc).
function ProfileSection({ title, children }) {
  return (
    <section className="grid gap-x-10 gap-y-4 p-4 sm:p-6 lg:grid-cols-[14rem_minmax(0,32rem)] lg:p-8">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

const ROLE_LABELS = { user: 'Guest', admin: 'Administrator' };

function ProfileDetails({ user }) {
  const rows = [
    ['Full name', user.full_name],
    ['Email', user.email],
    ['Phone', user.phone || 'Not provided'],
    ['Role', ROLE_LABELS[user.role] ?? user.role],
    ['Member since', formatDate(user.created_at)],
  ];

  return (
    <ProfileSection title="Account details">
      <DetailFacts>
        {rows.map(([label, value]) => (
          <DetailFact key={label} label={label}>
            {value}
          </DetailFact>
        ))}
      </DetailFacts>
    </ProfileSection>
  );
}

// Sửa họ tên và số điện thoại (PUT /users/me). Email không sửa được.
function EditProfileForm({ user, onUpdated }) {
  const [form, setForm] = useState({ full_name: user.full_name, phone: user.phone ?? '' });
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSuccess('');
    if (name === 'full_name') setFieldError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim()) {
      setFieldError('Full name is required');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const updated = await usersApi.updateMe({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      });
      onUpdated(updated);
      setForm({ full_name: updated.full_name, phone: updated.phone ?? '' });
      setSuccess('Your profile has been updated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfileSection title="Edit profile">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert type="success">{success}</Alert>
        <Alert type="error">{error}</Alert>
        <Input
          label="Full name"
          name="full_name"
          autoComplete="name"
          value={form.full_name}
          onChange={handleChange}
          error={fieldError}
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          hint="Leave empty to remove your phone number."
          value={form.phone}
          onChange={handleChange}
        />
        <Input label="Email" value={user.email} disabled hint="Email cannot be changed." />
        <Button type="submit" loading={submitting}>
          Save changes
        </Button>
      </form>
    </ProfileSection>
  );
}

const EMPTY_PASSWORDS = { current_password: '', new_password: '', confirm_password: '' };

// Đổi mật khẩu (PUT /users/me/password). Quy tắc độ dài do backend kiểm tra.
function ChangePasswordForm() {
  const [form, setForm] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.current_password) nextErrors.current_password = 'Current password is required';
    if (!form.new_password) nextErrors.new_password = 'New password is required';
    if (form.new_password !== form.confirm_password) {
      nextErrors.confirm_password = 'Passwords do not match';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await usersApi.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setForm(EMPTY_PASSWORDS);
      setSuccess('Your password has been changed.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfileSection title="Change password">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert type="success">{success}</Alert>
        <Alert type="error">{error}</Alert>
        <Input
          label="Current password"
          name="current_password"
          type="password"
          autoComplete="current-password"
          value={form.current_password}
          onChange={handleChange}
          error={errors.current_password}
        />
        <Input
          label="New password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          hint="8 to 72 characters."
          value={form.new_password}
          onChange={handleChange}
          error={errors.new_password}
        />
        <Input
          label="Confirm new password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          value={form.confirm_password}
          onChange={handleChange}
          error={errors.confirm_password}
        />
        {/* Nút vàng của trang là "Save changes". */}
        <Button type="submit" variant="secondary" loading={submitting}>
          Change password
        </Button>
      </form>
    </ProfileSection>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  return (
    <div className="shell py-8 lg:py-12">
      <PageTitle title="My profile" subtitle="View and update your account information." />
      <div className="divide-y divide-line-soft rounded-panel border border-line-soft bg-white">
        <ProfileDetails user={user} />
        <EditProfileForm user={user} onUpdated={updateUser} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
