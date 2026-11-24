import BackLink from '../ui/BackLink.jsx';
import Bone, { BoneGroup } from '../ui/Bone.jsx';
import Card from '../ui/Card.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';

const GRID = 'mt-4 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_24rem]';
const PHOTO = 'aspect-[4/3] sm:aspect-[16/9]';

export function OfferSkeleton() {
  return (
    <BoneGroup className="shell min-h-screen py-6">
      <Bone className="h-6 w-32" />
      <div className={GRID}>
        <div>
          <Bone className={PHOTO} />
          <Bone className="mt-6 h-10 w-80 max-w-full" />
          <Bone className="mt-4 h-5 w-44" />
        </div>
        <Bone className="h-96" />
      </div>
    </BoneGroup>
  );
}

// Trang chi tiết của một dịch vụ, tour hoặc chuyến xe: ảnh lớn và thông tin bên trái,
// một khung form bên phải (điện thoại: form nằm giữa thông tin và đánh giá).
export default function OfferLayout({
  backTo,
  backLabel,
  image,
  title,
  meta,
  price,
  unit,
  description,
  note,
  panelTitle,
  panel,
  reviews,
}) {
  return (
    <div className="shell pt-6 pb-12 lg:pb-16">
      <BackLink to={backTo}>{backLabel}</BackLink>

      <div className={GRID}>
        <article className="min-w-0 lg:col-start-1 lg:row-start-1">
          <PhotoFrame src={image} alt={title} className={PHOTO} />
          <h1 className="mt-6 text-3xl font-bold tracking-tight break-words text-ink sm:text-4xl">{title}</h1>
          {meta && <p className="mt-1.5 text-ink-soft">{meta}</p>}
          <p className="mt-4">
            <Price amount={price} unit={unit} size="lg" />
          </p>
          {description && <p className="mt-5 max-w-prose text-ink">{description}</p>}
          {note && <p className="mt-3 max-w-prose text-sm text-ink-soft">{note}</p>}
        </article>

        {/* Máy tính: cột phải kéo dài hết hai hàng để khung dính lại khi cuộn. */}
        <aside className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Card className="lg:sticky lg:top-24">
            <h2 className="mb-4 text-lg font-semibold text-ink">{panelTitle}</h2>
            {panel}
          </Card>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">{reviews}</div>
      </div>
    </div>
  );
}
