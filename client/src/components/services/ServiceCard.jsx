import { getCategoryLabel, getPriceUnit } from '../../utils/serviceHelpers.js';
import ButtonLink from '../ui/ButtonLink.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';

// Một dịch vụ trong trang Services: ảnh lớn, tên, mô tả, giá kèm đơn vị và nút đặt. Cả khối bấm được.
// to: link sang trang đặt dịch vụ (có thể kèm ?booking_id=).
// wide = true: ảnh bên trái, chữ bên phải (dịch vụ đứng một mình trên hàng).
export default function ServiceCard({ service, to, wide = false }) {
  return (
    <article
      className={`group relative ${wide ? 'grid gap-5 md:grid-cols-[1.6fr_1fr] md:items-center md:gap-10' : ''}`}
    >
      <PhotoFrame
        src={service.image_url}
        alt={service.name}
        className={`aspect-[4/3] sm:aspect-auto sm:h-72 ${wide ? 'lg:h-96' : 'lg:h-80'}`}
      />
      <div className={wide ? '' : 'mt-5'}>
        <h3 className="text-xl font-semibold break-words text-ink transition-colors duration-150 group-hover:text-sea">
          {service.name}
        </h3>
        <p className="mt-1 text-sm text-ink-soft">{getCategoryLabel(service.category)}</p>
        {service.description && <p className="mt-3 max-w-prose text-ink">{service.description}</p>}
        <div className={`mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 ${wide ? '' : 'justify-between'}`}>
          <Price amount={service.price} unit={getPriceUnit(service.category)} />
          <ButtonLink
            to={to}
            variant="secondary"
            aria-label={`Book this service: ${service.name}`}
            className="static! after:absolute after:inset-0 after:content-['']"
          >
            Book this service
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
