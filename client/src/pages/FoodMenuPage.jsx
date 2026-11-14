import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMenuItems } from '../api/menuItems.api.js';
import CartPanel from '../components/food/CartPanel.jsx';
import FoodReviews from '../components/food/FoodReviews.jsx';
import MenuItemCard from '../components/food/MenuItemCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { ADMIN_FOOD_NOTE, isMenuCategory, MAX_ORDER_LINES, MENU_CATEGORY_TABS } from '../config/food.js';
import useAuth from '../hooks/useAuth.js';
import useFetch from '../hooks/useFetch.js';
import {
  addCartItem,
  clearCart,
  formatItemCount,
  getCartLines,
  getCartQuantity,
  getCartTotal,
  readCart,
  removeCartItem,
  saveCart,
  setCartItemQuantity,
} from '../utils/foodCart.js';
import { toQueryString } from '../utils/queryString.js';

// Thực đơn chỉ có khoảng 10 món: tải hết một lần (50 là giới hạn của backend) rồi lọc loại ở trình duyệt.
// Giỏ hàng cần cả thực đơn để lấy tên và giá, kể cả khi đang xem một loại.
const MENU_LIMIT = 50;
const ID_PATTERN = /^[1-9]\d*$/;

// /food?category=coffee&booking_id=3 (công khai). booking_id đến từ trang chi tiết đơn đặt phòng
// và được chọn sẵn ở ô "Deliver to".
export default function FoodMenuPage() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const rawCategory = searchParams.get('category') ?? '';
  // Loại lạ trên địa chỉ trang thì coi như "All".
  const category = isMenuCategory(rawCategory) ? rawCategory : '';
  const rawBookingId = searchParams.get('booking_id') ?? '';
  const bookingId = ID_PATTERN.test(rawBookingId) ? rawBookingId : '';

  const menu = useFetch(() => getMenuItems({ limit: MENU_LIMIT }), []);
  const [storedCart, setStoredCart] = useState(readCart);

  const menuItems = menu.data?.menuItems ?? [];
  // Dòng có món đã ngừng bán bị bỏ ngay khi ghép với thực đơn; giá luôn lấy từ thực đơn.
  const lines = menu.data ? getCartLines(storedCart, menuItems) : [];
  const cart = lines.map(({ menu_item_id, quantity }) => ({ menu_item_id, quantity }));
  const total = getCartTotal(lines);

  // Mọi thay đổi đi từ giỏ đã lọc, nên dòng của món ngừng bán cũng bị xóa khỏi localStorage.
  const updateCart = (change) => {
    const next = change(cart);
    saveCart(next);
    setStoredCart(next);
  };
  const handleOrdered = () => {
    clearCart();
    setStoredCart([]);
  };

  const getTabLink = (value) => `/food${toQueryString({ category: value, booking_id: bookingId })}`;
  const visibleItems = category ? menuItems.filter((item) => item.category === category) : menuItems;
  const canAddNew = cart.length < MAX_ORDER_LINES;
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const renderMenu = () => {
    if (visibleItems.length === 0) {
      return (
        <EmptyState
          title="No items available"
          message="There is nothing in this category right now. Please check again later."
        />
      );
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => {
          const quantity = getCartQuantity(cart, item.id);
          return (
            <MenuItemCard
              key={item.id}
              item={item}
              quantity={quantity}
              showControls={!isAdmin}
              canAddNew={canAddNew}
              onAdd={() => updateCart((current) => addCartItem(current, item.id))}
              // Bấm "-" khi còn 1 phần thì bỏ món khỏi giỏ, thẻ quay về nút "Add to cart".
              onDecrease={() =>
                updateCart((current) =>
                  quantity <= 1
                    ? removeCartItem(current, item.id)
                    : setCartItemQuantity(current, item.id, quantity - 1),
                )
              }
            />
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (menu.loading) return <PageSpinner />;
    if (menu.error) return <ErrorState message={menu.error.message} onRetry={menu.retry} />;

    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="min-w-0">
          {/* Trên điện thoại giỏ hàng nằm dưới thực đơn: link nhảy nhanh xuống giỏ. */}
          {!isAdmin && itemCount > 0 && (
            <a
              href="#cart"
              className="mb-4 flex items-center justify-between rounded-lg bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 lg:hidden"
            >
              <span>
                View cart ({formatItemCount(itemCount)})
              </span>
              <span aria-hidden="true">↓</span>
            </a>
          )}
          {renderMenu()}
        </div>

        <Card className="min-w-0 lg:sticky lg:top-24">
          {isAdmin ? (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Your order</h2>
              <p className="mt-3 text-sm text-slate-500">{ADMIN_FOOD_NOTE}</p>
            </>
          ) : (
            <CartPanel
              lines={lines}
              total={total}
              bookingId={bookingId}
              onChangeQuantity={(id, quantity) =>
                updateCart((current) => setCartItemQuantity(current, id, quantity))
              }
              onRemove={(id) => updateCart((current) => removeCartItem(current, id))}
              onOrdered={handleOrdered}
            />
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageTitle title="Food and drinks" subtitle="Order food, coffee and drinks to your room." />

      {/* booking_id được chọn sẵn ở ô "Deliver to"; đơn không hợp lệ thì form tự báo. */}
      <Alert type="info" className="mb-6">
        Room delivery is available for guests who have checked in.
      </Alert>

      <FilterTabs
        label="Filter by category"
        className="mb-6"
        tabs={MENU_CATEGORY_TABS}
        active={category}
        getLink={getTabLink}
      />

      {renderContent()}

      <FoodReviews />
    </div>
  );
}
