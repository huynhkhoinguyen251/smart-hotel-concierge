import { REVIEW_TARGETS } from '../config/reviews.js';
import * as bookingsModel from '../models/bookings.model.js';
import * as foodOrdersModel from '../models/foodOrders.model.js';
import * as reviewsModel from '../models/reviews.model.js';
import * as serviceBookingsModel from '../models/serviceBookings.model.js';
import * as tourBookingsModel from '../models/tourBookings.model.js';
import * as transportBookingsModel from '../models/transportBookings.model.js';
import AppError from '../utils/AppError.js';
import { mapDbError } from '../utils/dbErrors.js';
import { getPagination } from '../utils/pagination.js';
import { BOOKING_NOT_FOUND } from './bookings.service.js';
import { FOOD_ORDER_NOT_FOUND } from './foodOrders.service.js';
import { findVisibleRoom } from './rooms.service.js';
import { SERVICE_REQUEST_NOT_FOUND } from './serviceBookings.service.js';
import { getService } from './services.service.js';
import { TOUR_BOOKING_NOT_FOUND } from './tourBookings.service.js';
import { getTour } from './tours.service.js';
import { TRANSPORT_BOOKING_NOT_FOUND } from './transportBookings.service.js';

const EXACTLY_ONE_TARGET = 'Provide exactly one item to review';

// Cách đọc từng loại đơn bằng model có sẵn. Mọi loại đều trả { status, ownerId }.
// Đơn đặt phòng có user_id; các loại khác đã nối với chủ đơn và trả user.id.
const TARGET_LOADERS = {
  booking_id: {
    find: bookingsModel.findBookingById,
    notFound: BOOKING_NOT_FOUND,
    ownerOf: (booking) => booking.user_id,
  },
  service_booking_id: {
    find: serviceBookingsModel.findServiceBookingById,
    notFound: SERVICE_REQUEST_NOT_FOUND,
    ownerOf: (item) => item.user.id,
  },
  food_order_id: {
    find: foodOrdersModel.findFoodOrderById,
    notFound: FOOD_ORDER_NOT_FOUND,
    ownerOf: (item) => item.user.id,
  },
  tour_booking_id: {
    find: tourBookingsModel.findTourBookingById,
    notFound: TOUR_BOOKING_NOT_FOUND,
    ownerOf: (item) => item.user.id,
  },
  transport_booking_id: {
    find: transportBookingsModel.findTransportBookingById,
    notFound: TRANSPORT_BOOKING_NOT_FOUND,
    ownerOf: (item) => item.user.id,
  },
};

// Đánh giá của tôi: có đối tượng được đánh giá, không cần thông tin người viết.
const toMyReview = ({ id, rating, comment, created_at, target }) => ({
  id,
  rating,
  comment,
  created_at,
  target,
});

// Đánh giá công khai: chỉ hiện họ tên người viết, không có email hay id.
const toPublicReview = ({ id, rating, comment, created_at, reviewer }) => ({
  id,
  rating,
  comment,
  created_at,
  reviewer: { full_name: reviewer.full_name },
});

// TiDB không kiểm tra CHECK, nên kiểm tra lại "đúng một đơn" ở đây, ngoài validator.
const pickTarget = (data) => {
  const targets = REVIEW_TARGETS.filter((target) => data[target.field] != null);
  if (targets.length !== 1) {
    throw new AppError(400, EXACTLY_ONE_TARGET);
  }
  return targets[0];
};

export const createReview = async (userId, data) => {
  const target = pickTarget(data);
  const targetId = data[target.field];
  const loader = TARGET_LOADERS[target.field];

  const item = await loader.find(targetId);
  if (!item) {
    throw new AppError(404, loader.notFound);
  }
  if (loader.ownerOf(item) !== userId) {
    throw new AppError(403, `You do not have permission to access this ${target.label}`);
  }
  if (item.status !== target.doneStatus) {
    throw new AppError(400, `You can only review a ${target.doneLabel}`);
  }

  const alreadyReviewed = `You have already reviewed this ${target.label}`;
  if (await reviewsModel.hasReviewForTarget(target.column, targetId)) {
    throw new AppError(409, alreadyReviewed);
  }

  let id;
  try {
    id = await reviewsModel.createReview({
      user_id: userId,
      column: target.column,
      target_id: targetId,
      rating: data.rating,
      comment: data.comment ?? null,
    });
  } catch (error) {
    // Hai yêu cầu đánh giá cùng một đơn gửi gần như cùng lúc: ràng buộc UNIQUE chặn cái sau.
    throw mapDbError(error, { duplicate: alreadyReviewed });
  }

  return toMyReview(await reviewsModel.findReviewById(id));
};

export const listMyReviews = async (userId, { page, limit }) => {
  const pagination = getPagination({ page, limit });
  const filters = { user_id: userId };

  const [reviews, total] = await Promise.all([
    reviewsModel.findReviews({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    reviewsModel.countReviews(filters),
  ]);

  return {
    reviews: reviews.map(toMyReview),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

// Danh sách công khai kèm tóm tắt. total của phân trang chính là review_count.
const listPublicReviews = async (filters, { page, limit }) => {
  const pagination = getPagination({ page, limit });

  const [reviews, summary] = await Promise.all([
    reviewsModel.findReviews({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    reviewsModel.getReviewSummary(filters),
  ]);

  return {
    result: { summary, reviews: reviews.map(toPublicReview) },
    pagination: { page: pagination.page, limit: pagination.limit, total: summary.review_count },
  };
};

// Trả 404 giống API chi tiết công khai của phòng, dịch vụ và tour.
export const listRoomReviews = async ({ id, ...query }) => {
  await findVisibleRoom(id);
  return listPublicReviews({ room_id: id }, query);
};

export const listServiceReviews = async ({ id, ...query }) => {
  await getService(id);
  return listPublicReviews({ service_id: id }, query);
};

export const listTourReviews = async ({ id, ...query }) => {
  await getTour(id);
  return listPublicReviews({ tour_id: id }, query);
};

// Mục chung "Đánh giá đồ ăn": mọi đánh giá có food_order_id, không theo từng món.
export const listFoodReviews = (query) => listPublicReviews({ type: 'food_order' }, query);
