import pool from '../config/db.js';

// MySQL trả DECIMAL dưới dạng chuỗi, nên đổi về số.
const toFoodOrderItem = (row) => ({
  id: row.id,
  menu_item: { id: row.menu_item_id, name: row.menu_item_name, category: row.menu_item_category },
  quantity: row.quantity,
  unit_price: Number(row.unit_price),
});

export const findItemsByFoodOrderId = async (foodOrderId, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT fi.id, fi.menu_item_id, fi.quantity, fi.unit_price,
            m.name AS menu_item_name, m.category AS menu_item_category
     FROM food_order_items fi
     JOIN menu_items m ON m.id = fi.menu_item_id
     WHERE fi.food_order_id = ?
     ORDER BY fi.id`,
    [foodOrderId],
  );
  return rows.map(toFoodOrderItem);
};

// Thêm tất cả các món của một đơn bằng một câu INSERT nhiều dòng.
export const createFoodOrderItems = async (foodOrderId, items, conn = pool) => {
  if (items.length === 0) {
    return;
  }
  const rowsSql = items.map(() => '(?, ?, ?, ?)').join(', ');
  const params = items.flatMap(({ menu_item_id, quantity, unit_price }) => [
    foodOrderId,
    menu_item_id,
    quantity,
    unit_price,
  ]);
  await conn.execute(
    `INSERT INTO food_order_items (food_order_id, menu_item_id, quantity, unit_price)
     VALUES ${rowsSql}`,
    params,
  );
};
