import pool from '../config/db.js';

export const checkConnection = async (conn = pool) => {
  await conn.query('SELECT 1');
};
