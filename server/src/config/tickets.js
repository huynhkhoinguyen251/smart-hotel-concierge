// Hằng số nghiệp vụ của yêu cầu hỗ trợ, theo Mục 5 của proposal.md và mục 7 của docs/api.md.

export const TICKET_STATUSES = ['open', 'in_progress', 'resolved'];

// Admin đổi trạng thái chỉ theo một chiều: open → in_progress → resolved.
export const TICKET_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['resolved'],
};

// Yêu cầu ở trạng thái này không nhận thêm tin nhắn, từ cả user lẫn admin.
export const CLOSED_TICKET_STATUS = 'resolved';

// Khi admin trả lời một yêu cầu đang open, yêu cầu tự chuyển sang in_progress.
export const AUTO_REPLY_TRANSITION = { from: 'open', to: 'in_progress' };

// Độ dài tối đa sau khi trim. subject khớp với cột VARCHAR(200).
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_MESSAGE_LENGTH = 2000;
