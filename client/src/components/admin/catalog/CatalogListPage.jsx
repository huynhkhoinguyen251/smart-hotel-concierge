import { useState } from 'react';
import { CATALOG_IN_USE_NOTE, CATALOG_PAGE_SIZE, SWITCH_OFF_NOTE } from '../../../config/adminCatalog.js';
import useFetch from '../../../hooks/useFetch.js';
import useUrlFilters from '../../../hooks/useUrlFilters.js';
import { toCatalogPayload } from '../../../utils/catalogValidation.js';
import Alert from '../../ui/Alert.jsx';
import Button from '../../ui/Button.jsx';
import ConfirmDialog from '../../ui/ConfirmDialog.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import LoadError from '../../ui/LoadError.jsx';
import Pagination from '../../ui/Pagination.jsx';
import Select from '../../ui/Select.jsx';
import { PageSpinner } from '../../ui/Spinner.jsx';
import AdminRequestTable from '../AdminRequestTable.jsx';
import SearchBox from '../SearchBox.jsx';
import CatalogItemFormModal from './CatalogItemFormModal.jsx';

// Khung trang danh mục của admin (dịch vụ, món ăn, tour): tiêu đề, tab phụ, ô lọc trên địa chỉ trang,
// nút "Add ...", danh sách (bảng từ xl, thẻ khi nhỏ hơn), phân trang và thông báo.
// Mỗi dòng: Edit (mở hộp thoại form), bật/tắt nhanh, Delete. Sau mỗi thay đổi tải lại danh sách.
// - catalog: { noun, nounPlural, fields, flag, flagLabels: { on, off }, flagHint, api: { list, create, update, remove } }
// - filters: [{ name, label, options: [{ value, label }] }], value '' = tất cả.
// - search: { name, label, placeholder, maxLength } tùy chọn (ô chữ + nút Search).
// - columns: cột của AdminRequestTable; cột đầu là tiêu đề của thẻ.
export default function CatalogListPage({ title, subtitle, subNav, note, catalog, filters = [], search, columns }) {
  const { flag, flagLabels } = catalog;

  // Ô lọc bật/tắt luôn có, sau các ô lọc riêng của từng danh mục.
  const allFilters = [
    ...filters,
    {
      name: flag,
      label: 'Visibility',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: flagLabels.on },
        { value: 'false', label: flagLabels.off },
      ],
    },
  ];
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const { values, page, setSearchParams, updateUrl, goToPage } = useUrlFilters({
    ...Object.fromEntries(allFilters.map((filter) => [filter.name, filter.options])),
    ...(search && {
      [search.name]: (params) => (params.get(search.name) ?? '').trim().slice(0, search.maxLength),
    }),
  });

  const [message, setMessage] = useState({ type: 'success', text: '' });
  const [editing, setEditing] = useState({ open: false, item: null });
  const [switchingOff, setSwitchingOff] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const valueKey = Object.keys(values)
    .sort()
    .map((key) => values[key]);
  const list = useFetch(
    () => catalog.api.list({ ...values, page, limit: CATALOG_PAGE_SIZE }),
    [catalog.noun, ...valueKey, page],
  );

  const done = (text) => {
    setMessage({ type: 'success', text });
    list.retry();
  };
  const fail = (text) => setMessage({ type: 'error', text });

  // Bật/tắt nhanh: PUT sửa toàn bộ, nên gửi lại đủ dữ liệu của dòng, chỉ đổi flag.
  const setFlag = async (item, value) => {
    setBusyId(item.id);
    try {
      await catalog.api.update(item.id, toCatalogPayload(item, catalog.fields, flag, value));
      done(`"${item.name}" is now ${(value ? flagLabels.on : flagLabels.off).toLowerCase()}.`);
    } catch (error) {
      fail(error.message);
    } finally {
      setBusyId(null);
      setSwitchingOff(null);
    }
  };

  const handleDelete = async () => {
    const item = deleting;
    setBusyId(item.id);
    try {
      await catalog.api.remove(item.id);
      done(`"${item.name}" has been deleted.`);
    } catch (error) {
      fail(error.status === 409 ? CATALOG_IN_USE_NOTE : error.message);
    } finally {
      setBusyId(null);
      setDeleting(null);
    }
  };

  const renderActions = (item) => {
    const on = Boolean(item[flag]);
    const rowBusy = busyId !== null;
    return (
      <>
        <Button size="sm" variant="secondary" aria-label={`Edit ${item.name}`} disabled={rowBusy} onClick={() => setEditing({ open: true, item })}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="secondary"
          aria-label={`${on ? 'Switch off' : 'Switch on'} ${item.name}`}
          loading={busyId === item.id && !deleting && !switchingOff}
          disabled={rowBusy}
          onClick={() => (on ? setSwitchingOff(item) : setFlag(item, true))}
        >
          {on ? 'Switch off' : 'Switch on'}
        </Button>
        <Button size="sm" variant="danger" aria-label={`Delete ${item.name}`} disabled={rowBusy} onClick={() => setDeleting(item)}>
          Delete
        </Button>
      </>
    );
  };

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) {
      return <LoadError error={list.error} onRetry={list.retry} />;
    }
    if (list.data.items.length === 0) {
      const filtered = Object.values(values).some(Boolean);
      return (
        <EmptyState
          title={filtered ? `No ${catalog.nounPlural} match these filters` : `No ${catalog.nounPlural} yet`}
          message={filtered ? 'Try another filter.' : `Add the first ${catalog.noun}.`}
        />
      );
    }
    return (
      <>
        <AdminRequestTable
          caption={title}
          items={list.data.items}
          columns={columns}
          getItemLabel={(item) => item.name}
          renderActions={renderActions}
        />
        <Pagination
          className="mt-8"
          page={page}
          limit={CATALOG_PAGE_SIZE}
          total={list.data.pagination?.total ?? 0}
          onPageChange={goToPage}
        />
      </>
    );
  };

  const filtered = Object.values(values).some(Boolean);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <div className="mb-4 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-slate-600">{subtitle}</p>}
        </div>
        <Button className="mb-4" onClick={() => setEditing({ open: true, item: null })}>
          Add {catalog.noun}
        </Button>
      </div>
      {subNav}
      {note && <p className="mb-4 rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-900">{note}</p>}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {allFilters.map((filter) => (
          <Select
            key={filter.name}
            label={filter.label}
            className="sm:w-64"
            value={values[filter.name]}
            onChange={(event) => updateUrl({ [filter.name]: event.target.value, page: '' })}
            options={filter.options}
          />
        ))}
        {search && (
          <SearchBox
            key={values[search.name]}
            label={search.label}
            value={values[search.name]}
            maxLength={search.maxLength}
            placeholder={search.placeholder}
            className="w-full sm:w-56"
            onSearch={(value) => updateUrl({ [search.name]: value, page: '' })}
          />
        )}
        {filtered && (
          <Button variant="secondary" onClick={() => setSearchParams({})}>
            Reset
          </Button>
        )}
      </div>
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      {renderList()}

      <CatalogItemFormModal
        open={editing.open}
        item={editing.item}
        catalog={catalog}
        onClose={() => setEditing({ open: false, item: null })}
        onSaved={(saved, isNew) => {
          setEditing({ open: false, item: null });
          done(isNew ? `"${saved.name}" has been added.` : `"${saved.name}" has been updated.`);
        }}
      />
      <ConfirmDialog
        open={Boolean(switchingOff)}
        title={switchingOff ? `Switch off "${switchingOff.name}"?` : ''}
        message={`${SWITCH_OFF_NOTE} Existing orders are not changed.`}
        confirmLabel="Yes, switch off"
        cancelLabel="Go back"
        variant="danger"
        loading={busyId !== null}
        onConfirm={() => setFlag(switchingOff, false)}
        onClose={() => setSwitchingOff(null)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting ? `Delete "${deleting.name}"?` : ''}
        message={`This cannot be undone. If the ${catalog.noun} already has orders, switch it off instead.`}
        confirmLabel={`Yes, delete ${catalog.noun}`}
        cancelLabel={`Keep ${catalog.noun}`}
        variant="danger"
        loading={busyId !== null}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
