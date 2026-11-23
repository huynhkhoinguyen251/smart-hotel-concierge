import { DatePicker } from 'antd';
import dayjs from 'dayjs';

// Định dạng trao đổi với form và backend, giống <input type="date"> và "datetime-local".
const DATE_VALUE = 'YYYY-MM-DD';
const DATETIME_VALUE = 'YYYY-MM-DDTHH:mm';
// Định dạng hiển thị: tháng bằng chữ để không nhầm ngày với tháng. Người dùng cũng gõ được dạng thứ hai.
const DATE_DISPLAY = ['D MMM YYYY', 'YYYY-MM-DD'];
const DATETIME_DISPLAY = ['D MMM YYYY, HH:mm', 'YYYY-MM-DD HH:mm'];

// Màn hình cảm ứng: không mở bàn phím ảo, chỉ chọn trên lịch.
const isTouchScreen = () => Boolean(globalThis.matchMedia?.('(pointer: coarse)').matches);

const parse = (value) => {
  const date = value ? dayjs(value) : null;
  return date?.isValid() ? date : null;
};

// Các số nguyên từ start đến trước end, dùng để khóa giờ và phút.
const range = (start, end) => Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index);

// Khóa các giờ, phút ngoài khoảng cho phép của đúng ngày đầu hoặc ngày cuối.
const getDisabledTime = (min, max) => (date) => {
  const onMinDay = Boolean(date && min && date.isSame(min, 'day'));
  const onMaxDay = Boolean(date && max && date.isSame(max, 'day'));
  return {
    disabledHours: () => [
      ...(onMinDay ? range(0, min.hour()) : []),
      ...(onMaxDay ? range(max.hour() + 1, 24) : []),
    ],
    disabledMinutes: (hour) => [
      ...(onMinDay && hour === min.hour() ? range(0, min.minute()) : []),
      ...(onMaxDay && hour === max.hour() ? range(max.minute() + 1, 60) : []),
    ],
  };
};

// Ô chọn ngày (hoặc ngày giờ) của Input. value, min, max là chuỗi; onChange nhận { target: { name, value } }.
// - Chọn ngày: báo thay đổi khi chọn xong.
// - Chọn ngày giờ: báo ngay mỗi lần chọn ngày hoặc giờ (như ô gốc), nên bấm ra ngoài không mất lựa chọn.
//   Nếu giờ vừa chọn nằm ngoài khoảng cho phép của ngày đầu/cuối thì lấy giờ gần nhất còn hợp lệ.
export default function DateInput({ withTime, id, name, value, min, max, onChange, disabled, status, placeholder, ...props }) {
  const valueFormat = withTime ? DATETIME_VALUE : DATE_VALUE;
  const minDate = parse(min);
  const maxDate = parse(max);

  const emit = (date) => {
    const next = date ? date.format(valueFormat) : '';
    if (next === (value ?? '')) return;
    const target = { id, name, value: next };
    onChange?.({ type: 'change', target, currentTarget: target });
  };

  const emitInRange = (date) => {
    if (!date || !date.isValid()) return;
    if ((minDate && date.isBefore(minDate, 'day')) || (maxDate && date.isAfter(maxDate, 'day'))) return;
    if (minDate && date.isBefore(minDate)) emit(minDate);
    else if (maxDate && date.isAfter(maxDate)) emit(maxDate);
    else emit(date);
  };

  const timeProps = withTime
    ? {
        showNow: false,
        showTime: {
          format: 'HH:mm',
          defaultOpenValue: dayjs().startOf('day').hour(12),
          disabledTime: getDisabledTime(minDate, maxDate),
        },
        onCalendarChange: emitInRange,
      }
    : {};

  return (
    <DatePicker
      {...props}
      {...timeProps}
      id={id}
      name={name}
      className="w-full"
      value={parse(value)}
      minDate={minDate ?? undefined}
      maxDate={maxDate ?? undefined}
      format={withTime ? DATETIME_DISPLAY : DATE_DISPLAY}
      placeholder={placeholder ?? (withTime ? 'Select date and time' : 'Select date')}
      onChange={emit}
      disabled={disabled}
      status={status}
      inputReadOnly={isTouchScreen()}
      autoComplete="off"
      // Ô nhập chỉ hiện giá trị đã chọn, không hiện thử giá trị đang rê chuột qua.
      previewValue={false}
    />
  );
}
