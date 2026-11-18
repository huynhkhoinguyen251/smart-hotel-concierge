import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTicket } from '../api/tickets.api.js';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import {
  ADMIN_TICKET_NOTE,
  TICKET_CREATED_MESSAGE,
  TICKET_MESSAGE_MAX_LENGTH,
  TICKET_SUBJECT_MAX_LENGTH,
} from '../config/support.js';
import useAuth from '../hooks/useAuth.js';

// Kiểm tra ở trình duyệt (backend vẫn kiểm tra lại): bắt buộc và không quá độ dài sau khi trim.
const validate = ({ subject, message }) => {
  const errors = {};
  if (!subject.trim()) errors.subject = 'Enter a subject';
  else if (subject.trim().length > TICKET_SUBJECT_MAX_LENGTH) {
    errors.subject = `Use at most ${TICKET_SUBJECT_MAX_LENGTH} characters`;
  }
  if (!message.trim()) errors.message = 'Enter your message';
  else if (message.trim().length > TICKET_MESSAGE_MAX_LENGTH) {
    errors.message = `Use at most ${TICKET_MESSAGE_MAX_LENGTH} characters`;
  }
  return errors;
};

function NewTicketForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const ticket = await createTicket({ subject: form.subject.trim(), message: form.message.trim() });
      navigate(`/support/${ticket.id}`, { state: { success: TICKET_CREATED_MESSAGE } });
    } catch (apiError) {
      setSubmitError(apiError.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="New support request">
      <Input
        label="Subject"
        name="subject"
        value={form.subject}
        onChange={handleChange}
        maxLength={TICKET_SUBJECT_MAX_LENGTH}
        placeholder="For example: Extra pillows for room 301"
        error={errors.subject}
        hint={`${form.subject.length}/${TICKET_SUBJECT_MAX_LENGTH}`}
        disabled={submitting}
      />
      <Textarea
        label="Message"
        name="message"
        rows={6}
        value={form.message}
        onChange={handleChange}
        maxLength={TICKET_MESSAGE_MAX_LENGTH}
        placeholder="Tell reception how they can help"
        error={errors.message}
        disabled={submitting}
      />
      <div aria-live="polite">
        <Alert type="error">{submitError}</Alert>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to="/support"
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <Button type="submit" loading={submitting}>
          Send request
        </Button>
      </div>
    </form>
  );
}

// /support/new (chỉ cho người đã đăng nhập). Admin không tạo được yêu cầu của khách.
export default function NewTicketPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/support" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to support
      </Link>
      <PageTitle
        className="mt-3"
        title="New support request"
        subtitle="Reception usually replies within a few hours."
      />
      <Card>{isAdmin ? <p className="text-sm text-slate-500">{ADMIN_TICKET_NOTE}</p> : <NewTicketForm />}</Card>
    </div>
  );
}
