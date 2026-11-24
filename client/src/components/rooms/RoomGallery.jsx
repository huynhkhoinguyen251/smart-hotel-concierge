import { useState } from 'react';
import { ExpandOutlined } from '@ant-design/icons';
import { Image } from 'antd';
import getImageUrl from '../../utils/getImageUrl.js';
import PhotoFrame from '../ui/PhotoFrame.jsx';

// Số ảnh nhìn thấy trong bảng ảnh; các ảnh còn lại xem trong chế độ phóng to.
const MAX_TILES = 5;

// Cách xếp trên màn hình từ 640px theo số ảnh: ảnh chính luôn lớn nhất.
// 2 ảnh: một rộng, một cao, bằng chiều cao nhau. 3 ảnh: hai ảnh nhỏ xếp chồng. 4–5 ảnh: lưới nhỏ bên phải.
const GRIDS = {
  1: 'sm:grid-cols-1 sm:grid-rows-1',
  2: 'sm:grid-cols-[2fr_1fr] sm:grid-rows-1',
  3: 'sm:grid-cols-[2fr_1fr] sm:grid-rows-2',
  4: 'sm:grid-cols-[2fr_1fr_1fr] sm:grid-rows-2',
  5: 'sm:grid-cols-[2fr_1fr_1fr] sm:grid-rows-2',
};

// Nền tối gần kín khi phóng to, để ảnh và các nút điều khiển rõ trên mọi trang.
const PREVIEW_CLASS_NAMES = { popup: { mask: 'bg-ink/92!' } };

const getTileClass = (index, count) => {
  if (index === 0) return count > 2 ? 'sm:row-span-2' : '';
  // 4 ảnh: ảnh thứ hai chiếm cả hàng trên của khối bên phải.
  return count === 4 && index === 1 ? 'sm:col-span-2' : '';
};

// Bảng ảnh của phòng. Bấm một ảnh để phóng to (antd Image preview). Backend đã xếp ảnh chính lên đầu.
// Trên điện thoại các ảnh nằm trên một hàng vuốt ngang; ảnh sau ló ra để biết còn ảnh.
export default function RoomGallery({ images, alt }) {
  const [preview, setPreview] = useState({ open: false, current: 0 });
  const count = Math.min(images.length, MAX_TILES);

  if (count === 0) {
    return <PhotoFrame src={null} alt={alt} className="aspect-[4/3] sm:aspect-[21/9]" />;
  }

  return (
    <div className="relative">
      <ul
        aria-label="Room photos"
        className={`-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:h-[clamp(20rem,36vw,30rem)] sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden ${GRIDS[count]}`}
      >
        {images.slice(0, MAX_TILES).map((image, index) => (
          <li
            key={image.id}
            className={`min-h-0 min-w-0 shrink-0 snap-start ${count > 1 ? 'w-[86%]' : 'w-full'} sm:w-auto ${getTileClass(index, count)}`}
          >
            <button
              type="button"
              onClick={() => setPreview({ open: true, current: index })}
              aria-label={`Show photo ${index + 1}`}
              className="group block size-full cursor-zoom-in rounded-panel"
            >
              <PhotoFrame
                src={image.image_url}
                alt={index === 0 ? alt : ''}
                className="aspect-[4/3] sm:aspect-auto sm:h-full"
              />
            </button>
          </li>
        ))}
      </ul>

      {images.length > 1 && (
        <button
          type="button"
          onClick={() => setPreview({ open: true, current: 0 })}
          className="absolute bottom-3 left-3 flex h-10 sm:right-3 sm:left-auto items-center gap-2 rounded-control bg-white px-4 text-sm font-semibold text-ink hover:text-sea"
        >
          <ExpandOutlined aria-hidden="true" />
          View {images.length} photos
        </button>
      )}

      <Image.PreviewGroup
        classNames={PREVIEW_CLASS_NAMES}
        items={images.map((image, index) => ({
          src: getImageUrl(image.image_url),
          alt: `${alt}, photo ${index + 1}`,
        }))}
        preview={{
          open: preview.open,
          current: preview.current,
          onOpenChange: (open) => setPreview((state) => ({ ...state, open })),
          onChange: (current) => setPreview((state) => ({ ...state, current })),
        }}
      />
    </div>
  );
}
