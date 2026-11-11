import { Router } from 'express';
import * as ticketsController from '../../controllers/admin/tickets.controller.js';
import validate from '../../middlewares/validate.js';
import {
  listAdminTicketsValidator,
  replyValidator,
  ticketIdValidator,
  updateTicketStatusValidator,
} from '../../validators/admin/tickets.validator.js';

const router = Router();

router.get('/', listAdminTicketsValidator, validate, ticketsController.getTickets);
router.get('/:id', ticketIdValidator, validate, ticketsController.getTicket);
router.post('/:id/messages', replyValidator, validate, ticketsController.replyToTicket);
router.patch(
  '/:id/status',
  updateTicketStatusValidator,
  validate,
  ticketsController.updateTicketStatus,
);

export default router;
