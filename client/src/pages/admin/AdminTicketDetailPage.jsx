import { useState } from 'react';
import {
  getAdminTicket,
  replyToAdminTicket,
  updateAdminTicketStatus,
} from '../../api/adminTickets.api.js';
import AdminDetailLayout, { AdminGuestSection, AdminSection } from '../../components/admin/AdminDetailLayout.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import TicketMessage from '../../components/admin/TicketMessage.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { getActions, TICKET_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { TICKET_STEPS } from '../../config/statuses.js';
import { CLOSED_TICKET_STATUS, TICKET_MESSAGE_MAX_LENGTH } from '../../config/support.js';
import useAdminItem from '../../hooks/useAdminItem.js';
import useAuth from '../../hooks/useAuth.js';

// Ô trả lời khách. API trả lại cả yêu cầu (tin nhắn mới và trạng thái mới), nên onSent nhận yêu cầu.
function ReplyBox({ ticketId, onSent }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) {
      setError('Enter a reply');
      return;
    }
    setSending(true);
    setError('');
    try {
      onSent(await replyToAdminTicket(ticketId, text));
      setMessage('');
    } catch (apiError) {
      // Ví dụ 400: yêu cầu vừa được đóng ở tab khác.
      setError(apiError.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2" aria-label="Reply to the guest">
      <Textarea
        label="Your reply"
        name="message"
        rows={2}
        value={message}
        maxLength={TICKET_MESSAGE_MAX_LENGTH}
        onChange={(event) => {
          setMessage(event.target.value);
          setError('');
        }}
        placeholder="Write a reply to the guest"
        disabled={sending}
      />
      <div aria-live="polite">
        <Alert type="error">{error}</Alert>
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={sending}>
          Send reply
        </Button>
      </div>
    </form>
  );
}

function TicketDetails({ initialTicket }) {
  const { user } = useAuth();
  const { item: ticket, setItem: setTicket, message, show, actionProps } = useAdminItem(initialTicket);
  const [refreshing, setRefreshing] = useState(false);
  const actions = getActions(TICKET_ADMIN_ACTIONS, ticket.status);
  const isClosed = ticket.status === CLOSED_TICKET_STATUS;

  const refresh = async () => {
    setRefreshing(true);
    try {
      setTicket(await getAdminTicket(ticket.id));
    } catch (apiError) {
      show('error', apiError.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AdminDetailLayout
      backTo="/admin/tickets"
      backLabel="Back to support requests"
      title={ticket.subject}
      status={ticket.status}
      createdAt={ticket.created_at}
      createdLabel={`Request #${ticket.id} · Created on`}
      message={message}
      steps={TICKET_STEPS}
      progressLabel="Request progress"
      actions={
        actions.length > 0 && (
          <AdminStatusActions
            actions={actions}
            update={(action) => updateAdminTicketStatus(ticket.id, action.status)}
            itemLabel={`support request #${ticket.id}`}
            note={ticket.status === 'open' ? 'Replying also marks the request as in progress.' : undefined}
            // Nút vàng duy nhất của trang là "Send reply".
            nextVariant="secondary"
            {...actionProps}
          />
        )
      }
      actionsEmptyText="This request is resolved."
      main={
        <AdminSection
          title="Conversation"
          action={
            <Button variant="secondary" size="sm" loading={refreshing} onClick={refresh}>
              Refresh
            </Button>
          }
        >
          <ul className="space-y-5" aria-label="Messages">
            {ticket.messages.map((msg) => (
              <TicketMessage key={msg.id} message={msg} currentUserId={user?.id} />
            ))}
          </ul>
          {/* Ô trả lời dính ở đáy màn hình, nên luôn với tới được khi hội thoại dài. */}
          <div className="sticky bottom-0 z-10 mt-6 border-t border-line-soft bg-white pt-4 pb-4">
            {isClosed ? (
              <p className="text-sm text-ink-soft">This request is resolved. No more messages can be sent.</p>
            ) : (
              <ReplyBox ticketId={ticket.id} onSent={setTicket} />
            )}
          </div>
        </AdminSection>
      }
      side={<AdminGuestSection user={ticket.guest} />}
    />
  );
}

// /admin/tickets/:id
export default function AdminTicketDetailPage() {
  return (
    <DetailLoader
      load={getAdminTicket}
      notFound={{
        title: 'Support request not found',
        message: 'This support request does not exist.',
        to: '/admin/tickets',
        linkLabel: 'Back to support requests',
      }}
    >
      {(data) => <TicketDetails key={data.id} initialTicket={data} />}
    </DetailLoader>
  );
}
