import { getStayDateLimits, getStayOrderError, guestOptions } from '../../utils/stayDates.js';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';

// Ba ô: ngày nhận phòng, ngày trả phòng, số khách (tối đa bằng sức chứa của phòng).
// values: { check_in, check_out, guests }; onChange(name, value).
// error: lỗi ngày thêm từ trang cha; lỗi thứ tự ngày được báo ngay tại đây.
export default function StayFields({ values, capacity, onChange, error, disabled = false }) {
  const { checkInMin, checkOutMin } = getStayDateLimits(values.check_in);
  const dateError = getStayOrderError(values) || error;
  const handleChange = (event) => onChange(event.target.name, event.target.value);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Check-in"
        name="check_in"
        type="date"
        min={checkInMin}
        value={values.check_in}
        onChange={handleChange}
        disabled={disabled}
        hint="Check-in from 14:00"
      />
      <Input
        label="Check-out"
        name="check_out"
        type="date"
        min={checkOutMin}
        value={values.check_out}
        onChange={handleChange}
        disabled={disabled}
        error={dateError}
      />
      <Select
        label="Guests"
        name="guests"
        value={values.guests}
        onChange={handleChange}
        disabled={disabled}
        options={guestOptions(capacity)}
        className="sm:col-span-2"
      />
    </div>
  );
}
