import { useState } from 'react';
import { getAdminBookings } from '../../api/adminBookings.api.js';
import AdminBookingList from '../../components/admin/AdminBookingList.jsx';
import ListPanel, { ListBody } from '../../components/ui/ListPanel.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import UserFilterChip from '../../components/admin/UserFilterChip.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import FilterTabs from '../../components/ui/FilterTabs.jsx';
import Input from '../../components/ui/Input.jsx';
import { ADMIN_BOOKINGS_PAGE_SIZE } from '../../config/adminBookings.js';
import { BOOKING_STATUS_TABS } from '../../config/statuses.js';
import useFetch from '../../hooks/useFetch.js';
import useUrlFilters from '../../hooks/useUrlFilters.js';
import { isDateString } from '../../utils/dateHelpers.js';
import { cleanParams, readId, toQueryString } from '../../utils/queryString.js';

// Ngày lạ trên địa chỉ trang thì bỏ qua.
const readDate = (searchParams, key) => {
  const value = searchParams.get(key) ?? '';
  return isDateString(value) ? value : '';
};

// Bộ lọc ngày nhận phòng. Giữ giá trị đang gõ trong state; bấm Apply mới đưa lên địa chỉ trang.
// Trang cha gắn key theo giá trị trên địa chỉ trang, nên Back/Forward cũng cập nhật ô nhập.
function DateFilter({ from, to, onApply, onReset }) {
  const [values, setValues] = useState({ from, to });
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (values.from && values.to && values.from > values.to) {
      setError('"Check-in from" cannot be after "Check-in to"');
      return;
    }
    setError('');
    onApply(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Filter by check-in date"
      className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end"
    >
      <Input
        label="Check-in from"
        type="date"
        name="check_in_from"
        value={values.from}
        max={values.to || undefined}
        onChange={(event) => setValues((current) => ({ ...current, from: event.target.value }))}
        className="sm:w-44"
      />
      <Input
        label="Check-in to"
        type="date"
        name="check_in_to"
        value={values.to}
        min={values.from || undefined}
        onChange={(event) => setValues((current) => ({ ...current, to: event.target.value }))}
        className="sm:w-44"
      />
      <div className="flex gap-2">
        <Button type="submit" variant="secondary">
          Apply
        </Button>
        <Button variant="secondary" onClick={onReset}>
          Reset
        </Button>
      </div>
      {error && (
        <p className="w-full text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

// /admin/bookings: mọi đơn đặt phòng. Trạng thái, ngày nhận phòng, khách (user_id) và trang đều nằm
// trên địa chỉ trang.
export default function AdminBookingsPage() {
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const { values, page, setSearchParams, updateUrl, goToPage } = useUrlFilters({
    status: BOOKING_STATUS_TABS,
    check_in_from: (params) => readDate(params, 'check_in_from'),
    check_in_to: (params) => readDate(params, 'check_in_to'),
    user_id: (params) => readId(params, 'user_id'),
  });
  const { status, check_in_from: from, check_in_to: to, user_id: userId } = values;
  const [message, setMessage] = useState({ type: 'success', text: '' });

  const list = useFetch(
    () =>
      getAdminBookings({
        status,
        check_in_from: from,
        check_in_to: to,
        user_id: userId,
        page,
        limit: ADMIN_BOOKINGS_PAGE_SIZE,
      }),
    [status, from, to, page, userId],
  );

  const actionProps = {
    onSuccess: (_updated, text) => {
      setMessage({ type: 'success', text });
      list.retry();
    },
    onError: (text) => setMessage({ type: 'error', text }),
  };

  const filtered = status || from || to || userId;

  return (
    <>
      <AdminPageHeader title="Bookings" subtitle="All room bookings, newest first." />
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      <ListPanel
        tabs={
          <FilterTabs
            label="Filter by status"
            tabs={BOOKING_STATUS_TABS}
            active={status}
            getLink={(value) =>
              `/admin/bookings${toQueryString({ status: value, check_in_from: from, check_in_to: to, user_id: userId })}`
            }
          />
        }
        toolbar={
          <>
            <DateFilter
              key={`${from}|${to}`}
              from={from}
              to={to}
              onApply={(dates) => updateUrl({ check_in_from: dates.from, check_in_to: dates.to, page: '' })}
              onReset={() => setSearchParams(cleanParams({ status, user_id: userId }))}
            />
            <UserFilterChip
              userId={userId}
              clearTo={`/admin/bookings${toQueryString({ status, check_in_from: from, check_in_to: to })}`}
            />
          </>
        }
      >
        <ListBody
          list={list}
          items={list.data?.bookings ?? []}
          empty={{
            title: filtered ? 'No bookings match these filters' : 'No bookings yet',
            message: filtered ? 'Try another status or date range.' : 'Bookings appear here when guests book a room.',
          }}
          pagination={{
            page,
            limit: ADMIN_BOOKINGS_PAGE_SIZE,
            total: list.data?.pagination?.total ?? 0,
            onPageChange: goToPage,
          }}
        >
          <AdminBookingList bookings={list.data?.bookings ?? []} actionProps={actionProps} />
        </ListBody>
      </ListPanel>
    </>
  );
}
