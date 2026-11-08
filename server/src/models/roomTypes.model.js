import pool from '../config/db.js';
import { buildSetClause } from './sqlHelpers.js';

const ROOM_TYPE_COLUMNS = 'id, name, description, price_per_night, capacity';

// MySQL trả DECIMAL dưới dạng chuỗi, nên đổi về số.
const toRoomType = (row) => ({ ...row, price_per_night: Number(row.price_per_night) });

export const findAllRoomTypes = async (conn = pool) => {
  const [rows] = await conn.execute(`SELECT ${ROOM_TYPE_COLUMNS} FROM room_types ORDER BY id`);
  return rows.map(toRoomType);
};

export const findRoomTypeById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`SELECT ${ROOM_TYPE_COLUMNS} FROM room_types WHERE id = ?`, [
    id,
  ]);
  return rows[0] ? toRoomType(rows[0]) : null;
};

export const createRoomType = async (
  { name, description, price_per_night, capacity },
  conn = pool,
) => {
  const [result] = await conn.execute(
    'INSERT INTO room_types (name, description, price_per_night, capacity) VALUES (?, ?, ?, ?)',
    [name, description ?? null, price_per_night, capacity],
  );
  return result.insertId;
};

export const updateRoomType = async (id, data, conn = pool) => {
  const { setClause, values } = buildSetClause(data, [
    'name',
    'description',
    'price_per_night',
    'capacity',
  ]);
  if (!setClause) {
    return;
  }
  await conn.execute(`UPDATE room_types SET ${setClause} WHERE id = ?`, [...values, id]);
};

// Tiện nghi gắn với loại phòng tự xóa theo nhờ ON DELETE CASCADE.
export const deleteRoomType = async (id, conn = pool) => {
  await conn.execute('DELETE FROM room_types WHERE id = ?', [id]);
};

// Thay toàn bộ danh sách tiện nghi của loại phòng. Nên gọi trong transaction.
export const replaceRoomTypeAmenities = async (roomTypeId, amenityIds, conn = pool) => {
  await conn.execute('DELETE FROM room_type_amenities WHERE room_type_id = ?', [roomTypeId]);
  if (amenityIds.length === 0) {
    return;
  }

  const rows = amenityIds.map(() => '(?, ?)').join(', ');
  await conn.execute(
    `INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES ${rows}`,
    amenityIds.flatMap((amenityId) => [roomTypeId, amenityId]),
  );
};
