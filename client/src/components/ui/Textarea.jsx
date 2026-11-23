import { useId } from 'react';
import { Input as AntInput } from 'antd';
import Field from './Field.jsx';

// Ô nhập nhiều dòng, cùng kiểu với Input. Có maxLength thì hiện bộ đếm ký tự "120/1000".
export default function Textarea({ label, error, hint, id, maxLength, value = '', className = '', ...props }) {
  const autoId = useId();
  const textareaId = id || autoId;
  const message = error || hint;
  const counter = maxLength ? (
    <p className="shrink-0 text-ink-soft" aria-live="polite">
      {value.length}/{maxLength}
    </p>
  ) : null;

  return (
    <Field id={textareaId} label={label} message={message} error={error} aside={counter} className={className}>
      <AntInput.TextArea
        id={textareaId}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={message ? `${textareaId}-message` : undefined}
        status={error ? 'error' : undefined}
        {...props}
      />
    </Field>
  );
}
