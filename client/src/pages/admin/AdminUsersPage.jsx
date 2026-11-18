import { getAdminUsers } from '../../api/adminUsers.api.js';
import AdminRequestTable from '../../components/admin/AdminRequestTable.jsx';
import SearchBox from '../../components/admin/SearchBox.jsx';
import YouBadge from '../../components/admin/YouBadge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadError from '../../components/ui/LoadError.jsx';
import FilterTabs from '../../components/ui/FilterTabs.jsx';
import PageTitle from '../../components/ui/PageTitle.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Select from '../../components/ui/Select.jsx';
import { PageSpinner } from '../../components/ui/Spinner.jsx';
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
    render: (user) => (
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
          <span className="min-w-0 break-words">{user.full_name}</span>
          {user.id === currentUserId && <YouBadge />}
        </p>
        <p className="text-xs break-all text-slate-500">{user.email}</p>
      </div>
    ),
  },
  { key: 'phone', header: 'Phone', render: (user) => user.phone || <span className="text-slate-400">-</span> },
  {
    key: 'role',
    header: 'Role',
    render: (user) => <StatusBadge status={getRoleBadge(user.role)} />,
  },
  { key: 'status', header: 'Status', render: (user) => <StatusBadge status={user.is_active ? 'active' : 'locked'} /> },
  { key: 'joined', header: 'Joined', render: (user) => <span className="whitespace-nowrap">{formatDate(user.created_at)}</span> },
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

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) {
      return <LoadError error={list.error} onRetry={list.retry} />;
    }
    if (list.data.items.length === 0) {
      const filtered = search || role || isActive;
      return (
        <EmptyState
          title={filtered ? 'No users match these filters' : 'No users yet'}
          message={filtered ? 'Try another name, email, phone number or filter.' : 'Accounts appear here when guests register.'}
        />
      );
    }
    return (
      <>
        <AdminRequestTable
          caption="Users"
          items={list.data.items}
          columns={makeColumns(currentUser?.id)}
          getViewPath={(user) => `/admin/users/${user.id}`}
          getItemLabel={(user) => user.full_name}
          renderActions={() => null}
        />
        <Pagination
          className="mt-8"
          page={page}
          limit={ADMIN_USERS_PAGE_SIZE}
          total={list.data.pagination?.total ?? 0}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Users" subtitle="Guest and admin accounts, newest first." />
      <FilterTabs
        label="Filter by role"
        className="mb-4"
        tabs={USER_ROLE_TABS}
        active={role}
        getLink={(value) => `/admin/users${toQueryString({ ...filters, role: value })}`}
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
      </div>
      {renderList()}
    </div>
  );
}
