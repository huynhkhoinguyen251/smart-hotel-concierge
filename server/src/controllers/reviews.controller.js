import { matchedData } from 'express-validator';
import * as reviewsService from '../services/reviews.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

// req.user do middleware authenticate gán; user luôn lấy từ token, không lấy từ body.

export const createReview = async (req, res) => {
  const review = await reviewsService.createReview(req.user.id, matchedData(req));
  sendSuccess(res, review, 'Review created successfully', 201);
};

export const getMyReviews = async (req, res) => {
  const { reviews, pagination } = await reviewsService.listMyReviews(
    req.user.id,
    matchedData(req),
  );
  sendPaginated(res, reviews, pagination);
};

// Danh sách công khai: data là { summary, reviews }, kèm pagination như các danh sách khác.

export const getRoomReviews = async (req, res) => {
  const { result, pagination } = await reviewsService.listRoomReviews(matchedData(req));
  sendPaginated(res, result, pagination);
};

export const getServiceReviews = async (req, res) => {
  const { result, pagination } = await reviewsService.listServiceReviews(matchedData(req));
  sendPaginated(res, result, pagination);
};

export const getTourReviews = async (req, res) => {
  const { result, pagination } = await reviewsService.listTourReviews(matchedData(req));
  sendPaginated(res, result, pagination);
};

export const getFoodReviews = async (req, res) => {
  const { result, pagination } = await reviewsService.listFoodReviews(matchedData(req));
  sendPaginated(res, result, pagination);
};
