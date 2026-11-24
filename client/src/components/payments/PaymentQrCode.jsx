import { useEffect, useState } from 'react';
import { DEMO_QR_NOTE } from '../../config/payments.js';

// margin 4: vùng trắng quanh mã đúng chuẩn QR, để máy quét đọc được. Mã luôn đen trên trắng.
const QR_OPTIONS = {
  width: 416,
  margin: 4,
  errorCorrectionLevel: 'M',
  color: { dark: '#000000', light: '#ffffff' },
};

// Mã QR giả lập (thư viện qrcode, chỉ tải khi cần vẽ mã). text là chuỗi demo, không phải link ngân hàng thật,
// ví dụ "SHC-DEMO-PAY|food_order|12|42|150000" (xem toDemoQrText).
export default function PaymentQrCode({ text }) {
  const [result, setResult] = useState({ text: null, url: '' });

  useEffect(() => {
    let active = true;
    import('qrcode')
      .then((module) => module.default.toDataURL(text, QR_OPTIONS))
      .then((url) => {
        if (active) setResult({ text, url });
      })
      .catch(() => {
        if (active) setResult({ text, url: '' });
      });
    return () => {
      active = false;
    };
  }, [text]);

  const done = result.text === text;

  return (
    <figure className="flex w-56 shrink-0 flex-col items-center gap-2">
      <div className="flex size-56 items-center justify-center rounded-panel border border-line bg-white">
        {done && result.url ? (
          <img src={result.url} alt="Demo payment QR code" width="208" height="208" className="size-52" />
        ) : (
          <span className="px-4 text-center text-sm text-ink-soft">
            {done ? 'The QR code could not be loaded. Reload the page.' : 'Loading QR code...'}
          </span>
        )}
      </div>
      <figcaption className="text-center text-xs text-ink-soft">{DEMO_QR_NOTE}</figcaption>
    </figure>
  );
}
