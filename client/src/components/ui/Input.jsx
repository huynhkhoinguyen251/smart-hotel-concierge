import { useId } from 'react';
import { Input as AntInput } from 'antd';
import DateInput from './DateInput.jsx';
import Field from './Field.jsx';

const DATE_TYPES = ['date', 'datetime-local'];

// Ô nhập có nhãn, gợi ý (hint) và dòng báo lỗi. Các thuộc tính khác chuyển thẳng cho ô nhập.
// type date và datetime-local dùng DatePicker, nhưng vẫn nhận và trả chuỗi như <input> gốc.
export default function Input({ label, error, hint, id, type = 'text', className = '', ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  const message = error || hint;
  const control = {
    id: inputId,
    'aria-invalid': Boolean(error),
    'aria-describedby': message ? `${inputId}-message` : undefined,
    status: error ? 'error' : undefined,
    ...props,
  };

  const renderControl = () => {
    if (DATE_TYPES.includes(type)) return <DateInput {...control} withTime={type === 'datetime-local'} />;
    if (type === 'password') return <AntInput.Password {...control} />;
    return <AntInput {...control} type={type} />;
  };

  return (
    <Field id={inputId} label={label} message={message} error={error} className={className}>
      {renderControl()}
    </Field>
  );
}
