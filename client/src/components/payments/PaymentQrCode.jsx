import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { DEMO_QR_NOTE } from '../../config/payments.js';

// Mã QR giả lập (thư viện qrcode). text là chuỗi demo, không phải link ngân hàng thật,
// ví dụ "SHC-DEMO-PAY|food_order|12|42|150000" (xem toDemoQrText).
export default function PaymentQrCode({ text }) {
  const [result, setResult] = useState({ text: null, url: '' });

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(text, { width: 240, margin: 1, errorCorrectionLevel: 'M' })
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

  const ready = result.text === text && result.url;

  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 sm:h-48 sm:w-48">
        {ready ? (
          <img src={result.url} alt="Demo payment QR code" className="h-full w-full" />
        ) : (
          <span className="text-xs text-slate-400">Loading QR code...</span>
        )}
      </div>
      <figcaption className="text-center text-xs text-slate-500">{DEMO_QR_NOTE}</figcaption>
    </figure>
  );
}
