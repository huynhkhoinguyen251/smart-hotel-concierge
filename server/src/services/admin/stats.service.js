import { DEFAULT_TOP_LIMIT, MONTHS_PER_YEAR, REVENUE_SOURCES } from '../../config/stats.js';
import * as statsModel from '../../models/stats.model.js';

export const getOverview = async () => {
  const [bookings, revenue, users] = await Promise.all([
    statsModel.getBookingCounts(),
    statsModel.getRevenueTotals(),
    statsModel.getUserCounts(),
  ]);
  return { bookings, revenue, users };
};

// Tháng không có doanh thu: mọi nguồn và tổng đều bằng 0.
const emptyMonth = (month) => ({
  month,
  ...Object.fromEntries(REVENUE_SOURCES.map(({ key }) => [key, 0])),
  total: 0,
});

// Luôn trả đủ 12 tháng. Năm mặc định là năm hiện tại theo giờ của server (TZ=Asia/Ho_Chi_Minh).
export const getMonthlyRevenue = async ({ year = new Date().getFullYear() }) => {
  const rows = await statsModel.getMonthlyRevenue(year);
  const byMonth = new Map(rows.map((row) => [row.month, row]));

  const months = Array.from({ length: MONTHS_PER_YEAR }, (_, index) => {
    const month = index + 1;
    return byMonth.get(month) ?? emptyMonth(month);
  });

  return { year, months };
};

export const getTopRooms = ({ limit = DEFAULT_TOP_LIMIT }) => statsModel.findTopRooms(limit);

export const getTopServices = ({ limit = DEFAULT_TOP_LIMIT }) =>
  statsModel.findTopServices(limit);

export const getFeedback = () => statsModel.getFeedbackStats();
