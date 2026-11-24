import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTicket, sendTicketMessage } from '../api/tickets.api.js';
import DetailLayout from '../components/detail/DetailLayout.jsx';
import { DetailSection } from '../components/detail/DetailParts.jsx';
import TicketMessage from '../components/support/TicketMessage.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import DetailLoader from '../components/ui/DetailLoader.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import { TICKET_STEPS } from '../config/statuses.js';
import {
  CLOSED_TICKET_STATUS,
  TICKET_MESSAGE_MAX_LENGTH,
  TICKET_RESOLVED_NOTE,
} from '../config/support.js';
import useAuth from '../hooks/useAuth.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import usePageTitle from '../hooks/usePageTitle.js';

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
  usePageTitle(ticket.subject);

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
    <div className="shell pt-6 pb-12 lg:pb-16">
      <div className="max-w-4xl">
        <DetailLayout
          backTo="/support"
          backLabel="Back to support"
          title={ticket.subject}
          titleClassName="text-2xl sm:text-3xl"
          status={ticket.status}
          createdAt={ticket.created_at}
          createdLabel={`Request #${ticket.id} · Created on`}
          message={refreshError ? { type: 'error', text: refreshError } : { type: 'success', text: initialMessage }}
          steps={TICKET_STEPS}
          progressLabel="Request progress"
          cancelledMessage=""
          main={
            <DetailSection
              title="Conversation"
              action={
                <Button variant="secondary" size="sm" loading={refreshing} onClick={refresh}>
                  Refresh
                </Button>
              }
            >
              <ul className="space-y-5" aria-label="Messages">
                {ticket.messages.map((message) => (
                  <TicketMessage key={message.id} message={message} currentUserId={user?.id} viewerRole="user" />
                ))}
              </ul>

              <div className="mt-6 border-t border-line-soft pt-5">
                {isClosed ? (
                  <p className="text-sm text-ink-soft">
                    {TICKET_RESOLVED_NOTE}{' '}
                    <Link to="/support/new" className="font-semibold text-sea hover:text-sea-hover hover:underline">
                      New request
                    </Link>
                  </p>
                ) : (
                  <ReplyBox ticketId={ticket.id} onSent={setTicket} />
                )}
              </div>
            </DetailSection>
          }
        />
      </div>
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
      errorClassName="shell py-10"
    >
      {(data) => (
        <TicketConversation key={data.id} initialTicket={data} initialMessage={flashMessage} />
      )}
    </DetailLoader>
  );
}
