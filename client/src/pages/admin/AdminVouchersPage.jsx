import { useState } from 'react';
import { adminVouchersApi } from '../../api/vouchers.api.js';
import { EmptyCell } from '../../components/admin/AdminCells.jsx';
import AdminListPanel, { AdminListBody } from '../../components/admin/AdminListPanel.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminRequestTable from '../../components/admin/AdminRequestTable.jsx';
import RowActions from '../../components/admin/RowActions.jsx';
import SearchBox from '../../components/admin/SearchBox.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import FilterTabs from '../../components/ui/FilterTabs.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import VoucherFormModal from '../../components/vouchers/VoucherFormModal.jsx';
import {
  ADMIN_VOUCHERS_PAGE_SIZE,
  MAX_VOUCHER_CODE_LENGTH,
  SWITCH_OFF_VOUCHER_NOTE,
  VOUCHER_IN_USE_NOTE,
  VOUCHER_STATUS_TABS,
} from '../../config/vouchers.js';
import useFetch from '../../hooks/useFetch.js';
import useUrlFilters from '../../hooks/useUrlFilters.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import { cleanParams, toQueryString } from '../../utils/queryString.js';
import { formatVoucherDiscount, formatVoucherUses, toVoucherToggle } from '../../utils/voucherForm.js';

const COLUMNS = [
  {
    key: 'code',
    header: 'Code',
    render: (voucher) => <p className="font-semibold wrap-anywhere text-ink">{voucher.code}</p>,
  },
  { key: 'discount', header: 'Discount', render: (voucher) => formatVoucherDiscount(voucher) },
  {
    key: 'min',
    header: 'Min spend',
    align: 'right',
    labelled: true,
    render: (voucher) =>
      voucher.min_amount > 0 ? formatCurrency(voucher.min_amount) : <EmptyCell>None</EmptyCell>,
  },
  { key: 'uses', header: 'Uses', render: (voucher) => <span className="whitespace-nowrap">{formatVoucherUses(voucher)}</span> },
  {
    key: 'valid',
    header: 'Valid',
    wide: true,
    render: (voucher) => (
      <>
        <span className="whitespace-nowrap">{formatDate(voucher.starts_at, { withTime: true })}</span>
        <span className="text-ink-soft"> to </span>
        <span className="whitespace-nowrap">{formatDate(voucher.ends_at, { withTime: true })}</span>
      </>
    ),
  },
  { key: 'status', header: 'Status', badges: true, render: (voucher) => <StatusBadge status={voucher.status} /> },
];

