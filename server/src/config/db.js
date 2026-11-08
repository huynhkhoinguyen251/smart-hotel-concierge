import mysql from 'mysql2/promise';

// DB_SSL=true khi database chỉ nhận kết nối TLS (ví dụ TiDB Cloud).
// Dùng kho chứng chỉ có sẵn của Node.js nên không cần file CA.
// Không đặt hoặc khác 'true' thì giữ kết nối thường như MySQL local.
const sslOptions =
  process.env.DB_SSL === 'true'
    ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
    : {};

const pool = mysql.createPool({
  ...sslOptions,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Trả ngày dưới dạng chuỗi để DATE không bị lệch múi giờ.
  dateStrings: true,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
});

// Chạy work(conn) trong một transaction. Thành công thì commit, lỗi thì rollback rồi ném lại lỗi.
// Kết nối luôn được trả về pool trong finally.
export const withTransaction = async (work) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (error) {
    try {
      await conn.rollback();
    } catch (rollbackError) {
      console.error('Transaction rollback failed:', rollbackError);
    }
    throw error;
  } finally {
    conn.release();
  }
};

export default pool;
