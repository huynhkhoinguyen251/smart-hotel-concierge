import { Link } from 'react-router-dom';
import { getTours } from '../../api/tours.api.js';
import Bone, { BoneGroup } from '../ui/Bone.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import MoreLink from '../ui/MoreLink.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';
import HomeSection from './HomeSection.jsx';

// Một ảnh rộng và tối đa ba ảnh nhỏ.
const TOUR_COUNT = 4;
const WIDE_PHOTO = 'aspect-[4/3] sm:aspect-[2/1] lg:aspect-[21/9]';
// Ảnh nhỏ cùng chiều cao nhưng không cùng bề rộng (màn hình vừa: ảnh thứ ba chiếm cả hàng).
const SMALL_GRIDS = {
  1: '',
  2: 'sm:grid-cols-[1fr_1.4fr]',
  3: 'sm:grid-cols-2 lg:grid-cols-[1fr_1.35fr_1fr] sm:max-lg:[&>*:last-child]:col-span-2',
};
const SMALL_PHOTO = 'aspect-[4/3] sm:aspect-auto sm:h-56 lg:h-64';

function TourTile({ tour, wide = false }) {
  return (
    <Link to={`/tours/${tour.id}`} className="group block rounded-panel">
      <PhotoFrame src={tour.image_url} alt={tour.name} className={wide ? WIDE_PHOTO : SMALL_PHOTO} />
      <div className={`mt-4 ${wide ? 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1' : ''}`}>
        <div className="min-w-0">
          <h3
            className={`font-semibold break-words text-ink transition-colors duration-150 group-hover:text-sea ${wide ? 'text-2xl' : 'text-lg'}`}
          >
            {tour.name}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            {tour.location} · {tour.duration}
          </p>
        </div>
        <Price amount={tour.price} prefix="from" unit="per person" className={wide ? '' : 'mt-1 block'} />
      </div>
    </Link>
  );
}

function ToursSkeleton() {
  return (
    <BoneGroup>
      <Bone className={WIDE_PHOTO} />
      <Bone className="mt-4 h-14 w-72 max-w-full" />
      <div className={`mt-10 grid gap-x-8 gap-y-10 ${SMALL_GRIDS[3]}`}>
        {[1, 2, 3].map((tile) => (
          <Bone key={tile} className={SMALL_PHOTO} />
        ))}
      </div>
    </BoneGroup>
  );
}

// Tour quanh Da Nang: một ảnh rộng hết cột và các ảnh nhỏ bên dưới.
export default function AroundDaNang() {
  return (
    <HomeSection
      title="Around Da Nang"
      to="/tours"
      linkLabel="View all tours"
      load={() => getTours({ limit: TOUR_COUNT })}
      skeleton={<ToursSkeleton />}
    >
      {({ tours }) => {
        if (tours.length === 0) return <EmptyState title="No tours available right now" />;
        const [first, ...rest] = tours;
        return (
          <>
            <TourTile tour={first} wide />
            {rest.length > 0 && (
              <div className={`mt-10 grid gap-x-8 gap-y-10 ${SMALL_GRIDS[rest.length] ?? ''}`}>
                {rest.map((tour) => (
                  <TourTile key={tour.id} tour={tour} />
                ))}
              </div>
            )}
            <p className="mt-10 flex flex-wrap items-baseline gap-x-4 border-t border-line-soft pt-5 text-ink">
              You can also rent a motorbike, or book an airport pickup or a shuttle.
              <MoreLink to="/tours?tab=transport">View transport</MoreLink>
            </p>
          </>
        );
      }}
    </HomeSection>
  );
}
