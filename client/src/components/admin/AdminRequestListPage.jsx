import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ADMIN_LIST_PAGE_SIZE } from '../../config/adminRequests.js';
import useFetch from '../../hooks/useFetch.js';
import { cleanParams, readId, readPage, toQueryString } from '../../utils/queryString.js';
import Alert from '../ui/Alert.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import FilterTabs from '../ui/FilterTabs.jsx';
import PageTitle from '../ui/PageTitle.jsx';
import Pagination from '../ui/Pagination.jsx';
import Select from '../ui/Select.jsx';
import { PageSpinner } from '../ui/Spinner.jsx';
import AdminRequestTable from './AdminRequestTable.jsx';
import UserFilterChip from './UserFilterChip.jsx';

// Khung trang danh sách của admin: tiêu đề, (tab phụ), tab trạng thái, ô lọc, thông báo, danh sách
// và phân trang. Trạng thái, các ô lọc và trang đều nằm trên địa chỉ trang.
// - basePath: ví dụ "/admin/food-orders"; statusTabs: [{ value, label }].
// - filters: [{ name, label, options: [{ value, label }] }], value '' nghĩa là tất cả.
// - load(params) trả { items, pagination }.
// - ?user_id= trên địa chỉ trang (từ trang chi tiết người dùng) lọc theo một khách; giá trị lạ bị bỏ qua.
// - table: props của AdminRequestTable trừ items; renderActions(item, actionProps).
// - header: phần thêm dưới tiêu đề (ví dụ tab "Tour bookings / Transport"). Bước sau có thể đặt
//   thanh điều hướng phụ (quản lý danh mục) ở đây.
export default function AdminRequestListPage({
  title,
  subtitle,
  header,
  basePath,
  statusTabs,
  filters = [],
  load,
  table,
  emptyNoun,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get('status') ?? '';
  const activeTab = statusTabs.find((tab) => tab.value === rawStatus) ?? statusTabs[0];
  const status = activeTab.value;
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const filterValues = Object.fromEntries(
    filters.map((filter) => {
      const raw = searchParams.get(filter.name) ?? '';
      return [filter.name, filter.options.some((option) => option.value === raw) ? raw : ''];
    }),
  );
  const page = readPage(searchParams);
  const userId = readId(searchParams, 'user_id');
  const [message, setMessage] = useState({ type: 'success', text: '' });

  const filterKey = filters.map((filter) => filterValues[filter.name]);
  const list = useFetch(
    () => load({ status, ...filterValues, user_id: userId, page, limit: ADMIN_LIST_PAGE_SIZE }),
    [basePath, status, ...filterKey, page, userId],
  );

  const updateUrl = (changes) =>
    setSearchParams(cleanParams({ status, ...filterValues, user_id: userId, ...changes }));
  const goToPage = (nextPage) => {
    updateUrl({ page: nextPage > 1 ? nextPage : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const actionProps = {
    onSuccess: (_updated, text) => {
      setMessage({ type: 'success', text });
      list.retry();
    },
    onError: (text) => setMessage({ type: 'error', text }),
    compact: true,
  };

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) {
      return list.error.status === 400 ? (
        <Alert type="error">{list.error.message}</Alert>
      ) : (
        <ErrorState message={list.error.message} onRetry={list.retry} />
      );
    }
    if (list.data.items.length === 0) {
      const filtered = status || userId || Object.values(filterValues).some(Boolean);
      return (
        <EmptyState
          title={filtered ? `No ${emptyNoun} match these filters` : `No ${emptyNoun} yet`}
          message={filtered ? 'Try another status or filter.' : `${emptyNoun.charAt(0).toUpperCase()}${emptyNoun.slice(1)} from guests appear here.`}
        />
      );
    }
    return (
      <>
        <AdminRequestTable
          {...table}
          items={list.data.items}
          renderActions={(item) => table.renderActions(item, actionProps)}
        />
        <Pagination
          className="mt-8"
          page={page}
          limit={ADMIN_LIST_PAGE_SIZE}
          total={list.data.pagination?.total ?? 0}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title={title} subtitle={subtitle} />
      {header}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <FilterTabs
          label="Filter by status"
          className="min-w-0 lg:mx-0 lg:px-0"
          tabs={statusTabs}
          active={status}
          getLink={(value) => `${basePath}${toQueryString({ ...filterValues, user_id: userId, status: value })}`}
        />
        {filters.map((filter) => (
          <Select
            key={filter.name}
            label={filter.label}
            className="sm:w-64"
            value={filterValues[filter.name]}
            onChange={(event) => updateUrl({ [filter.name]: event.target.value, page: '' })}
            options={filter.options}
          />
        ))}
      </div>
      <UserFilterChip userId={userId} clearTo={`${basePath}${toQueryString({ status, ...filterValues })}`} />
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      {renderList()}
    </div>
  );
}
