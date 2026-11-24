import RoomSearchForm from '../rooms/RoomSearchForm.jsx';

// Ảnh lớn đầu trang chủ. Chữ nằm trên vùng biển, trên một mảng mực phẳng kéo dài tới mép trái màn hình
// (độ tương phản của chữ trắng luôn trên 4.5:1). Khung tìm phòng nằm ở đáy ảnh.
export default function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-sea">
      <img
        src="/images/hero-my-khe.jpg"
        alt="My Khe beach in Da Nang seen from above"
        width="1920"
        height="1280"
        fetchPriority="high"
        className="absolute inset-0 -z-10 size-full object-cover object-[22%_50%] md:object-[50%_28%]"
      />
      <div className="shell flex min-h-[42rem] flex-col justify-between gap-10 pt-24 pb-4 md:min-h-[max(70vh,36rem)] md:pt-[max(4rem,9vh)] md:pb-8">
        <div className="relative max-w-lg py-6 pr-6 text-white before:absolute before:inset-y-0 before:right-0 before:-left-[100vw] before:-z-10 before:bg-ink/70 before:content-[''] md:max-w-xl md:py-8 md:pr-8">
          <h1 className="text-display font-bold tracking-tight">Your stay in Da&nbsp;Nang, in one place</h1>
          <p className="mt-3 max-w-lg text-base text-pretty md:text-lg">
            Book your room, hotel services, food and local tours without calling the front desk.
          </p>
        </div>
        <RoomSearchForm />
      </div>
    </section>
  );
}
