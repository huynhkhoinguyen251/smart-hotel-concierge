import pool from '../config/db.js';

const toImage = (row) => ({ ...row, is_primary: Boolean(row.is_primary) });

// Ảnh chính đứng đầu, sau đó theo thứ tự thêm vào.
export const findImagesByRoomId = async (roomId, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT id, image_url, is_primary FROM room_images
     WHERE room_id = ?
     ORDER BY is_primary DESC, id ASC`,
    [roomId],
  );
  return rows.map(toImage);
};

export const findImageById = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    'SELECT id, room_id, image_url, is_primary FROM room_images WHERE id = ?',
    [id],
  );
  return rows[0] ? toImage(rows[0]) : null;
};

export const hasImages = async (roomId, conn = pool) => {
  const [rows] = await conn.execute('SELECT 1 FROM room_images WHERE room_id = ? LIMIT 1', [
    roomId,
  ]);
  return rows.length > 0;
};

// Ảnh còn lại có id nhỏ nhất, hoặc null nếu phòng không còn ảnh.
export const findFirstImageId = async (roomId, conn = pool) => {
  const [rows] = await conn.execute(
    'SELECT id FROM room_images WHERE room_id = ? ORDER BY id ASC LIMIT 1',
    [roomId],
  );
  return rows[0]?.id ?? null;
};

export const createImage = async ({ room_id, image_url, is_primary }, conn = pool) => {
  const [result] = await conn.execute(
    'INSERT INTO room_images (room_id, image_url, is_primary) VALUES (?, ?, ?)',
    [room_id, image_url, is_primary ? 1 : 0],
  );
  return result.insertId;
};

export const clearPrimaryImage = async (roomId, conn = pool) => {
  await conn.execute(
    'UPDATE room_images SET is_primary = 0 WHERE room_id = ? AND is_primary = 1',
    [roomId],
  );
};

export const setPrimaryImage = async (id, conn = pool) => {
  await conn.execute('UPDATE room_images SET is_primary = 1 WHERE id = ?', [id]);
};

export const deleteImage = async (id, conn = pool) => {
  await conn.execute('DELETE FROM room_images WHERE id = ?', [id]);
};
