import { useState } from 'react';
import { ADMIN_LIST_PAGE_SIZE } from '../../config/adminRequests.js';
import useFetch from '../../hooks/useFetch.js';
import useUrlFilters from '../../hooks/useUrlFilters.js';
import { readId, toQueryString } from '../../utils/queryString.js';
import Alert from '../ui/Alert.jsx';
import FilterTabs from '../ui/FilterTabs.jsx';
import Select from '../ui/Select.jsx';
import AdminListPanel, { AdminListBody } from './AdminListPanel.jsx';
import AdminPageHeader from './AdminPageHeader.jsx';
import AdminRequestTable from './AdminRequestTable.jsx';
import UserFilterChip from './UserFilterChip.jsx';

// Khung trang danh sách của admin: tiêu đề, (thanh chuyển mục), tab trạng thái, ô lọc, thông báo,
// danh sách và phân trang. Trạng thái, các ô lọc và trang đều nằm trên địa chỉ trang.
// - basePath: ví dụ "/admin/food-orders"; statusTabs: [{ value, label }].
// - filters: [{ name, label, options: [{ value, label }] }], value '' nghĩa là tất cả.
// - load(params) trả { items, pagination }.
// - ?user_id= trên địa chỉ trang (từ trang chi tiết người dùng) lọc theo một khách; giá trị lạ bị bỏ qua.
// - table: props của AdminRequestTable trừ items; renderActions(item, actionProps) (không bắt buộc).
// - subNav: thanh chuyển mục (ví dụ Requests / Catalog).
export default function AdminRequestListPage({
  title,
  subtitle,
  subNav,
  basePath,
  statusTabs,
  filters = [],
  load,
  table,
  emptyNoun,
}) {
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const { values, page, updateUrl, goToPage } = useUrlFilters({
    status: statusTabs,
    ...Object.fromEntries(filters.map((filter) => [filter.name, filter.options])),
    user_id: (params) => readId(params, 'user_id'),
  });
  const { status, user_id: userId, ...filterValues } = values;
  const [message, setMessage] = useState({ type: 'success', text: '' });

  const filterKey = filters.map((filter) => filterValues[filter.name]);
  const list = useFetch(
    () => load({ status, ...filterValues, user_id: userId, page, limit: ADMIN_LIST_PAGE_SIZE }),
    [basePath, status, ...filterKey, page, userId],
  );

  const actionProps = {
    onSuccess: (_updated, text) => {
      setMessage({ type: 'success', text });
      list.retry();
    },
    onError: (text) => setMessage({ type: 'error', text }),
    compact: true,
  };

  const filtered = status || userId || Object.values(filterValues).some(Boolean);
  const hasToolbar = filters.length > 0 || userId;

  return (
    <>
      <AdminPageHeader title={title} subtitle={subtitle} subNav={subNav} />
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      <AdminListPanel
        tabs={
          <FilterTabs
            label="Filter by status"
            tabs={statusTabs}
            active={status}
            getLink={(value) => `${basePath}${toQueryString({ ...filterValues, user_id: userId, status: value })}`}
          />
        }
        toolbar={
          hasToolbar && (
            <>
              {filters.map((filter) => (
                <Select
                  key={filter.name}
                  label={filter.label}
                  className="sm:w-56"
                  value={filterValues[filter.name]}
                  onChange={(event) => updateUrl({ [filter.name]: event.target.value, page: '' })}
                  options={filter.options}
                />
              ))}
              <UserFilterChip userId={userId} clearTo={`${basePath}${toQueryString({ status, ...filterValues })}`} />
            </>
          )
        }
      >
        <AdminListBody
          list={list}
          items={list.data?.items ?? []}
          empty={{
            title: filtered ? `No ${emptyNoun} match these filters` : `No ${emptyNoun} yet`,
            message: filtered
              ? 'Try another status or filter.'
              : `${emptyNoun.charAt(0).toUpperCase()}${emptyNoun.slice(1)} from guests appear here.`,
          }}
          pagination={{
            page,
            limit: ADMIN_LIST_PAGE_SIZE,
            total: list.data?.pagination?.total ?? 0,
            onPageChange: goToPage,
          }}
        >
          <AdminRequestTable
            {...table}
            items={list.data?.items ?? []}
            renderActions={table.renderActions && ((item) => table.renderActions(item, actionProps))}
          />
        </AdminListBody>
      </AdminListPanel>
    </>
  );
}
