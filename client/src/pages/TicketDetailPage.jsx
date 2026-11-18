import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTicket, sendTicketMessage } from '../api/tickets.api.js';
import ChatMessage from '../components/support/ChatMessage.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import DetailLoader from '../components/ui/DetailLoader.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import StatusProgress from '../components/ui/StatusProgress.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import { TICKET_STEPS } from '../config/statuses.js';
import {
  CLOSED_TICKET_STATUS,
  TICKET_MESSAGE_MAX_LENGTH,
  TICKET_RESOLVED_NOTE,
} from '../config/support.js';
import useAuth from '../hooks/useAuth.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import formatDate from '../utils/formatDate.js';

// Ô trả lời ở cuối cuộc hội thoại. API gửi tin trả lại cả yêu cầu, nên onSent nhận yêu cầu mới.
function ReplyBox({ ticketId, onSent }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) {
      setError('Enter a message');
      return;
    }
    setSending(true);
    setError('');
    try {
      onSent(await sendTicketMessage(ticketId, text));
      setMessage('');
    } catch (apiError) {
      // Ví dụ 400: lễ tân vừa đóng yêu cầu.
      setError(apiError.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3" aria-label="Reply">
      <Textarea
        label="Your reply"
        name="message"
        rows={3}
        value={message}
        maxLength={TICKET_MESSAGE_MAX_LENGTH}
        onChange={(event) => {
          setMessage(event.target.value);
          setError('');
        }}
        placeholder="Write a message to reception"
        disabled={sending}
      />
      <div aria-live="polite">
        <Alert type="error">{error}</Alert>
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={sending}>
          Send
        </Button>
      </div>
    </form>
  );
}

// Nội dung yêu cầu. Giữ trong state để thêm tin nhắn mới ngay sau khi gửi.
// Nút Refresh tải lại yêu cầu ngay tại đây, nên chữ đang gõ trong ô trả lời không bị mất.
function TicketConversation({ initialTicket, initialMessage }) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState(initialTicket);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const isClosed = ticket.status === CLOSED_TICKET_STATUS;

  const refresh = async () => {
    setRefreshing(true);
    try {
      setTicket(await getTicket(ticket.id));
      setRefreshError('');
    } catch (apiError) {
      setRefreshError(apiError.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/support" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to support
      </Link>

      <div className="mt-3 mb-2 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 text-2xl font-bold tracking-tight wrap-anywhere text-slate-900 sm:text-3xl">
          {ticket.subject}
        </h1>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="mb-6 text-sm text-slate-500">
        Request #{ticket.id} · Created on {formatDate(ticket.created_at, { withTime: true })}
      </p>

      <div className="mb-6 space-y-3 empty:hidden" aria-live="polite">
        <Alert type="success">{initialMessage}</Alert>
        <Alert type="error">{refreshError}</Alert>
      </div>

      <Card className="mb-6">
        <StatusProgress
          status={ticket.status}
          steps={TICKET_STEPS}
          label="Request progress"
          cancelledMessage=""
        />
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Conversation</h2>
          <Button variant="secondary" className="px-3 py-1.5" loading={refreshing} onClick={refresh}>
            Refresh
          </Button>
        </div>
        <ul className="space-y-4" aria-label="Messages">
          {ticket.messages.map((message) => (
            <ChatMessage key={message.id} message={message} isOwn={message.sender?.id === user?.id} />
          ))}
        </ul>

        <div className="mt-6 border-t border-slate-100 pt-4">
          {isClosed ? (
            <p className="text-sm text-slate-600">
              {TICKET_RESOLVED_NOTE}{' '}
              <Link to="/support/new" className="font-semibold text-teal-700 hover:text-teal-800">
                New request
              </Link>
            </p>
          ) : (
            <ReplyBox ticketId={ticket.id} onSent={setTicket} />
          )}
        </div>
      </Card>
    </div>
  );
}

// /support/:id (chỉ cho người đã đăng nhập).
export default function TicketDetailPage() {
  // Thông báo từ trang tạo yêu cầu, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  // 403 (yêu cầu của người khác) hiện giống 404, không lộ yêu cầu có tồn tại hay không.
  return (
    <DetailLoader
      load={getTicket}
      notFoundStatuses={[400, 403, 404]}
      notFound={{
        title: 'Support request not found',
        message: 'This support request does not exist or does not belong to you.',
        to: '/support',
        linkLabel: 'Back to support',
      }}
      errorClassName="mx-auto max-w-3xl px-4 py-10"
    >
      {(data) => (
        <TicketConversation key={data.id} initialTicket={data} initialMessage={flashMessage} />
      )}
    </DetailLoader>
  );
}
