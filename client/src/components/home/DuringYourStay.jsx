import { Link } from 'react-router-dom';
import { getServices } from '../../api/services.api.js';
import { isHotelServiceCategory } from '../../config/services.js';
import { getPriceUnit } from '../../utils/serviceHelpers.js';
import Bone, { BoneGroup } from '../ui/Bone.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';
import HomeSection from './HomeSection.jsx';

// Danh sách dịch vụ rất ngắn: tải một lần tối đa 50 (giới hạn của backend), giống trang Services.
const SERVICES_LIMIT = 50;
const PAIR_SIZE = 2;

const GRID = 'grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-16';
// Hai ảnh lệch nhau: ảnh rộng hơn nằm cao, ảnh hẹp nằm thấp hơn.
const PAIR = 'grid grid-cols-[1.4fr_1fr] gap-3 sm:gap-5';
const PAIR_PHOTOS = ['aspect-[4/5]', 'mt-10 aspect-[3/4] sm:mt-20'];

// Cặp ảnh: ưu tiên hai dịch vụ đầu có ảnh, của hai loại khác nhau.
const pickPair = (services) => services.filter((service) => service.image_url).slice(0, PAIR_SIZE);

function ServicesSkeleton() {
  return (
    <BoneGroup className={GRID}>
      <div className={PAIR}>
        {PAIR_PHOTOS.map((className) => (
          <Bone key={className} className={className} />
        ))}
      </div>
      <div className="space-y-5">
        {[1, 2, 3, 4, 5].map((row) => (
          <Bone key={row} className="h-11" />
        ))}
      </div>
    </BoneGroup>
  );
}

// Dịch vụ trong khách sạn: cặp ảnh lệch và danh sách chữ kèm giá.
export default function DuringYourStay() {
  return (
    <HomeSection
      title="During your stay"
      to="/services"
      linkLabel="View all services"
      load={() => getServices({ limit: SERVICES_LIMIT })}
      skeleton={<ServicesSkeleton />}
    >
      {(data) => {
        // API trả cả dịch vụ vận chuyển; phần này chỉ hiện dịch vụ trong khách sạn.
        const services = data.services.filter((service) => isHotelServiceCategory(service.category));
        if (services.length === 0) return <EmptyState title="No services available right now" />;
        const pair = pickPair(services);
        return (
          <div className={pair.length === PAIR_SIZE ? GRID : ''}>
            {pair.length === PAIR_SIZE && (
              <div className={PAIR}>
                {pair.map((service, index) => (
                  <PhotoFrame
                    key={service.id}
                    src={service.image_url}
                    alt={service.name}
                    className={PAIR_PHOTOS[index]}
                  />
                ))}
              </div>
            )}
            <ul className="divide-y divide-line-soft border-y border-line-soft">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/services/${service.id}`}
                    className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
                  >
                    <span className="text-lg font-medium text-ink transition-colors duration-150 group-hover:text-sea">
                      {service.name}
                    </span>
                    <Price amount={service.price} unit={getPriceUnit(service.category)} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      }}
    </HomeSection>
  );
}
