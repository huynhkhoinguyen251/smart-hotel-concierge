import cors from 'cors';
import express from 'express';
import { UPLOAD_DIR, UPLOAD_URL_PREFIX } from './config/uploads.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';
import apiRoutes from './routes/index.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Ảnh đã upload, ngoài /api và không cần đăng nhập. nosniff để trình duyệt không đoán
// lại loại file, chỉ dùng loại theo đuôi file (.jpg, .png, .webp).
app.use(
  UPLOAD_URL_PREFIX,
  express.static(UPLOAD_DIR, {
    index: false,
    dotfiles: 'ignore',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }),
);

app.use('/api', apiRoutes);

// Hai middleware này phải đứng sau tất cả route.
app.use(notFound);
app.use(errorHandler);

export default app;
