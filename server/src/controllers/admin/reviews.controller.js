import { matchedData } from 'express-validator';
import * as reviewsService from '../../services/admin/reviews.service.js';
import { sendPaginated } from '../../utils/response.js';

export const getReviews = async (req, res) => {
  const { reviews, pagination } = await reviewsService.listReviews(matchedData(req));
  sendPaginated(res, reviews, pagination);
};
