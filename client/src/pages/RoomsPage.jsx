import { useState } from 'react';
import { FilterOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { getAmenities, getRoomTypes } from '../api/catalog.api.js';
import { getRooms } from '../api/rooms.api.js';
import RoomCard from '../components/rooms/RoomCard.jsx';
import RoomFilters from '../components/rooms/RoomFilters.jsx';
import Alert from '../components/ui/Alert.jsx';
import Bone, { BoneGroup } from '../components/ui/Bone.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadError from '../components/ui/LoadError.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import useFetch from '../hooks/useFetch.js';
import useMediaQuery, { DESKTOP_QUERY } from '../hooks/useMediaQuery.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import formatDate from '../utils/formatDate.js';
import { cleanParams, readPage } from '../utils/queryString.js';
import { getRoomTypeDetails } from '../utils/roomAmenities.js';
import { countActiveFilters, hasActiveFilters, readRoomFilters } from '../utils/roomFilters.js';

const PAGE_SIZE = 9;

function RoomRowsSkeleton() {
  return (
    <BoneGroup className="divide-y divide-line-soft border-y border-line-soft">
      {[1, 2, 3].map((row) => (
        <div key={row} className="grid gap-4 py-6 sm:grid-cols-[2fr_3fr] sm:gap-6">
          <Bone className="aspect-[4/3] sm:aspect-auto sm:h-64" />
          <div>
            <Bone className="h-7 w-44" />
            <Bone className="mt-3 h-4 w-full max-w-64" />
            <Bone className="mt-6 h-4 w-full max-w-52" />
          </div>
        </div>
      ))}
    </BoneGroup>
  );
}

// Trang tìm phòng. Mọi bộ lọc nằm trên địa chỉ trang (?check_in=...&page=2).
export default function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const reducedMotion = useReducedMotion();
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Tăng khi bấm Clear, để form bộ lọc điền lại kể cả khi địa chỉ trang không đổi.
  const [resetCount, setResetCount] = useState(0);

  const queryKey = searchParams.toString();
  const filters = readRoomFilters(searchParams);
  const page = readPage(searchParams);

  const catalog = useFetch(() => Promise.all([getRoomTypes(), getAmenities()]), []);
  const [roomTypes, amenities] = catalog.data ?? [[], []];
  const typeDetails = getRoomTypeDetails(roomTypes);

  const list = useFetch(() => getRooms({ ...filters, page, limit: PAGE_SIZE }), [queryKey]);

  const applyFilters = (values) => {
    // Bộ lọc mới luôn bắt đầu từ trang 1.
    setSearchParams(cleanParams(values));
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchParams({});
    setResetCount((count) => count + 1);
    setFiltersOpen(false);
  };

  const goToPage = (nextPage) => {
    setSearchParams(cleanParams({ ...filters, page: nextPage > 1 ? nextPage : '' }));
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const stay = { check_in: filters.check_in, check_out: filters.check_out, guests: filters.guests };
  const hasDates = filters.check_in && filters.check_out;
  const total = list.data?.pagination?.total ?? 0;
  const activeCount = countActiveFilters(filters);

  const renderResults = () => {
    // Đợi cả mô tả loại phòng, để các dòng không đổi chiều cao sau khi hiện.
    if (list.loading || catalog.loading) {
      return <RoomRowsSkeleton />;
    }
    if (list.error) {
      // 400: dữ liệu tìm kiếm không hợp lệ, hiện đúng thông báo của backend.
      return <LoadError error={list.error} onRetry={list.retry} />;
    }
    if (list.data.rooms.length === 0) {
      return (
        <EmptyState
          title="No rooms match your search"
          message="Try other dates, fewer guests or fewer filters."
          action={
            hasActiveFilters(filters) && (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      );
    }
    return (
      <>
        <div className="divide-y divide-line-soft border-y border-line-soft">
          {list.data.rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              stay={stay}
              details={typeDetails.get(room.room_type.id)}
            />
          ))}
        </div>
        <Pagination
          className="mt-8"
          page={page}
          limit={PAGE_SIZE}
          total={total}
          onPageChange={goToPage}
        />
      </>
    );
  };

  const renderFilters = () => (
    <RoomFilters
      key={`${queryKey}|${resetCount}`}
      initialFilters={filters}
      roomTypes={roomTypes}
      amenities={amenities}
      catalogError={catalog.error}
      onApply={applyFilters}
      onClear={clearFilters}
    />
  );

  return (
    <div className="shell py-8 lg:py-12">
      <PageTitle title="Rooms" subtitle="Find a room that fits your dates and your group." />

      <div className="grid gap-x-10 gap-y-4 xl:gap-x-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        {isDesktop ? (
          <aside>{renderFilters()}</aside>
        ) : (
          <>
            <Button
              variant="secondary"
              fullWidth
              icon={<FilterOutlined />}
              aria-expanded={filtersOpen}
              aria-haspopup="dialog"
              onClick={() => setFiltersOpen(true)}
            >
              {activeCount > 0 ? `Filters (${activeCount})` : 'Filters'}
            </Button>
            <Drawer
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              placement="right"
              size="min(24rem, 92vw)"
              title="Filters"
              closable={{ placement: 'end', 'aria-label': 'Close filters' }}
            >
              {renderFilters()}
            </Drawer>
          </>
        )}

        <section aria-label="Search results" className="min-w-0">
          {hasDates && (
            <Alert type="info" className="mb-4">
              Showing rooms available from {formatDate(filters.check_in)} to{' '}
              {formatDate(filters.check_out)}.
            </Alert>
          )}
          {!list.loading && !list.error && (
            <p className="mb-3 text-sm text-ink-soft" role="status">
              {total} {total === 1 ? 'room' : 'rooms'} found
            </p>
          )}
          {renderResults()}
        </section>
      </div>
    </div>
  );
}