// /admin/vouchers: tìm theo mã, tab trạng thái và trang nằm trên địa chỉ trang. Sửa trong hộp thoại,
// bật/tắt nhanh (PUT đủ mọi trường), xóa (409 khi đã có đơn dùng).
export default function AdminVouchersPage() {
  const { values, page, setSearchParams, updateUrl, goToPage } = useUrlFilters({
    search: (params) => (params.get('search') ?? '').trim().toUpperCase().slice(0, MAX_VOUCHER_CODE_LENGTH),
    status: VOUCHER_STATUS_TABS,
  });
  const { search, status } = values;
  const [message, setMessage] = useState({ type: 'success', text: '' });
  const [editing, setEditing] = useState({ open: false, voucher: null });
  const [switchingOff, setSwitchingOff] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const list = useFetch(
    () => adminVouchersApi.list({ search, status, page, limit: ADMIN_VOUCHERS_PAGE_SIZE }),
    ['admin-vouchers', search, status, page],
  );

  const done = (text) => {
    setMessage({ type: 'success', text });
    list.retry();
  };
  const fail = (text) => setMessage({ type: 'error', text });

  const setActive = async (voucher, isActive) => {
    setBusyId(voucher.id);
    try {
      await adminVouchersApi.update(voucher.id, toVoucherToggle(voucher, isActive));
      done(`${voucher.code} has been switched ${isActive ? 'on' : 'off'}.`);
    } catch (error) {
      fail(error.message);
    } finally {
      setBusyId(null);
      setSwitchingOff(null);
    }
  };

  const handleDelete = async () => {
    const voucher = deleting;
    setBusyId(voucher.id);
    try {
      await adminVouchersApi.remove(voucher.id);
      done(`${voucher.code} has been deleted.`);
    } catch (error) {
      fail(error.status === 409 ? VOUCHER_IN_USE_NOTE : error.message);
    } finally {
      setBusyId(null);
      setDeleting(null);
    }
  };

  const rowBusy = busyId !== null;

  const renderActions = (voucher) => (
    <RowActions
      itemLabel={voucher.code}
      disabled={rowBusy}
      primary={
        <Button
          size="sm"
          variant="secondary"
          aria-label={`Edit ${voucher.code}`}
          disabled={rowBusy}
          onClick={() => setEditing({ open: true, voucher })}
        >
          Edit
        </Button>
      }
      items={[
        {
          key: 'active',
          label: voucher.is_active ? 'Switch off' : 'Switch on',
          onClick: () => (voucher.is_active ? setSwitchingOff(voucher) : setActive(voucher, true)),
        },
        { key: 'delete', label: 'Delete', danger: true, onClick: () => setDeleting(voucher) },
      ]}
    />
  );

  const filtered = search || status;

  return (
    <>
      <AdminPageHeader
        title="Vouchers"
        subtitle="Discount codes for room bookings and food orders."
        action={<Button onClick={() => setEditing({ open: true, voucher: null })}>Add voucher</Button>}
      />
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      <AdminListPanel
        tabs={
          <FilterTabs
            label="Filter by status"
            tabs={VOUCHER_STATUS_TABS}
            active={status}
            getLink={(value) => `/admin/vouchers${toQueryString({ search, status: value })}`}
          />
        }
        toolbar={
          <>
            <SearchBox
              key={search}
              label="Code"
              value={search}
              maxLength={MAX_VOUCHER_CODE_LENGTH}
              placeholder="For example: WELCOME"
              className="w-full sm:w-56"
              onSearch={(value) => updateUrl({ search: value.toUpperCase(), page: '' })}
            />
            {search && (
              <Button variant="secondary" onClick={() => setSearchParams(cleanParams({ status }))}>
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
            title: filtered ? 'No vouchers match these filters' : 'No vouchers yet',
            message: filtered ? 'Try another code or status.' : 'Add the first voucher.',
          }}
          pagination={{
            page,
            limit: ADMIN_VOUCHERS_PAGE_SIZE,
            total: list.data?.pagination?.total ?? 0,
            onPageChange: goToPage,
          }}
        >
          <AdminRequestTable
            caption="Vouchers"
            items={list.data?.items ?? []}
            columns={COLUMNS}
            getItemLabel={(voucher) => voucher.code}
            renderActions={renderActions}
          />
        </AdminListBody>
      </AdminListPanel>

      <VoucherFormModal
        open={editing.open}
        voucher={editing.voucher}
        onClose={() => setEditing({ open: false, voucher: null })}
        onSaved={(saved, isNew) => {
          setEditing({ open: false, voucher: null });
          done(`${saved.code} has been ${isNew ? 'added' : 'updated'}.`);
        }}
      />
      <ConfirmDialog
        open={Boolean(switchingOff)}
        title={switchingOff ? `Switch off ${switchingOff.code}?` : ''}
        message={SWITCH_OFF_VOUCHER_NOTE}
        confirmLabel="Yes, switch off"
        cancelLabel="Go back"
        variant="danger"
        loading={busyId !== null}
        onConfirm={() => setActive(switchingOff, false)}
        onClose={() => setSwitchingOff(null)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting ? `Delete ${deleting.code}?` : ''}
        message="This cannot be undone. A voucher that has been used cannot be deleted; switch it off instead."
        confirmLabel="Yes, delete voucher"
        cancelLabel="Keep voucher"
        variant="danger"
        loading={busyId !== null}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
