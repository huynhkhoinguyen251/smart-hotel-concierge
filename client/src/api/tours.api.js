import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Tour đang hoạt động, lọc bằng location. Trả { tours, pagination }.
export const getTours = async ({ location, page, limit } = {}) => {
  const body = await client.get('/tours', { params: cleanParams({ location, page, limit }) });
  return { tours: body.data, pagination: body.pagination };
};

export const getTour = async (id) => {
  const body = await client.get(`/tours/${id}`);
  return body.data;
};

// Trả { summary, reviews, pagination }, cùng dạng với đánh giá phòng.
export const getTourReviews = async (id, { page, limit } = {}) => {
  const body = await client.get(`/tours/${id}/reviews`, { params: cleanParams({ page, limit }) });
  return { ...body.data, pagination: body.pagination };
};
