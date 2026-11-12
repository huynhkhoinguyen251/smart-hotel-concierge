import { Link } from 'react-router-dom';
import { getRooms } from '../api/rooms.api.js';
import RoomCard from '../components/rooms/RoomCard.jsx';
import RoomSearchForm from '../components/rooms/RoomSearchForm.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import useFetch from '../hooks/useFetch.js';

const FEATURES = [
  {
    title: 'Rooms',
    text: 'Check availability and book a room for your dates in a few steps.',
    to: '/rooms',
  },
  {
    title: 'Hotel services',
    text: 'Breakfast, massage, laundry and housekeeping, booked from your phone.',
    to: '/services',
  },
  {
    title: 'Food and tours',
    text: 'Order food to your room, rent a motorbike or join a local tour.',
    to: '/tours',
  },
];

// Ba phòng có điểm đánh giá cao nhất.
function TopRatedRooms() {
  const { data, error, loading, retry } = useFetch(
    () => getRooms({ sort: 'rating_desc', limit: 3 }),
    [],
  );

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} onRetry={retry} />;
  if (data.rooms.length === 0) return <EmptyState title="No rooms available right now" />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-16 sm:pb-32 sm:pt-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-100">
            Welcome to
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Smart Hotel Concierge
          </h1>
          <p className="mt-5 max-w-xl text-lg text-teal-50">
            Book your room, hotel services, food and local tours in one place, without calling
            the front desk.
          </p>
          <Link
            to="/rooms"
            className="mt-8 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-teal-800 shadow-sm hover:bg-teal-50"
          >
            View rooms
          </Link>
        </div>
      </section>

      {/* Khung tìm phòng nằm đè lên mép dưới của phần giới thiệu. */}
      <section className="mx-auto -mt-20 max-w-6xl px-4" aria-label="Room search">
        <RoomSearchForm />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Top rated rooms</h2>
          <Link to="/rooms" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
            View all rooms →
          </Link>
        </div>
        <TopRatedRooms />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              to={feature.to}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{feature.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
