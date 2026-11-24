import { lazy, Suspense, useState } from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import { Input as AntInput } from 'antd';
import { DATE_PLACEHOLDERS, isTouchScreen, parseDateText, toDateText } from '../../utils/dateText.js';

// antd picker và dayjs nặng hơn 100 KB, nên chỉ tải khi trang có ô chọn ngày.
const DatePickerInput = lazy(() => import('./DatePickerInput.jsx'));

// Ô chọn ngày (hoặc ngày giờ) của Input. value, min, max là chuỗi; onChange nhận { target: { name, value } }.
// Trong lúc DatePicker đang tải, một ô nhập cùng kích thước, id, nhãn và chữ gợi ý đứng thay chỗ, nên trang
// không bị giật. Ngày có sẵn vẫn hiện; ngày gõ đủ được nhận ngay, chữ gõ dở được chuyển sang DatePicker.
export default function DateInput({ withTime, id, name, value, min, max, onChange, disabled, status, placeholder, ...props }) {
  // null: chưa gõ gì, ô hiện ngày đang chọn.
  const [draft, setDraft] = useState(null);
  const [focused, setFocused] = useState(false);
  const hint = placeholder ?? (withTime ? DATE_PLACEHOLDERS.datetime : DATE_PLACEHOLDERS.date);

  const handleType = (event) => {
    const text = event.target.value;
    setDraft(text);
    const next = text.trim() ? parseDateText(text, { withTime, min, max }) : '';
    if (next === null || next === (value ?? '')) return;
    const target = { id, name, value: next };
    onChange?.({ type: 'change', target, currentTarget: target });
  };

  const shared = { ...props, id, name, disabled, status };
  return (
    <Suspense
      fallback={
        <AntInput
          {...shared}
          className="w-full"
          placeholder={hint}
          value={draft ?? toDateText(value)}
          onChange={handleType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          readOnly={isTouchScreen()}
          autoComplete="off"
          suffix={<CalendarOutlined aria-hidden="true" className="text-ink-faint" />}
        />
      }
    >
      <DatePickerInput
        {...shared}
        withTime={withTime}
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        placeholder={hint}
        autoFocus={focused}
        // Chữ đã thành ngày thì nằm trong value; chỉ chuyển phần còn gõ dở.
        draft={focused && draft && parseDateText(draft, { withTime, min, max }) === null ? draft : ''}
      />
    </Suspense>
  );
}
