import { useEffect, useState } from 'react';
import { formatCountdown } from '../utils/paymentHelpers.js';

const makeTimer = (seconds) => ({
  source: seconds,
  end: seconds === null || seconds === undefined ? null : Date.now() + Number(seconds) * 1000,
});

// Đồng hồ đếm ngược từ seconds_left của server. Server là nguồn đúng: giờ kết thúc được tính một lần
// bằng Date.now() khi nhận giá trị mới, đồng hồ máy chỉ dùng để đếm lùi mỗi giây.
// seconds null: không đếm. Trả { secondsLeft, expired, label "mm:ss" }.
export default function useCountdown(seconds) {
  const [timer, setTimer] = useState(() => makeTimer(seconds));
  // Có seconds_left mới (ví dụ sau khi tải lại đơn) thì đếm lại từ đầu.
  if (timer.source !== seconds) {
    setTimer(makeTimer(seconds));
  }
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (timer.end === null) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer.end]);

  if (timer.end === null) {
    return { secondsLeft: null, expired: false, label: '' };
  }
  // Không vượt quá giá trị server vừa gửi (now có thể cũ hơn lúc tính giờ kết thúc).
  const secondsLeft = Math.min(Number(timer.source), Math.max(0, Math.ceil((timer.end - now) / 1000)));
  return { secondsLeft, expired: secondsLeft === 0, label: formatCountdown(secondsLeft) };
}
