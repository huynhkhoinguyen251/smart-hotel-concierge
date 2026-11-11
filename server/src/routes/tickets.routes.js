import { Router } from 'express';
import * as ticketsController from '../controllers/tickets.controller.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import {
  addMessageValidator,
  createTicketValidator,
  listMyTicketsValidator,
  ticketIdValidator,
} from '../validators/tickets.validator.js';

const router = Router();

// Mọi API yêu cầu hỗ trợ đều cần đăng nhập.
router.use(authenticate);

router.post('/', createTicketValidator, validate, ticketsController.createTicket);
router.get('/', listMyTicketsValidator, validate, ticketsController.getMyTickets);
router.get('/:id', ticketIdValidator, validate, ticketsController.getMyTicket);
router.post('/:id/messages', addMessageValidator, validate, ticketsController.addMyMessage);

export default router;
