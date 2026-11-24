import { getAdminUsers } from '../../api/adminUsers.api.js';
import { CellLink, EmptyCell } from '../../components/admin/AdminCells.jsx';
import AdminListPanel, { AdminListBody } from '../../components/admin/AdminListPanel.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminRequestTable from '../../components/admin/AdminRequestTable.jsx';
import SearchBox from '../../components/admin/SearchBox.jsx';
import YouBadge from '../../components/admin/YouBadge.jsx';
import Button from '../../components/ui/Button.jsx';
import FilterTabs from '../../components/ui/FilterTabs.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import {
  ADMIN_USERS_PAGE_SIZE,
  getRoleBadge,
  USER_ROLE_TABS,
  USER_SEARCH_MAX_LENGTH,
  USER_STATUS_OPTIONS,
} from '../../config/adminUsers.js';
import useAuth from '../../hooks/useAuth.js';
import useFetch from '../../hooks/useFetch.js';
import useUrlFilters from '../../hooks/useUrlFilters.js';
import formatDate from '../../utils/formatDate.js';
import { cleanParams, toQueryString } from '../../utils/queryString.js';

const makeColumns = (currentUserId) => [
  {
    key: 'user',
    header: 'User',
    render: (user, link) => (
      <>
        <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
          <CellLink to={link.to} label={link.label}>
            {user.full_name}
          </CellLink>
          {user.id === currentUserId && <YouBadge />}
        </p>
        <p className="text-xs wrap-anywhere text-ink-soft">{user.email}</p>
      </>
    ),
  },
  { key: 'phone', header: 'Phone', render: (user) => user.phone || <EmptyCell /> },
  {
    key: 'joined',
    header: 'Joined',
    render: (user) => <span className="whitespace-nowrap">{formatDate(user.created_at)}</span>,
  },
  {
    key: 'status',
    header: 'Role and status',
    badges: true,
    render: (user) => (
      <span className="inline-flex gap-1.5">
        <StatusBadge status={getRoleBadge(user.role)} />
        <StatusBadge status={user.is_active ? 'active' : 'locked'} />
      </span>
    ),
  },
];

// /admin/users: mọi tài khoản, người mới nhất trước. Từ khóa, vai trò, trạng thái và trang nằm
// trên địa chỉ trang.
export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const { values: filters, page, setSearchParams, updateUrl, goToPage } = useUrlFilters({
    search: (params) => (params.get('search') ?? '').trim().slice(0, USER_SEARCH_MAX_LENGTH),
    role: USER_ROLE_TABS,
    is_active: USER_STATUS_OPTIONS,
  });
  const { search, role, is_active: isActive } = filters;

  const list = useFetch(
    () => getAdminUsers({ search, role, is_active: isActive, page, limit: ADMIN_USERS_PAGE_SIZE }),
    ['admin-users', search, role, isActive, page],
  );

  const filtered = search || role || isActive;

  return (
    <>
      <AdminPageHeader title="Users" subtitle="Guest and admin accounts, newest first." />
      <AdminListPanel
        tabs={
          <FilterTabs
            label="Filter by role"
            tabs={USER_ROLE_TABS}
            active={role}
            getLink={(value) => `/admin/users${toQueryString({ ...filters, role: value })}`}
          />
        }
        toolbar={
          <>
            <SearchBox
              key={search}
              label="Name, email or phone"
              value={search}
              maxLength={USER_SEARCH_MAX_LENGTH}
              placeholder="For example: Tran Thi An"
              className="w-full sm:w-72"
              onSearch={(value) => updateUrl({ search: value, page: '' })}
            />
            <Select
              label="Status"
              className="sm:w-44"
              value={isActive}
              onChange={(event) => updateUrl({ is_active: event.target.value, page: '' })}
              options={USER_STATUS_OPTIONS}
            />
            {(search || isActive) && (
              <Button variant="secondary" onClick={() => setSearchParams(cleanParams({ role }))}>
                Reset
              </Button>
            )}
          </>
        }
      >
        <AdminListBody
          list={list}
          items={list.data?.items ?? []}
          empty={{
            title: filtered ? 'No users match these filters' : 'No users yet',
            message: filtered
              ? 'Try another name, email, phone number or filter.'
              : 'Accounts appear here when guests register.',
          }}
          pagination={{
            page,
            limit: ADMIN_USERS_PAGE_SIZE,
            total: list.data?.pagination?.total ?? 0,
            onPageChange: goToPage,
          }}
        >
          <AdminRequestTable
            caption="Users"
            items={list.data?.items ?? []}
            columns={makeColumns(currentUser?.id)}
            getViewPath={(user) => `/admin/users/${user.id}`}
            getItemLabel={(user) => user.full_name}
          />
        </AdminListBody>
      </AdminListPanel>
    </>
  );
}
