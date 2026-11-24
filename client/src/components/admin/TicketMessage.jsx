import { RECEPTION_LABEL } from '../../config/support.js';
import formatDate from '../../utils/formatDate.js';

// Một tin nhắn nhìn từ phía admin: tin của lễ tân bên phải (của mình ghi "You"), tin của khách bên trái.
// whitespace-pre-line giữ xuống dòng; wrap-anywhere ngắt cả từ rất dài, nên không tràn ngang.
export default function TicketMessage({ message, currentUserId }) {
  const { sender } = message;
  const fromAdmin = sender?.role === 'admin';
  const isMe = sender?.id === currentUserId;
  const label = isMe ? 'You' : fromAdmin ? `${RECEPTION_LABEL} · ${sender.full_name}` : sender?.full_name;

  return (
    <li className={`flex flex-col ${fromAdmin ? 'items-end' : 'items-start'}`}>
      <p className="mb-1 flex max-w-full flex-wrap gap-x-2 text-xs text-ink-soft">
        <span className="font-semibold wrap-anywhere text-ink">{label}</span>
        {formatDate(message.created_at, { withTime: true })}
      </p>
      <div
        className={`max-w-[min(90%,38rem)] rounded-panel px-4 py-3 whitespace-pre-line wrap-anywhere text-ink ${
          fromAdmin ? 'bg-sea-tint' : 'bg-ground'
        }`}
      >
        {message.message}
      </div>
    </li>
  );
}
