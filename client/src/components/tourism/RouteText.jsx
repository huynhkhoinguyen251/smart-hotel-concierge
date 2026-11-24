import { ArrowRightOutlined } from '@ant-design/icons';

// Tuyến đường: điểm đón, mũi tên, điểm trả. Trình đọc màn hình đọc "to" thay cho mũi tên.
export default function RouteText({ from, to }) {
  return (
    <>
      {from} <ArrowRightOutlined aria-hidden="true" className="text-xs text-ink-soft" />
      <span className="sr-only">to</span> {to}
    </>
  );
}
