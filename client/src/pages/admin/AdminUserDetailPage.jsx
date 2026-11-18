import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUser, updateAdminUserRole, updateAdminUserStatus } from '../../api/adminUsers.api.js';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import YouBadge from '../../components/admin/YouBadge.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DetailRow from '../../components/ui/DetailRow.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import {
  getRoleBadge,
  LOCK_ACCOUNT_NOTE,
  MAKE_ADMIN_NOTE,
  MAKE_GUEST_NOTE,
  OWN_ACCOUNT_NOTE,
  UNLOCK_ACCOUNT_NOTE,
  USER_ACTIVITY_LINKS,
} from '../../config/adminUsers.js';
import useAuth from '../../hooks/useAuth.js';
import formatDate from '../../utils/formatDate.js';

// Các thao tác trên tài khoản: mỗi thao tác có nút, hộp thoại xác nhận và lệnh gọi API.
const getAccountActions = (user) => [
  user.is_active
    ? {
        key: 'lock',
        label: 'Lock account',
        variant: 'danger',
        title: `Lock the account of ${user.full_name}?`,
        message: LOCK_ACCOUNT_NOTE,
        confirmLabel: 'Yes, lock account',
        success: `The account of ${user.full_name} has been locked.`,
        run: () => updateAdminUserStatus(user.id, false),
      }
    : {
        key: 'unlock',
        label: 'Unlock account',
        variant: 'primary',
        title: `Unlock the account of ${user.full_name}?`,
        message: UNLOCK_ACCOUNT_NOTE,
        confirmLabel: 'Yes, unlock account',
        success: `The account of ${user.full_name} has been unlocked.`,
        run: () => updateAdminUserStatus(user.id, true),
      },
  user.role === 'admin'
    ? {
        key: 'guest',
        label: 'Make guest',
        variant: 'secondary',
        title: `Make ${user.full_name} a guest?`,
        message: MAKE_GUEST_NOTE,
        confirmLabel: 'Yes, make guest',
        success: `${user.full_name} is now a guest.`,
        run: () => updateAdminUserRole(user.id, 'user'),
      }
    : {
        key: 'admin',
        label: 'Make admin',
        variant: 'secondary',
        title: `Make ${user.full_name} an admin?`,
        message: MAKE_ADMIN_NOTE,
        confirmLabel: 'Yes, make admin',
        success: `${user.full_name} is now an admin.`,
        run: () => updateAdminUserRole(user.id, 'admin'),
      },
];

// aria-label của nút, ví dụ "Lock account of Tran Thi An".
const actionLabel = (action, user) =>
  action.key === 'lock' || action.key === 'unlock' ? `${action.label} of ${user.full_name}` : `${action.label}: ${user.full_name}`;

function UserDetails({ initialUser }) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(initialUser);
  const [message, setMessage] = useState({ type: 'success', text: '' });
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const isSelf = currentUser?.id === user.id;
  const actions = getAccountActions(user);

  const confirm = async () => {
    setSaving(true);
    try {
      const updated = await pending.run();
      setUser(updated);
      setMessage({ type: 'success', text: pending.success });
    } catch (error) {
      // 400 của backend, ví dụ tự khóa chính mình.
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/admin/users" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to users
      </Link>
      <div className="mt-3 mb-2 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 text-2xl font-bold tracking-tight wrap-anywhere text-slate-900 sm:text-3xl">{user.full_name}</h1>
        <StatusBadge status={getRoleBadge(user.role)} />
        <StatusBadge status={user.is_active ? 'active' : 'locked'} />
        {isSelf && <YouBadge />}
      </div>
      <p className="mb-6 text-sm break-all text-slate-500">{user.email}</p>

      <div className="mb-6 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Name">{user.full_name}</DetailRow>
              <DetailRow label="Email">
                <a href={`mailto:${user.email}`} className="break-all text-teal-700 hover:text-teal-800">
                  {user.email}
                </a>
              </DetailRow>
              <DetailRow label="Phone">{user.phone || '-'}</DetailRow>
              <DetailRow label="Role">
                <StatusBadge status={getRoleBadge(user.role)} />
              </DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={user.is_active ? 'active' : 'locked'} />
              </DetailRow>
              <DetailRow label="Joined">{formatDate(user.created_at, { withTime: true })}</DetailRow>
              <DetailRow label="Last updated">{formatDate(user.updated_at, { withTime: true })}</DetailRow>
            </dl>
          </Card>

          {user.role === 'user' && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
              <p className="mt-1 text-sm text-slate-500">Open the admin lists filtered to this guest.</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {USER_ACTIVITY_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={`${link.path}?user_id=${user.id}`}
                      aria-label={`${link.label} of ${user.full_name}`}
                      className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-slate-50 hover:text-teal-800"
                    >
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Account</h2>
            {isSelf ? (
              <p className="text-sm text-slate-500">{OWN_ACCOUNT_NOTE}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {actions.map((action) => (
                  <Button
                    key={action.key}
                    variant={action.variant}
                    fullWidth
                    disabled={saving}
                    aria-label={actionLabel(action, user)}
                    onClick={() => setPending(action)}
                  >
                    {action.label}
                  </Button>
                ))}
                <p className="text-xs text-slate-500">
                  Locked accounts cannot log in, and anyone using them is signed out at once.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.title ?? ''}
        message={pending?.message}
        confirmLabel={pending?.confirmLabel}
        cancelLabel="Go back"
        variant={pending?.key === 'lock' ? 'danger' : 'primary'}
        loading={saving}
        onConfirm={confirm}
        onClose={() => setPending(null)}
      />
    </div>
  );
}

// /admin/users/:id: hồ sơ, khóa/mở khóa, đổi vai trò và link đến các đơn của khách.
export default function AdminUserDetailPage() {
  return (
    <DetailLoader
      load={getAdminUser}
      notFound={{
        title: 'User not found',
        message: 'This account does not exist.',
        to: '/admin/users',
        linkLabel: 'Back to users',
      }}
    >
      {(user) => <UserDetails key={user.id} initialUser={user} />}
    </DetailLoader>
  );
}
