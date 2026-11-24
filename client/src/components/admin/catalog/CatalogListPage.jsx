import { useState } from 'react';
import { CATALOG_IN_USE_NOTE, CATALOG_PAGE_SIZE, SWITCH_OFF_NOTE } from '../../../config/adminCatalog.js';
import useFetch from '../../../hooks/useFetch.js';
import useUrlFilters from '../../../hooks/useUrlFilters.js';
import { toCatalogPayload } from '../../../utils/catalogValidation.js';
import Alert from '../../ui/Alert.jsx';
import Button from '../../ui/Button.jsx';
import ConfirmDialog from '../../ui/ConfirmDialog.jsx';
import Select from '../../ui/Select.jsx';
import StatusBadge from '../../ui/StatusBadge.jsx';
import AdminListPanel, { AdminListBody } from '../AdminListPanel.jsx';
import AdminPageHeader from '../AdminPageHeader.jsx';
import AdminRequestTable from '../AdminRequestTable.jsx';
import RowActions from '../RowActions.jsx';
import SearchBox from '../SearchBox.jsx';
import CatalogItemFormModal from './CatalogItemFormModal.jsx';

// Khung trang danh mục của admin (dịch vụ, món ăn, tour): tiêu đề, thanh chuyển mục, ô lọc trên địa chỉ trang,
// nút "Add ...", danh sách, phân trang và thông báo.
// Mỗi dòng: Edit (mở hộp thoại form); bật/tắt và Delete nằm trong "More". Sau mỗi thay đổi tải lại danh sách.
// - catalog: { noun, nounPlural, fields, flag, flagLabels: { on, off }, flagStatuses: { on, off }, flagHint, api: { list, create, update, remove } }
// - filters: [{ name, label, options: [{ value, label }] }], value '' = tất cả.
// - search: { name, label, placeholder, maxLength } tùy chọn (ô chữ + nút Search).
// - columns: cột của AdminRequestTable; cột đầu là tiêu đề của thẻ.
export default function CatalogListPage({ title, subtitle, subNav, note, catalog, filters = [], search, columns }) {
  const { flag, flagLabels, flagStatuses } = catalog;
  // Cột trạng thái bật/tắt luôn nằm sau các cột riêng của từng danh mục.
  const allColumns = [
    ...columns,
    {
      key: 'flag',
      header: 'Status',
      badges: true,
      render: (item) => <StatusBadge status={item[flag] ? flagStatuses.on : flagStatuses.off} />,
    },
  ];

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

  const rowBusy = busyId !== null;

  const renderActions = (item) => {
    const on = Boolean(item[flag]);
    return (
      <RowActions
        itemLabel={item.name}
        disabled={rowBusy}
        primary={
          <Button
            size="sm"
            variant="secondary"
            aria-label={`Edit ${item.name}`}
            disabled={rowBusy}
            onClick={() => setEditing({ open: true, item })}
          >
            Edit
          </Button>
        }
        items={[
          {
            key: 'flag',
            label: on ? 'Switch off' : 'Switch on',
            onClick: () => (on ? setSwitchingOff(item) : setFlag(item, true)),
          },
          { key: 'delete', label: 'Delete', danger: true, onClick: () => setDeleting(item) },
        ]}
      />
    );
  };

  const filtered = Object.values(values).some(Boolean);

  return (
    <>
      <AdminPageHeader
        title={title}
        subtitle={subtitle}
        action={<Button onClick={() => setEditing({ open: true, item: null })}>Add {catalog.noun}</Button>}
        subNav={subNav}
      />
      {note && <p className="mb-4 max-w-prose text-sm text-ink-soft">{note}</p>}
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      <AdminListPanel
        toolbar={
          <>
            {allFilters.map((filter) => (
              <Select
                key={filter.name}
                label={filter.label}
                className="sm:w-56"
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
          </>
        }
      >
        <AdminListBody
          list={list}
          items={list.data?.items ?? []}
          empty={{
            title: filtered ? `No ${catalog.nounPlural} match these filters` : `No ${catalog.nounPlural} yet`,
            message: filtered ? 'Try another filter.' : `Add the first ${catalog.noun}.`,
          }}
          pagination={{
            page,
            limit: CATALOG_PAGE_SIZE,
            total: list.data?.pagination?.total ?? 0,
            onPageChange: goToPage,
          }}
        >
          <AdminRequestTable
            caption={title}
            items={list.data?.items ?? []}
            columns={allColumns}
            getItemLabel={(item) => item.name}
            renderActions={renderActions}
          />
        </AdminListBody>
      </AdminListPanel>

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
    </>
  );
}
