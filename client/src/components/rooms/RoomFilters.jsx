import { useState } from 'react';
import { getPriceErrors, SORT_OPTIONS } from '../../utils/roomFilters.js';
import {
  getStayDateLimits,
  getStayDatesError,
  getStayOrderError,
  guestOptions,
} from '../../utils/stayDates.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';

const GUEST_OPTIONS = [{ value: '', label: 'Any' }, ...guestOptions(10)];

// Bộ lọc của trang /rooms. initialFilters lấy từ địa chỉ trang; bộ lọc chỉ được áp dụng khi
// bấm Apply. Trang cha gắn key theo địa chỉ, nên khi bấm Back form tự điền lại giá trị mới.
export default function RoomFilters({ initialFilters, roomTypes, amenities, catalogError, onApply, onClear }) {
  const [form, setForm] = useState(initialFilters);
  const [errors, setErrors] = useState({});

  const { checkInMin, checkOutMin } = getStayDateLimits(form.check_in);
  const dateError = getStayOrderError(form) || errors.dates;

  const roomTypeOptions = [
    { value: '', label: 'All room types' },
    ...roomTypes.map((type) => ({ value: String(type.id), label: type.name })),
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    const errorKey = name === 'check_in' || name === 'check_out' ? 'dates' : name;
    setErrors((current) => ({ ...current, [errorKey]: '' }));
  };

  const toggleAmenity = (id) => {
    setForm((current) => ({
      ...current,
      amenity_ids: current.amenity_ids.includes(id)
        ? current.amenity_ids.filter((item) => item !== id)
        : [...current.amenity_ids, id],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = { ...getPriceErrors(form) };
    const datesError = getStayDatesError(form);
    if (datesError) nextErrors.dates = datesError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onApply(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Room filters" className="space-y-5">
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold text-slate-900">Dates</legend>
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
      </fieldset>

      <Select label="Guests" name="guests" value={form.guests} onChange={handleChange} options={GUEST_OPTIONS} />

      <Select
        label="Room type"
        name="room_type_id"
        value={form.room_type_id}
        onChange={handleChange}
        options={roomTypeOptions}
      />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-900">Price per night (VND)</legend>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min"
            name="min_price"
            type="number"
            min="0"
            step="any"
            inputMode="numeric"
            placeholder="0"
            value={form.min_price}
            onChange={handleChange}
            error={errors.min_price}
          />
          <Input
            label="Max"
            name="max_price"
            type="number"
            min="0"
            step="any"
            inputMode="numeric"
            placeholder="Any"
            value={form.max_price}
            onChange={handleChange}
            error={errors.max_price}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-900">Amenities</legend>
        {catalogError && <p className="text-xs text-red-600">Could not load amenities.</p>}
        <div className="space-y-2">
          {amenities.map((amenity) => {
            const id = String(amenity.id);
            return (
              <label key={id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.amenity_ids.includes(id)}
                  onChange={() => toggleAmenity(id)}
                  className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                />
                {amenity.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Select label="Sort by" name="sort" value={form.sort} onChange={handleChange} options={SORT_OPTIONS} />

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Apply
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}
