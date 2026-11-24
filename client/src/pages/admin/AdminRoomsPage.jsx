import { useState } from 'react';
import { getAdminRooms } from '../../api/adminRooms.api.js';
import { getRoomTypes } from '../../api/catalog.api.js';
import ListPanel, { ListBody } from '../../components/ui/ListPanel.jsx';
import AdminRequestTable from '../../components/admin/AdminRequestTable.jsx';
import { EmptyCell, MoneyCell, StackCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import SearchBox from '../../components/admin/SearchBox.jsx';
import RoomCatalogHeader from '../../components/admin/rooms/RoomCatalogHeader.jsx';
import RoomRowActions from '../../components/admin/rooms/RoomRowActions.jsx';
import RoomImage from '../../components/rooms/RoomImage.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import FilterTabs from '../../components/ui/FilterTabs.jsx';
import RatingStars from '../../components/ui/RatingStars.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { ADMIN_ROOMS_PAGE_SIZE, ROOM_SEARCH_MAX_LENGTH } from '../../config/adminCatalog.js';
import { ROOM_STATUS_TABS } from '../../config/statuses.js';
import useFetch from '../../hooks/useFetch.js';
import useUrlFilters from '../../hooks/useUrlFilters.js';
import useFlashMessage from '../../hooks/useFlashMessage.js';
import { cleanParams, toQueryString } from '../../utils/queryString.js';

const ID_PATTERN = /^[1-9]\d*$/;

const COLUMNS = [
  {
    key: 'room',
    header: 'Room',
    render: (room, link) => (
      <div className="flex items-start gap-3">
        <RoomImage
          src={room.primary_image}
          alt={`Room ${room.room_number}`}
          className="h-12 w-16 shrink-0 rounded-control"
        />
        <TitleCell title={`Room ${room.room_number}`} detail={`Floor ${room.floor}`} link={link} />
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Room type',
    render: (room) => <StackCell main={room.room_type.name} detail={`Up to ${room.room_type.capacity} guests`} />,
  },
  { key: 'price', header: 'Price per night', align: 'right', render: (room) => <MoneyCell amount={room.room_type.price_per_night} /> },
  {
    key: 'rating',
    wide: true,
    header: 'Rating',
    render: (room) =>
      room.review_count > 0 ? (
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          <RatingStars rating={room.avg_rating} />
          <span className="text-xs text-ink-soft">({room.review_count})</span>
        </span>
      ) : (
        <EmptyCell>No reviews</EmptyCell>
      ),
  },
  { key: 'status', header: 'Status', badges: true, render: (room) => <StatusBadge status={room.status} /> },
];

// /admin/rooms: mọi phòng, kể cả maintenance và inactive. Trạng thái, loại phòng, từ khóa và trang
// đều nằm trên địa chỉ trang. Mỗi dòng có link sửa phòng và "More" để đổi nhanh trạng thái.
export default function AdminRoomsPage() {
  const flashMessage = useFlashMessage();
  const { values: filters, page, setSearchParams, updateUrl, goToPage } = useUrlFilters({
    status: ROOM_STATUS_TABS,
    room_type_id: (params) => (ID_PATTERN.test(params.get('room_type_id') ?? '') ? params.get('room_type_id') : ''),
    search: (params) => (params.get('search') ?? '').slice(0, ROOM_SEARCH_MAX_LENGTH),
  });
  const { status, room_type_id: roomTypeId, search } = filters;
  const [message, setMessage] = useState({ type: 'success', text: flashMessage });

  const roomTypes = useFetch(() => getRoomTypes(), ['room-types']);
  const list = useFetch(
    () => getAdminRooms({ status, room_type_id: roomTypeId, search, page, limit: ADMIN_ROOMS_PAGE_SIZE }),
    [status, roomTypeId, search, page],
  );

  const statusProps = {
    onSuccess: (_updated, text) => {
      setMessage({ type: 'success', text });
      list.retry();
    },
    onError: (text) => setMessage({ type: 'error', text }),
  };

  const typeOptions = [
    { value: '', label: 'All room types' },
    ...(roomTypes.data ?? []).map((type) => ({ value: String(type.id), label: type.name })),
  ];

  const filtered = status || roomTypeId || search;

  return (
    <>
      <RoomCatalogHeader
        title="Rooms"
        subtitle="All rooms of the hotel, including rooms in maintenance and inactive rooms."
        action={{ to: '/admin/rooms/new', label: 'Add room' }}
      />
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      <ListPanel
        tabs={
          <FilterTabs
            label="Filter by status"
            tabs={ROOM_STATUS_TABS}
            active={status}
            getLink={(value) => `/admin/rooms${toQueryString({ ...filters, status: value })}`}
          />
        }
        toolbar={
          <>
            <Select
              label="Room type"
              className="sm:w-56"
              value={roomTypeId}
              onChange={(event) => updateUrl({ room_type_id: event.target.value, page: '' })}
              options={typeOptions}
            />
            <SearchBox
              key={search}
              label="Room number"
              value={search}
              maxLength={ROOM_SEARCH_MAX_LENGTH}
              placeholder="For example: 30"
              onSearch={(value) => updateUrl({ search: value, page: '' })}
            />
            {(roomTypeId || search) && (
              <Button variant="secondary" onClick={() => setSearchParams(cleanParams({ status }))}>
                Reset
              </Button>
            )}
          </>
        }
      >
        <ListBody
          list={list}
          items={list.data?.items ?? []}
          empty={{
            title: filtered ? 'No rooms match these filters' : 'No rooms yet',
            message: filtered ? 'Try another status, room type or room number.' : 'Add the first room of the hotel.',
          }}
          pagination={{
            page,
            limit: ADMIN_ROOMS_PAGE_SIZE,
            total: list.data?.pagination?.total ?? 0,
            onPageChange: goToPage,
          }}
        >
          <AdminRequestTable
            caption="Rooms"
            items={list.data?.items ?? []}
            columns={COLUMNS}
            viewLabel="Edit"
            getViewPath={(room) => `/admin/rooms/${room.id}`}
            getItemLabel={(room) => `room ${room.room_number}`}
            renderActions={(room) => <RoomRowActions room={room} {...statusProps} />}
          />
        </ListBody>
      </ListPanel>
    </>
  );
}
