import { useState } from 'react';
import { RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getAdminUser, updateAdminUserRole, updateAdminUserStatus } from '../../api/adminUsers.api.js';
import AdminDetailLayout from '../../components/admin/AdminDetailLayout.jsx';
import YouBadge from '../../components/admin/YouBadge.jsx';
import { DetailFact, DetailFacts, DetailSection } from '../../components/detail/DetailParts.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
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

  const badges = (
    <>
      <StatusBadge status={getRoleBadge(user.role)} />
      <StatusBadge status={user.is_active ? 'active' : 'locked'} />
      {isSelf && <YouBadge />}
    </>
  );

  return (
    <>
      <AdminDetailLayout
        backTo="/admin/users"
        backLabel="Back to users"
        title={user.full_name}
        badges={badges}
        meta={user.email}
        message={message}
        actionsTitle="Account"
        actions={
          isSelf ? (
            <p className="text-sm text-ink-soft">{OWN_ACCOUNT_NOTE}</p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.key}
                    // Thao tác nguy hiểm là nút viền chữ đỏ; nút đỏ đặc chỉ có trong hộp thoại xác nhận.
                    {...(action.variant === 'danger'
                      ? { variant: 'secondary', danger: true }
                      : { variant: action.variant })}
                    fullWidth
                    disabled={saving}
                    aria-label={actionLabel(action, user)}
                    onClick={() => setPending(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                Locked accounts cannot log in, and anyone using them is signed out at once.
              </p>
            </>
          )
        }
        main={
          <DetailSection title="Profile">
            <DetailFacts>
              <DetailFact label="Name">{user.full_name}</DetailFact>
              <DetailFact label="Email">
                <a href={`mailto:${user.email}`} className="text-sea hover:text-sea-hover hover:underline">
                  {user.email}
                </a>
              </DetailFact>
              <DetailFact label="Phone">{user.phone || '-'}</DetailFact>
              <DetailFact label="Role">
                <StatusBadge status={getRoleBadge(user.role)} />
              </DetailFact>
              <DetailFact label="Status">
                <StatusBadge status={user.is_active ? 'active' : 'locked'} />
              </DetailFact>
              <DetailFact label="Joined">{formatDate(user.created_at, { withTime: true })}</DetailFact>
              <DetailFact label="Last updated">{formatDate(user.updated_at, { withTime: true })}</DetailFact>
            </DetailFacts>
          </DetailSection>
        }
        side={
          user.role === 'user' && (
            <DetailSection title="Activity" subtitle="Open the admin lists filtered to this guest.">
              <ul className="divide-y divide-line-soft border-y border-line-soft">
                {USER_ACTIVITY_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={`${link.path}?user_id=${user.id}`}
                      aria-label={`${link.label} of ${user.full_name}`}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm font-medium text-sea hover:text-sea-hover hover:underline"
                    >
                      {link.label}
                      <RightOutlined aria-hidden="true" className="text-xs" />
                    </Link>
                  </li>
                ))}
              </ul>
            </DetailSection>
          )
        }
      />
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
    </>
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
