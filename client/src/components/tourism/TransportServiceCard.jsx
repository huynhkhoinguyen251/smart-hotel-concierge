import { getTransportCategory } from '../../utils/tourismHelpers.js';
import ButtonLink from '../ui/ButtonLink.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';

// Một dòng gọn trong danh sách vận chuyển (thuê xe máy, đón sân bay, xe đưa đón):
// ảnh nhỏ, cách tính giá, giá và nút đặt. Cả dòng bấm được.
export default function TransportServiceCard({ service }) {
  const category = getTransportCategory(service.category);

  return (
    <article className="group relative flex gap-4 py-5 sm:gap-6">
      <PhotoFrame src={service.image_url} alt={service.name} className="aspect-square w-24 shrink-0 self-start sm:w-36" />
      <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold break-words text-ink transition-colors duration-150 group-hover:text-sea">
            {service.name}
          </h2>
          <p className="text-sm text-ink-soft">{category.label}</p>
          {service.description && <p className="mt-2 max-w-prose text-ink">{service.description}</p>}
          <p className="mt-1 max-w-prose text-sm text-ink-soft">{category.pricing}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:shrink-0 md:flex-col md:items-end">
          <Price amount={service.price} unit={category.priceUnit} />
          <ButtonLink
            to={`/transport/${service.id}`}
            variant="secondary"
            aria-label={`Book: ${service.name}`}
            className="static! after:absolute after:inset-0 after:content-['']"
          >
            Book
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
