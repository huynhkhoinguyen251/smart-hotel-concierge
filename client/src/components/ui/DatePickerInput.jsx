import { useLayoutEffect, useRef } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { DATE_DISPLAY, DATE_PLACEHOLDERS, isTouchScreen } from '../../utils/dateText.js';

// Định dạng trao đổi với form và backend, giống <input type="date"> và "datetime-local".
const DATE_VALUE = 'YYYY-MM-DD';
const DATETIME_VALUE = 'YYYY-MM-DDTHH:mm';

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

// Gõ lại chữ người dùng đã gõ dở trong ô tạm (xem DateInput), như thể họ gõ thẳng vào ô này.
const retype = (input, text) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

// Phần DatePicker của DateInput, nằm ở file riêng vì antd picker và dayjs khá nặng.
// draft: chữ gõ dở trong ô tạm; autoFocus: ô tạm đang có con trỏ lúc file này tải xong.
// Ô chọn ngày (hoặc ngày giờ) của Input. value, min, max là chuỗi; onChange nhận { target: { name, value } }.
// - Chọn ngày: báo thay đổi khi chọn xong.
// - Chọn ngày giờ: báo ngay mỗi lần chọn ngày hoặc giờ (như ô gốc), nên bấm ra ngoài không mất lựa chọn.
//   Nếu giờ vừa chọn nằm ngoài khoảng cho phép của ngày đầu/cuối thì lấy giờ gần nhất còn hợp lệ.
export default function DatePickerInput({
  withTime,
  id,
  name,
  value,
  min,
  max,
  onChange,
  disabled,
  status,
  placeholder,
  draft,
  autoFocus,
  ...props
}) {
  const rootRef = useRef(null);
  const valueFormat = withTime ? DATETIME_VALUE : DATE_VALUE;
  const minDate = parse(min);
  const maxDate = parse(max);

  // Chỉ chạy một lần khi ô này thay chỗ ô tạm.
  useLayoutEffect(() => {
    const input = rootRef.current?.nativeElement?.querySelector('input');
    if (!input) return undefined;
    if (autoFocus) input.focus();
    if (!draft) return undefined;
    // Chờ DatePicker xử lý xong việc nhận con trỏ, vì lúc đó nó đặt lại chữ trong ô.
    const timer = setTimeout(() => retype(input, draft), 50);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      ref={rootRef}
      id={id}
      name={name}
      className="w-full"
      value={parse(value)}
      minDate={minDate ?? undefined}
      maxDate={maxDate ?? undefined}
      format={withTime ? DATE_DISPLAY.datetime : DATE_DISPLAY.date}
      placeholder={placeholder ?? (withTime ? DATE_PLACEHOLDERS.datetime : DATE_PLACEHOLDERS.date)}
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
