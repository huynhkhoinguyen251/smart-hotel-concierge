import {
  CART_STORAGE_KEY,
  MAX_ITEM_QUANTITY,
  MAX_ORDER_LINES,
  MIN_ITEM_QUANTITY,
} from '../config/food.js';

// Giỏ hàng là mảng [{ menu_item_id, quantity }]. Chỉ lưu id và số lượng, không lưu giá:
// giá luôn lấy từ thực đơn mới tải, và backend tự tính lại khi đặt.
// Các hàm không sửa mảng cũ mà trả mảng mới.

const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

export const clampQuantity = (quantity) =>
  Math.min(MAX_ITEM_QUANTITY, Math.max(MIN_ITEM_QUANTITY, Math.round(Number(quantity)) || MIN_ITEM_QUANTITY));

export const getCartQuantity = (cart, menuItemId) =>
  cart.find((line) => line.menu_item_id === menuItemId)?.quantity ?? 0;

// Thêm 1 phần. Món mới khi giỏ đã đủ 20 món thì giữ nguyên giỏ.
export const addCartItem = (cart, menuItemId) => {
  if (cart.some((line) => line.menu_item_id === menuItemId)) {
    return cart.map((line) =>
      line.menu_item_id === menuItemId
        ? { ...line, quantity: clampQuantity(line.quantity + 1) }
        : line,
    );
  }
  if (cart.length >= MAX_ORDER_LINES) return cart;
  return [...cart, { menu_item_id: menuItemId, quantity: MIN_ITEM_QUANTITY }];
};

// Đổi số lượng, luôn giữ trong khoảng 1–20.
export const setCartItemQuantity = (cart, menuItemId, quantity) =>
  cart.map((line) =>
    line.menu_item_id === menuItemId ? { ...line, quantity: clampQuantity(quantity) } : line,
  );

export const removeCartItem = (cart, menuItemId) =>
  cart.filter((line) => line.menu_item_id !== menuItemId);

// Ghép giỏ với thực đơn: bỏ dòng có món không còn bán, giá lấy từ thực đơn.
// Trả [{ menu_item_id, quantity, menuItem, lineTotal }].
export const getCartLines = (cart, menuItems) => {
  const menuById = new Map(menuItems.map((item) => [item.id, item]));
  return cart
    .filter((line) => menuById.has(line.menu_item_id))
    .map((line) => {
      const menuItem = menuById.get(line.menu_item_id);
      return { ...line, menuItem, lineTotal: multiplyPrice(menuItem.price, line.quantity) };
    });
};

// Tính theo đồng xu (x100) để tránh sai số số thực. Giá từ backend có thể là chuỗi "75000.00".
const toCents = (amount) => Math.round(Number(amount) * 100);
export const multiplyPrice = (price, quantity) => (toCents(price) * quantity) / 100;
export const sumPrices = (amounts) => amounts.reduce((sum, amount) => sum + toCents(amount), 0) / 100;

export const getCartTotal = (lines) => sumPrices(lines.map((line) => line.lineTotal));

// "1 item", "3 items". item_count của đơn là số món khác nhau.
export const formatItemCount = (count) => `${count} ${Number(count) === 1 ? 'item' : 'items'}`;

// Dữ liệu gửi lên POST /food-orders.
export const toOrderItems = (lines) =>
  lines.map(({ menu_item_id, quantity }) => ({ menu_item_id, quantity }));

// Làm sạch dữ liệu đọc từ localStorage (có thể bị sửa tay hoặc từ phiên bản cũ):
// bỏ dòng sai, gộp dòng trùng, giới hạn số lượng và số dòng.
export const sanitizeCart = (value) => {
  if (!Array.isArray(value)) return [];
  let cart = [];
  value.forEach((line) => {
    const id = Number(line?.menu_item_id);
    const quantity = Number(line?.quantity);
    if (!isPositiveInt(id) || !isPositiveInt(quantity)) return;
    const current = getCartQuantity(cart, id);
    if (current) {
      cart = setCartItemQuantity(cart, id, current + quantity);
    } else if (cart.length < MAX_ORDER_LINES) {
      cart = [...cart, { menu_item_id: id, quantity: clampQuantity(quantity) }];
    }
  });
  return cart;
};

// localStorage có thể bị chặn (chế độ riêng tư, chính sách trình duyệt), nên mọi lần gọi
// đều bọc try/catch: lỗi thì giỏ hàng vẫn chạy, chỉ không được nhớ lại.
export const readCart = () => {
  try {
    const raw = globalThis.localStorage?.getItem(CART_STORAGE_KEY);
    return raw ? sanitizeCart(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart) => {
  try {
    if (cart.length === 0) {
      globalThis.localStorage?.removeItem(CART_STORAGE_KEY);
    } else {
      globalThis.localStorage?.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch {
    // Bỏ qua: không lưu được thì giỏ chỉ sống trong phiên hiện tại.
  }
};

export const clearCart = () => saveCart([]);
