import { useState } from 'react';
import {
  getAdminTicket,
  replyToAdminTicket,
  updateAdminTicketStatus,
} from '../../api/adminTickets.api.js';
import AdminDetailLayout, { AdminActionsCard, AdminGuestCard } from '../../components/admin/AdminDetailLayout.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import ChatMessage from '../../components/support/ChatMessage.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { getActions, TICKET_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { TICKET_STEPS } from '../../config/statuses.js';
import { CLOSED_TICKET_STATUS, RECEPTION_LABEL, TICKET_MESSAGE_MAX_LENGTH } from '../../config/support.js';
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
    <form onSubmit={handleSubmit} noValidate className="space-y-3" aria-label="Reply to the guest">
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

  // Góc nhìn của admin: tin của admin bên phải (của mình ghi "You"), tin của khách bên trái.
  const chatProps = (msg) => {
    const fromAdmin = msg.sender?.role === 'admin';
    const isMe = msg.sender?.id === user?.id;
    return {
      isOwn: fromAdmin,
      label: isMe ? null : fromAdmin ? `${RECEPTION_LABEL} · ${msg.sender.full_name}` : msg.sender?.full_name,
      footerPrefix: isMe ? 'You · ' : '',
    };
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
      main={
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Conversation</h2>
            <Button variant="secondary" size="sm" loading={refreshing} onClick={refresh}>
              Refresh
            </Button>
          </div>
          <ul className="space-y-4" aria-label="Messages">
            {ticket.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} {...chatProps(msg)} />
            ))}
          </ul>
          <div className="mt-6 border-t border-slate-100 pt-4">
            {isClosed ? (
              <p className="text-sm text-slate-600">This request is resolved. No more messages can be sent.</p>
            ) : (
              <ReplyBox ticketId={ticket.id} onSent={setTicket} />
            )}
          </div>
        </Card>
      }
      side={
        <>
          <AdminGuestCard user={ticket.guest} />
          <AdminActionsCard emptyText="This request is resolved.">
            {actions.length > 0 && (
              <>
                {ticket.status === 'open' && (
                  <p className="mb-3 text-xs text-slate-500">Replying also marks the request as in progress.</p>
                )}
                <AdminStatusActions
                  actions={actions}
                  update={(action) => updateAdminTicketStatus(ticket.id, action.status)}
                  itemLabel={`support request #${ticket.id}`}
                  {...actionProps}
                />
              </>
            )}
          </AdminActionsCard>
        </>
      }
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
