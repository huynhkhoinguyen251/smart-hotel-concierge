import { RECEPTION_LABEL } from '../../config/support.js';
import formatDate from '../../utils/formatDate.js';

// Một tin nhắn dạng bong bóng chat.
// - isOwn: nằm bên phải, màu xanh (phía người đang xem).
// - label: nhãn phía trên bong bóng. Không truyền thì dùng cách của khách: tin của lễ tân (admin)
//   có nhãn "Reception · tên", tin của chính mình không có nhãn. Truyền null để ẩn nhãn.
// - footerPrefix: chữ trước ngày giờ; mặc định "You · " cho tin của chính mình.
// whitespace-pre-line giữ xuống dòng; wrap-anywhere ngắt cả từ rất dài, nên không tràn ngang.
export default function ChatMessage({ message, isOwn, label, footerPrefix }) {
  const isReception = message.sender?.role === 'admin';
  const defaultLabel = isOwn
    ? null
    : isReception
      ? `${RECEPTION_LABEL} · ${message.sender.full_name}`
      : message.sender?.full_name;
  const shownLabel = label === undefined ? defaultLabel : label;
  const prefix = footerPrefix ?? (isOwn ? 'You · ' : '');

  return (
    <li className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      {shownLabel && <p className="mb-1 px-1 text-xs font-semibold text-slate-600">{shownLabel}</p>}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line wrap-anywhere sm:max-w-[75%] ${
          isOwn
            ? 'rounded-br-sm bg-teal-700 text-white'
            : isReception
              ? 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
              : 'rounded-bl-sm bg-slate-100 text-slate-800'
        }`}
      >
        {message.message}
      </div>
      <p className="mt-1 px-1 text-xs text-slate-500">
        {prefix}
        {formatDate(message.created_at, { withTime: true })}
      </p>
    </li>
  );
}
