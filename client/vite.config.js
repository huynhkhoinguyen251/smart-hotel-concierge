import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, priority: 3 },
            { name: 'antd-picker', test: /node_modules[\\/](dayjs|@rc-component[\\/]picker|antd[\\/]es[\\/](date-picker|time-picker|calendar))[\\/]/, priority: 2 },
            { name: 'antd', test: /node_modules[\\/](antd|@ant-design|@rc-component|@emotion|stylis)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
});
