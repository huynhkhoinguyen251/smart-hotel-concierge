import { RECEPTION_LABEL } from '../../config/support.js';
import formatDate from '../../utils/formatDate.js';

// Một tin nhắn dạng bong bóng chat. Tin của chính mình nằm bên phải;
// tin của lễ tân (admin) nằm bên trái, có nhãn "Reception" và tên người trả lời.
// whitespace-pre-line giữ xuống dòng; wrap-anywhere ngắt cả từ rất dài, nên không tràn ngang.
export default function ChatMessage({ message, isOwn }) {
  const isReception = message.sender?.role === 'admin';
  const senderLabel = isReception
    ? `${RECEPTION_LABEL} · ${message.sender.full_name}`
    : message.sender?.full_name;

  return (
    <li className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && <p className="mb-1 px-1 text-xs font-semibold text-slate-600">{senderLabel}</p>}
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
        {isOwn ? 'You · ' : ''}
        {formatDate(message.created_at, { withTime: true })}
      </p>
    </li>
  );
}
