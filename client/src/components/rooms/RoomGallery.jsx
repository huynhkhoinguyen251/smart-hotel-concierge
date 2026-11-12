import { useState } from 'react';
import RoomImage from './RoomImage.jsx';

// Ảnh lớn ở trên, ảnh nhỏ bấm được ở dưới. Backend đã xếp ảnh chính lên đầu.
export default function RoomGallery({ images, alt }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = images[selectedIndex] ?? images[0];

  return (
    <div>
      <RoomImage
        src={selected?.image_url}
        alt={alt}
        className="aspect-[16/10] w-full rounded-2xl"
      />
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5" aria-label="Room photos">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === selectedIndex ? 'true' : undefined}
                className={`block w-full overflow-hidden rounded-lg border-2 transition ${
                  index === selectedIndex
                    ? 'border-teal-600'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <RoomImage src={image.image_url} alt="" className="aspect-[4/3] w-full" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
