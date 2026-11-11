import { Link } from 'react-router-dom';

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

// Trang chủ tạm: phần giới thiệu và ba khối tính năng. Nội dung thật làm ở bước sau.
export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
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
