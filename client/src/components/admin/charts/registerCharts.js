import { ArcElement, BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip } from 'chart.js';

// Chỉ đăng ký các phần Chart.js đang dùng (không dùng chart.js/auto để file build nhỏ hơn):
// biểu đồ cột (trục danh mục + trục số + cột) và biểu đồ tròn (cung), cùng tooltip và chú thích.
// Controller của Bar và Doughnut được react-chartjs-2 tự đăng ký.
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
