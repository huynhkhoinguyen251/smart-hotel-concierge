import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toQueryString } from '../../utils/queryString.js';
import {
  getStayDateLimits,
  getStayDatesError,
  getStayOrderError,
  guestOptions,
} from '../../utils/stayDates.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';

// Form tìm phòng ở trang chủ, nằm ở đáy ảnh lớn. Được để trống cả hai ngày để xem mọi phòng.
export default function RoomSearchForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ check_in: '', check_out: '', guests: '1' });
  const [submitError, setSubmitError] = useState('');

  const { checkInMin, checkOutMin } = getStayDateLimits(form.check_in);
  // Báo ngay khi ngày trả phòng không sau ngày nhận phòng; lỗi khác báo khi bấm tìm.
  const dateError = getStayOrderError(form) || submitError;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const error = getStayDatesError(form);
    if (error) {
      setSubmitError(error);
      return;
    }
    navigate(`/rooms${toQueryString(form)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Search rooms"
      className="grid grid-cols-2 gap-x-3 gap-y-4 rounded-panel bg-white p-4 md:grid-cols-[1fr_1fr_0.8fr_auto] md:items-start md:gap-4 md:p-5"
    >
      <Input
        label="Check-in"
        name="check_in"
        type="date"
        min={checkInMin}
        value={form.check_in}
        onChange={handleChange}
      />
      <Input
        label="Check-out"
        name="check_out"
        type="date"
        min={checkOutMin}
        value={form.check_out}
        onChange={handleChange}
        error={dateError}
      />
      <Select
        label="Guests"
        name="guests"
        value={form.guests}
        onChange={handleChange}
        options={guestOptions(10)}
        className="col-span-2 md:col-span-1"
      />
      <Button type="submit" className="col-span-2 md:col-span-1 md:mt-7 md:px-8">
        Search rooms
      </Button>
    </form>
  );
}
