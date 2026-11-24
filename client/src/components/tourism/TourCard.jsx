import ButtonLink from '../ui/ButtonLink.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';

// Một tour trong trang Tours. Cả khối bấm được.
// wide = true: ảnh rộng hết cột, chữ bên dưới chia hai bên.
export default function TourCard({ tour, wide = false }) {
  return (
    <article className="group relative flex h-full flex-col">
      <PhotoFrame
        src={tour.image_url}
        alt={tour.name}
        className={wide ? 'aspect-[4/3] sm:aspect-[2/1] lg:aspect-[21/9]' : 'aspect-[4/3] sm:aspect-auto sm:h-60'}
      />
      <div className={`mt-5 ${wide ? 'grid gap-4 md:grid-cols-[1fr_auto] md:gap-12' : 'flex flex-1 flex-col justify-between gap-4'}`}>
        <div className="min-w-0">
          <h2
            className={`font-semibold break-words text-ink transition-colors duration-150 group-hover:text-sea ${wide ? 'text-2xl' : 'text-xl'}`}
          >
            {tour.name}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {tour.location} · {tour.duration}
          </p>
          {tour.description && <p className="mt-3 max-w-prose text-ink">{tour.description}</p>}
        </div>
        <div
          className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-3 ${wide ? 'md:flex-col md:items-end md:justify-start' : ''}`}
        >
          <Price amount={tour.price} prefix="from" unit="per person" />
          <ButtonLink
            to={`/tours/${tour.id}`}
            variant="secondary"
            aria-label={`View tour: ${tour.name}`}
            className="static! after:absolute after:inset-0 after:content-['']"
          >
            View tour
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
