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

// Cột TIMESTAMP (created_at, updated_at) được trả theo múi giờ của phiên kết nối.
// TiDB Cloud mặc định là UTC, nên đặt +07:00 cho mỗi kết nối mới để hiện giờ Việt Nam
// giống nhau trên MySQL local và TiDB. Câu lệnh được xếp hàng trước mọi truy vấn khác của kết nối.
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+07:00'", (error) => {
    if (error) {
      console.error('Failed to set the session time zone:', error);
    }
  });
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
