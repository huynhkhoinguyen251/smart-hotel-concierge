import { useId } from 'react';
import { Select as AntSelect } from 'antd';
import Field from './Field.jsx';

// Cho phép mô tả dài (ví dụ đơn đặt phòng kèm ngày) xuống dòng trong danh sách chọn.
const CLASS_NAMES = { popup: { listItem: '[&_.ant-select-item-option-content]:whitespace-normal' } };

// w-0 min-w-full: rộng bằng khung chứa, nhưng nội dung dài không kéo khung chứa rộng ra (375px).
// Ô chọn có nhãn và dòng báo lỗi, cùng kiểu với Input.
// options: [{ value, label }]. Giống <select> gốc: value là chuỗi, onChange nhận { target: { name, value } },
// và value không có trong options thì hiện lựa chọn đầu tiên.
export default function Select({ label, error, id, name, options, value, onChange, className = '', ...props }) {
  const autoId = useId();
  const selectId = id || autoId;
  const items = options.map((option) => ({ ...option, value: String(option.value) }));
  const current = String(value ?? '');
  const selected = items.some((item) => item.value === current) ? current : items[0]?.value;

  const handleChange = (next) => {
    const target = { id: selectId, name, value: next };
    onChange?.({ type: 'change', target, currentTarget: target });
  };

  return (
    <Field id={selectId} label={label} message={error} error={error} className={className}>
      <AntSelect
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-message` : undefined}
        status={error ? 'error' : undefined}
        className="w-0 min-w-full"
        classNames={CLASS_NAMES}
        virtual={false}
        options={items}
        value={selected}
        onChange={handleChange}
        {...props}
      />
    </Field>
  );
}
