import { useState } from 'react';
import { Drawer } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { getMenuItems } from '../api/menuItems.api.js';
import CartPanel from '../components/food/CartPanel.jsx';
import FoodReviews from '../components/food/FoodReviews.jsx';
import MenuItemCard from '../components/food/MenuItemCard.jsx';
import Bone, { BoneGroup } from '../components/ui/Bone.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Price from '../components/ui/Price.jsx';
import {
  ADMIN_FOOD_NOTE,
  FOOD_DELIVERY_RULE,
  getMenuCategoryLabel,
  isMenuCategory,
  MAX_ORDER_LINES,
  MENU_CATEGORY_KEYS,
  MENU_CATEGORY_TABS,
} from '../config/food.js';
import useAuth from '../hooks/useAuth.js';
import useFetch from '../hooks/useFetch.js';
import useMediaQuery, { DESKTOP_QUERY } from '../hooks/useMediaQuery.js';
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

const PAGE_GRID = 'grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start';
const ROW_LIST = 'divide-y divide-line-soft border-y border-line-soft';

function MenuSkeleton() {
  return (
    <BoneGroup className={PAGE_GRID}>
      <div className={ROW_LIST}>
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="flex gap-4 py-4 sm:items-center sm:gap-6">
            <Bone className="aspect-[4/3] w-28 shrink-0 sm:w-44" />
            <div className="min-w-0 flex-1">
              <Bone className="h-6 w-full max-w-56" />
              <Bone className="mt-2 h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
      <Bone className="hidden h-72 lg:block" />
    </BoneGroup>
  );
}

// /food?category=coffee&booking_id=3 (công khai). booking_id đến từ trang chi tiết đơn đặt phòng
// và được chọn sẵn ở ô "Deliver to".
export default function FoodMenuPage() {
  const { isAdmin } = useAuth();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [cartOpen, setCartOpen] = useState(false);
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
  const showBottomBar = !isDesktop && !isAdmin && !menu.loading && !menu.error && itemCount > 0;

  const renderItem = (item) => {
    const quantity = getCartQuantity(cart, item.id);
    return (
      <MenuItemCard
        key={item.id}
        item={item}
        quantity={quantity}
        showControls={!isAdmin}
        canAddNew={canAddNew}
        onAdd={() => updateCart((current) => addCartItem(current, item.id))}
        // Bấm "-" khi còn 1 phần thì bỏ món khỏi giỏ, dòng quay về nút "Add to cart".
        onDecrease={() =>
          updateCart((current) =>
            quantity <= 1
              ? removeCartItem(current, item.id)
              : setCartItemQuantity(current, item.id, quantity - 1),
          )
        }
      />
    );
  };

  // "All": chia theo từng loại. Đang chọn một loại thì chỉ có loại đó.
  const renderMenu = () => {
    if (visibleItems.length === 0) {
      return (
        <EmptyState
          title="No items available"
          message="There is nothing in this category right now. Please check again later."
        />
      );
    }
    const groups = MENU_CATEGORY_KEYS.map((key) => ({
      key,
      items: visibleItems.filter((item) => item.category === key),
    })).filter((group) => group.items.length > 0);
    return (
      <div className="space-y-12">
        {groups.map((group) => (
          <section key={group.key} aria-labelledby={`menu-${group.key}`}>
            <h2 id={`menu-${group.key}`} className="mb-4 text-xl font-semibold text-ink">
              {getMenuCategoryLabel(group.key)}
            </h2>
            <div className={ROW_LIST}>{group.items.map(renderItem)}</div>
          </section>
        ))}
      </div>
    );
  };

  const renderCart = (props) => (
    <CartPanel
      lines={lines}
      total={total}
      bookingId={bookingId}
      onChangeQuantity={(id, quantity) =>
        updateCart((current) => setCartItemQuantity(current, id, quantity))
      }
      onRemove={(id) => updateCart((current) => removeCartItem(current, id))}
      onOrdered={handleOrdered}
      {...props}
    />
  );

  // Máy tính: khung dính bên phải. Điện thoại: giỏ nằm trong ngăn kéo; admin chỉ thấy ghi chú.
  const renderAside = () => {
    if (isAdmin) {
      return (
        <Card className="min-w-0 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-ink">Your order</h2>
          <p className="mt-3 text-sm text-ink-soft">{ADMIN_FOOD_NOTE}</p>
        </Card>
      );
    }
    if (!isDesktop) return null;
    return (
      <Card className="max-h-[calc(100vh-7rem)] min-w-0 overflow-y-auto lg:sticky lg:top-24">{renderCart()}</Card>
    );
  };

  const renderContent = () => {
    if (menu.loading) return <MenuSkeleton />;
    if (menu.error) return <ErrorState message={menu.error.message} onRetry={menu.retry} />;

    return (
      <div className={PAGE_GRID}>
        <div className="min-w-0">{renderMenu()}</div>
        {renderAside()}
      </div>
    );
  };

  return (
    <div className="shell pt-8 lg:pt-12">
      <PageTitle
        title="Food and drinks"
        subtitle={`Order food, coffee and drinks to your room. ${FOOD_DELIVERY_RULE}`}
      />

      {/* booking_id được chọn sẵn ở ô "Deliver to"; đơn không hợp lệ thì form tự báo. */}
      <FilterTabs
        label="Filter by category"
        className="mb-8"
        tabs={MENU_CATEGORY_TABS}
        active={category}
        getLink={getTabLink}
      />

      {renderContent()}

      <FoodReviews />

      {showBottomBar && (
        <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-line-soft bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6">
          <p className="min-w-0 text-sm text-ink-soft">
            {formatItemCount(itemCount)}
            <Price amount={total} className="block" />
          </p>
          <Button onClick={() => setCartOpen(true)} aria-haspopup="dialog" aria-expanded={cartOpen}>
            View order
          </Button>
        </div>
      )}

      {!isDesktop && !isAdmin && (
        <Drawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          placement="bottom"
          size="85dvh"
          title="Your order"
          closable={{ placement: 'end', 'aria-label': 'Close order' }}
        >
          {renderCart({ hideHeading: true })}
        </Drawer>
      )}

      <div className="pb-12 lg:pb-16" />
    </div>
  );
}
