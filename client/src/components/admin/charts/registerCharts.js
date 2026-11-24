import { BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js';
import { COLORS, FONT_FAMILY } from '../../../config/theme.js';

// Chỉ đăng ký các phần Chart.js đang dùng (không dùng chart.js/auto để file build nhỏ hơn):
// biểu đồ cột (trục danh mục + trục số + cột), cùng tooltip. Chú thích màu là danh sách HTML trong RevenueChart.
// Controller của Bar được react-chartjs-2 tự đăng ký.
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Chữ trên biểu đồ luôn là màu mực, không lấy màu của dữ liệu.
Chart.defaults.font.family = FONT_FAMILY;
Chart.defaults.font.size = 12;
Chart.defaults.color = COLORS.inkSoft;
