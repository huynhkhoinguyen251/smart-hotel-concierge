import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAmenities, getRoomTypes } from '../api/catalog.api.js';
import { getRooms } from '../api/rooms.api.js';
import RoomCard from '../components/rooms/RoomCard.jsx';
import RoomFilters from '../components/rooms/RoomFilters.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import useFetch from '../hooks/useFetch.js';
import formatDate from '../utils/formatDate.js';
import { cleanParams, readPage } from '../utils/queryString.js';
import { hasActiveFilters, readRoomFilters } from '../utils/roomFilters.js';

// Lưới 3 cột trên máy tính nên mỗi trang 9 phòng.
const PAGE_SIZE = 9;

// Trang tìm phòng. Mọi bộ lọc nằm trên địa chỉ trang (?check_in=...&page=2).
export default function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Tăng khi bấm Clear, để form bộ lọc điền lại kể cả khi địa chỉ trang không đổi.
  const [resetCount, setResetCount] = useState(0);

  const queryKey = searchParams.toString();
  const filters = readRoomFilters(searchParams);
  const page = readPage(searchParams);

  const catalog = useFetch(() => Promise.all([getRoomTypes(), getAmenities()]), []);
  const [roomTypes, amenities] = catalog.data ?? [[], []];

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stay = { check_in: filters.check_in, check_out: filters.check_out, guests: filters.guests };
  const hasDates = filters.check_in && filters.check_out;
  const total = list.data?.pagination?.total ?? 0;

  const renderResults = () => {
    if (list.loading) {
      return <PageSpinner />;
    }
    if (list.error) {
      // 400: dữ liệu tìm kiếm không hợp lệ, hiện đúng thông báo của backend.
      return list.error.status === 400 ? (
        <Alert type="error">{list.error.message}</Alert>
      ) : (
        <ErrorState message={list.error.message} onRetry={list.retry} />
      );
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
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.data.rooms.map((room) => (
            <RoomCard key={room.id} room={room} stay={stay} />
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageTitle title="Rooms" subtitle="Find a room that fits your dates and your group." />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside>
          <Button
            variant="secondary"
            fullWidth
            className="lg:hidden"
            aria-expanded={filtersOpen}
            aria-controls="room-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Hide filters' : 'Show filters'}
          </Button>
          <Card
            className={`${filtersOpen ? 'mt-4 block' : 'hidden'} lg:sticky lg:top-24 lg:mt-0 lg:block`}
          >
            <div id="room-filters">
              <RoomFilters
                key={`${queryKey}|${resetCount}`}
                initialFilters={filters}
                roomTypes={roomTypes}
                amenities={amenities}
                catalogError={catalog.error}
                onApply={applyFilters}
                onClear={clearFilters}
              />
            </div>
          </Card>
        </aside>

        <section aria-label="Search results" className="min-w-0">
          {hasDates && (
            <Alert type="info" className="mb-4">
              Showing rooms available from {formatDate(filters.check_in)} to{' '}
              {formatDate(filters.check_out)}.
            </Alert>
          )}
          {!list.loading && !list.error && (
            <p className="mb-4 text-sm text-slate-600">
              {total} {total === 1 ? 'room' : 'rooms'} found
            </p>
          )}
          {renderResults()}
        </section>
      </div>
    </div>
  );
}
