import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelFoodOrder, getFoodOrder } from '../api/foodOrders.api.js';
import { DetailFact, DetailFacts, DetailSection } from '../components/detail/DetailParts.jsx';
import OrderItemsTable from '../components/food/OrderItemsTable.jsx';
import OrderDetailLayout from '../components/orders/OrderDetailLayout.jsx';
import ReviewPanel from '../components/reviews/ReviewPanel.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DetailLoader from '../components/ui/DetailLoader.jsx';
import { FOOD_ORDER_CANCELLED_MESSAGE, FOOD_ORDER_STEPS } from '../config/food.js';
import { CANCELLABLE_FOOD_ORDER_STATUS } from '../config/statuses.js';
import useCancelAction from '../hooks/useCancelAction.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import { formatItemCount } from '../utils/foodCart.js';
import { sumPrices } from '../utils/price.js';
import formatCurrency from '../utils/formatCurrency.js';
import { getDiscountLabel } from '../config/vouchers.js';

// Nội dung đơn. Giữ trong state để cập nhật ngay sau khi hủy (API hủy trả lại cả đơn).
function OrderDetails({ initialOrder, initialMessage }) {
  const [order, setOrder] = useState(initialOrder);

  const { booking, items } = order;
  const canCancel = order.can_cancel ?? order.status === CANCELLABLE_FOOD_ORDER_STATUS;
  const subtotal = sumPrices(items.map((item) => item.line_total));
  const discount = Number(order.discount_amount) || 0;

  // Ví dụ 400: khách sạn vừa xác nhận đơn, không còn pending.
  const { success, error, showMessage, dialogProps, openDialog } = useCancelAction({
    cancel: () => cancelFoodOrder(order.id),
    onCancelled: setOrder,
    successMessage: FOOD_ORDER_CANCELLED_MESSAGE,
    initialMessage,
  });

  // Tải lại đơn sau khi thanh toán hoặc hết hạn (thanh toán có thể đổi cả trạng thái đơn).
  const reloadAfterPayment = async (message) => {
    try {
      setOrder(await getFoodOrder(order.id));
    } catch {
      // Lỗi mạng: giữ dữ liệu đang có; khách có thể tải lại trang.
    }
    if (message) showMessage('success', message);
  };

  return (
    <>
      <OrderDetailLayout
        order={order}
        title={`Order #${order.id}`}
        backTo="/my-food-orders"
        backLabel="Back to my food orders"
        createdLabel="Ordered on"
        success={success}
        error={error}
        paymentType="food_order"
        onPaid={reloadAfterPayment}
        onExpired={() => reloadAfterPayment('')}
        steps={FOOD_ORDER_STEPS}
        progressLabel="Order progress"
        cancelledMessage="This order was cancelled."
        main={
          <>
            <DetailSection title="Items" subtitle={formatItemCount(items.length)}>
              <OrderItemsTable items={items} />
            </DetailSection>
            <DetailSection title="Delivery">
              <DetailFacts>
                <DetailFact label="Room">
                  <Link to={`/my-bookings/${booking.id}`} className="text-sea hover:text-sea-hover hover:underline">
                    Room {booking.room.room_number} · Booking #{booking.id}
                  </Link>
                </DetailFact>
                <DetailFact label="Note">
                  <span className="whitespace-pre-line">{order.note || '-'}</span>
                </DetailFact>
              </DetailFacts>
            </DetailSection>
            <ReviewPanel type="food_order" itemId={order.id} status={order.status} />
          </>
        }
        price={{
          rows: [
            { label: 'Subtotal', value: formatCurrency(subtotal) },
            ...(discount > 0
              ? [{ label: getDiscountLabel(order.voucher?.code), value: `- ${formatCurrency(discount)}` }]
              : []),
          ],
          total: order.total_price,
        }}
        cancellation={
          canCancel && {
            label: 'Cancel order',
            onCancel: openDialog,
            children: <p>You can cancel this order until the hotel confirms it.</p>,
          }
        }
      />

      <ConfirmDialog
        {...dialogProps}
        title="Cancel this order?"
        message={`Order #${order.id} (${formatItemCount(items.length)}, ${formatCurrency(order.total_price)}) will be cancelled.`}
        confirmLabel="Yes, cancel order"
        cancelLabel="Keep order"
        variant="danger"
      />
    </>
  );
}

// /my-food-orders/:id (chỉ cho người đã đăng nhập).
export default function FoodOrderDetailPage() {
  // Thông báo từ trang thực đơn sau khi đặt, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  // 403 (đơn của người khác) hiện giống 404, không lộ đơn có tồn tại hay không.
  return (
    <DetailLoader
      load={getFoodOrder}
      notFoundStatuses={[400, 403, 404]}
      notFound={{
        title: 'Food order not found',
        message: 'This food order does not exist or does not belong to you.',
        to: '/my-food-orders',
        linkLabel: 'Back to my food orders',
      }}
      errorClassName="shell py-10"
    >
      {(data) => <OrderDetails key={data.id} initialOrder={data} initialMessage={flashMessage} />}
    </DetailLoader>
  );
}
