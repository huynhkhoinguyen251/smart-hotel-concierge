import mysql from 'mysql2/promise';

const pool = mysql.createPool({
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
