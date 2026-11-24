import { Link } from 'react-router-dom';
import { getMenuItems } from '../../api/menuItems.api.js';
import { toQueryString } from '../../utils/queryString.js';
import Bone, { BoneGroup } from '../ui/Bone.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';
import HomeSection from './HomeSection.jsx';

const DISH_COUNT = 6;

// Một hàng ngang: máy tính thấy đủ 6 món, màn hình nhỏ vuốt ngang bên trong hàng (trang không cuộn ngang).
const ROW =
  '-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden';
const DISH = 'w-40 shrink-0 snap-start sm:w-48 lg:w-auto';

function DishesSkeleton() {
  return (
    <BoneGroup className={ROW}>
      {Array.from({ length: DISH_COUNT }, (_, index) => (
        <div key={index} className={DISH}>
          <Bone className="aspect-square" />
          <Bone className="mt-3 h-11" />
        </div>
      ))}
    </BoneGroup>
  );
}

// Vài món trong thực đơn; bấm một món thì mở thực đơn ở đúng loại của món đó.
export default function EatInYourRoom() {
  return (
    <HomeSection
      title="Eat in your room"
      to="/food"
      linkLabel="View the menu"
      load={() => getMenuItems({ limit: DISH_COUNT })}
      skeleton={<DishesSkeleton />}
    >
      {({ menuItems }) => {
        if (menuItems.length === 0) return <EmptyState title="No dishes available right now" />;
        return (
          <ul className={ROW}>
            {menuItems.map((item) => (
              <li key={item.id} className={DISH}>
                <Link
                  to={`/food${toQueryString({ category: item.category })}`}
                  className="group block rounded-panel"
                >
                  <PhotoFrame src={item.image_url} alt="" className="aspect-square" />
                  <p className="mt-3 font-medium break-words text-ink transition-colors duration-150 group-hover:text-sea">
                    {item.name}
                  </p>
                  <Price amount={item.price} size="sm" className="mt-1 block" />
                </Link>
              </li>
            ))}
          </ul>
        );
      }}
    </HomeSection>
  );
}
