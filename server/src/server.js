// Phải đứng đầu tiên để biến môi trường có sẵn trước khi các file khác được nạp.
import 'dotenv/config';
import app from './app.js';

// DB_PASSWORD không nằm trong danh sách vì MySQL có thể không đặt mật khẩu.
const requiredEnv = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_NAME',
  'CLIENT_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
  console.error(`Missing environment variables: ${missingEnv.join(', ')}. Check server/.env.`);
  process.exit(1);
}

const port = Number(process.env.PORT);

app.listen(port, (error) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }

  console.log(`Server is running at http://localhost:${port}`);
});
