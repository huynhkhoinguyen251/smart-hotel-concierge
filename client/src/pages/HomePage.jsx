import AroundDaNang from '../components/home/AroundDaNang.jsx';
import DuringYourStay from '../components/home/DuringYourStay.jsx';
import EatInYourRoom from '../components/home/EatInYourRoom.jsx';
import HomeHero from '../components/home/HomeHero.jsx';
import TopRatedRooms from '../components/home/TopRatedRooms.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

// Trang chủ: ảnh lớn kèm khung tìm phòng, rồi bốn phần, mỗi phần một cách trình bày.
export default function HomePage() {
  usePageTitle('Home');
  return (
    <div className="pb-20 lg:pb-28">
      <HomeHero />
      <TopRatedRooms />
      <DuringYourStay />
      <EatInYourRoom />
      <AroundDaNang />
    </div>
  );
}
