import { useEffect, useId, useRef, useState } from 'react';
import { Input as AntInput } from 'antd';
import { validateVoucher } from '../../api/vouchers.api.js';
import { MAX_VOUCHER_CODE_LENGTH, normalizeVoucherCode, VOUCHER_CODE_PATTERN } from '../../config/vouchers.js';
import formatCurrency from '../../utils/formatCurrency.js';
import Button from '../ui/Button.jsx';

const CODE_ERROR = 'Use letters, numbers, "-" or "_" only';

// Ô "Voucher code" và nút "Apply". Gọi POST /vouchers/validate với tạm tính hiện tại.
// - subtotal: tạm tính (null khi chưa tính được, ví dụ chưa chọn ngày) → không áp dụng được.
// - applied: kết quả đang áp dụng ({ code, discount_amount, total_after_discount, ... }) hoặc null.
// - onChange(applied | null): báo cho form cha mã đang dùng.
// Tạm tính đổi (ngày, số khách, giỏ hàng) thì tự kiểm tra lại; không còn hợp lệ thì gỡ mã và báo lý do.
export default function VoucherInput({ subtotal, applied, onChange, disabled = false }) {
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  // Chỉ nhận kết quả của lần kiểm tra mới nhất.
  const requestRef = useRef(0);
  const ready = subtotal !== null && subtotal !== undefined && subtotal > 0;

  const check = async (code, amount) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setChecking(true);
    try {
      const result = await validateVoucher({ code, amount });
      if (requestRef.current === requestId) {
        setError('');
        onChange(result);
      }
    } catch (apiError) {
      if (requestRef.current === requestId) {
        onChange(null);
        setError(apiError.message);
      }
      return false;
    } finally {
      if (requestRef.current === requestId) setChecking(false);
    }
    return true;
  };

  // Tạm tính đổi khi đang có mã: kiểm tra lại với số tiền mới.
  const appliedCode = applied?.code ?? '';
  useEffect(() => {
    if (!appliedCode || !ready) return;
    let active = true;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    validateVoucher({ code: appliedCode, amount: subtotal })
      .then((result) => {
        if (active && requestRef.current === requestId) onChange(result);
      })
      .catch((apiError) => {
        if (active && requestRef.current === requestId) {
          onChange(null);
          setText(appliedCode);
          setError(`${appliedCode} was removed: ${apiError.message}`);
        }
      });
    return () => {
      active = false;
    };
    // Chỉ chạy khi tạm tính đổi; onChange là hàm mới mỗi lần render.
  }, [subtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = async () => {
    const code = normalizeVoucherCode(text);
    if (!code) {
      setError('Enter a voucher code');
      return;
    }
    if (!VOUCHER_CODE_PATTERN.test(code)) {
      setError(CODE_ERROR);
      return;
    }
    if (await check(code, subtotal)) setText('');
  };

  const handleRemove = () => {
    requestRef.current += 1;
    onChange(null);
    setError('');
  };

  if (applied) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-success-tint px-3 py-2 text-sm text-success-deep" role="status">
        <span>
          <span className="font-semibold">{applied.code}</span> applied: −{formatCurrency(applied.discount_amount)}
        </span>
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          aria-label={`Remove voucher ${applied.code}`}
          className="font-semibold text-success-deep underline hover:no-underline disabled:opacity-60"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
        Voucher code (optional)
      </label>
      <div className="flex gap-2">
        <AntInput
          id={inputId}
          value={text}
          maxLength={MAX_VOUCHER_CODE_LENGTH}
          onChange={(event) => {
            setText(event.target.value);
            setError('');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (ready) handleApply();
            }
          }}
          placeholder="For example: WELCOME10"
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? messageId : undefined}
          disabled={disabled || checking}
          status={error ? 'error' : undefined}
          className="min-w-0 uppercase placeholder:normal-case"
        />
        <Button variant="secondary" loading={checking} disabled={disabled || !ready || !text.trim()} onClick={handleApply}>
          Apply
        </Button>
      </div>
      {error && (
        <p id={messageId} className="mt-1 text-xs text-danger" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
