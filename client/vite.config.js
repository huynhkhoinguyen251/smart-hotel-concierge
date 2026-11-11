import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Cổng 5173 phải khớp với CLIENT_URL của backend (CORS).
  server: { port: 5173, strictPort: true },
});
