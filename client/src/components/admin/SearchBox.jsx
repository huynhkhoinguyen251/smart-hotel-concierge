import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

// Ô tìm kiếm có nút Search. Giá trị đang gõ giữ trong state; bấm Search mới gọi onSearch
// (trang cha đưa giá trị lên địa chỉ trang). Trang cha gắn key theo giá trị trên địa chỉ trang,
// nên Back/Forward cũng cập nhật ô nhập.
export default function SearchBox({ label, value, onSearch, maxLength, placeholder, className = 'w-full sm:w-44' }) {
  const [text, setText] = useState(value);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(text.trim());
      }}
      role="search"
      className="flex w-full items-end gap-2 sm:w-auto"
    >
      <Input
        label={label}
        type="search"
        value={text}
        maxLength={maxLength}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}
