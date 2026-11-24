import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Lịch của antd và dayjs: nặng, chỉ tải khi trang có ô chọn ngày. Các file locale không tính,
// vì ConfigProvider của antd dùng chúng ngay từ đầu và sẽ kéo cả nhóm vào lần tải đầu tiên.
const PICKER = /node_modules[\/](?:dayjs|@rc-component[\/]picker|antd[\/]es[\/](?:date-picker|time-picker|calendar))[\/](?!.*locale)/;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Cổng 5173 phải khớp với CLIENT_URL của backend (CORS).
  server: { port: 5173, strictPort: true },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Tách thư viện ra khỏi code của app: trình duyệt giữ lại được khi app có bản mới.
          groups: [
            { name: 'react', test: /node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/, priority: 3 },
            // Chỉ phần antd cần cho lần tải đầu. Phần còn lại (Table, Dropdown, Modal...) tự chia theo trang dùng nó.
            // Phải đứng trước antd-picker: một nhóm lấy luôn các file nó phụ thuộc, nên nếu không thì
            // phần lõi của antd sẽ rơi vào antd-picker và cả nhóm đó bị tải ngay từ đầu.
            { name: 'antd', tags: ['$initial'], test: /node_modules[\/](antd|@ant-design|@rc-component|@emotion|stylis)[\/]/, priority: 2 },
            { name: 'antd-picker', test: PICKER, priority: 1 },
            // Code của app: phần cần cho lần tải đầu một file; phần dùng chung ở nhiều trang một file,
            // để mỗi trang không phải tải hàng chục file nhỏ.
            { name: 'app', tags: ['$initial'], test: /[\/]src[\/]/, priority: 1 },
            { name: 'shared', test: /[\/]src[\/](?!pages[\/]|components[\/]admin[\/])/, minShareCount: 10, priority: 0 },
          ],
        },
      },
    },
  },
});
