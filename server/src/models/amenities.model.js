import pool from '../config/db.js';
import { placeholders } from './sqlHelpers.js';

export const findAllAmenities = async (conn = pool) => {
  const [rows] = await conn.execute('SELECT id, name FROM amenities ORDER BY name, id');
  return rows;
};

export const findAmenityById = async (id, conn = pool) => {
  const [rows] = await conn.execute('SELECT id, name FROM amenities WHERE id = ?', [id]);
  return rows[0] ?? null;
};

// Số id trong danh sách thực sự có trong bảng. ids không được trùng nhau.
export const countExistingAmenities = async (ids, conn = pool) => {
  if (ids.length === 0) {
    return 0;
  }
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS total FROM amenities WHERE id IN (${placeholders(ids)})`,
    ids,
  );
  return Number(rows[0].total);
};

// Lấy tiện nghi của nhiều loại phòng trong một truy vấn, kèm room_type_id để gom nhóm.
export const findAmenitiesByRoomTypeIds = async (roomTypeIds, conn = pool) => {
  if (roomTypeIds.length === 0) {
    return [];
  }

  const [rows] = await conn.execute(
    `SELECT rta.room_type_id, a.id, a.name
     FROM room_type_amenities rta
     JOIN amenities a ON a.id = rta.amenity_id
     WHERE rta.room_type_id IN (${placeholders(roomTypeIds)})
     ORDER BY a.name, a.id`,
    roomTypeIds,
  );
  return rows;
};

export const createAmenity = async (name, conn = pool) => {
  const [result] = await conn.execute('INSERT INTO amenities (name) VALUES (?)', [name]);
  return result.insertId;
};

export const updateAmenity = async (id, name, conn = pool) => {
  await conn.execute('UPDATE amenities SET name = ? WHERE id = ?', [name, id]);
};

// Liên kết với loại phòng tự xóa theo nhờ ON DELETE CASCADE.
export const deleteAmenity = async (id, conn = pool) => {
  await conn.execute('DELETE FROM amenities WHERE id = ?', [id]);
};
