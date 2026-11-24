import RoomImage from '../rooms/RoomImage.jsx';

// Khung ảnh có tỉ lệ cố định (đặt bằng className, ví dụ "aspect-[4/3]").
// Nằm trong một phần tử có lớp "group" thì ảnh phóng nhẹ khi rê chuột.
export default function PhotoFrame({ src, alt, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-panel bg-sea-tint ${className}`}>
      <RoomImage
        src={src}
        alt={alt}
        className="absolute inset-0 size-full transition-transform duration-300 ease-out group-hover:scale-[1.025]"
      />
    </div>
  );
}
