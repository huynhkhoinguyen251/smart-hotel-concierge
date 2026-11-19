import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelFoodOrder, getFoodOrder } from '../api/foodOrders.api.js';
import FoodOrderItems from '../components/food/FoodOrderItems.jsx';
import PaymentPanel from '../components/payments/PaymentPanel.jsx';
import ReviewPanel from '../components/reviews/ReviewPanel.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DetailLoader from '../components/ui/DetailLoader.jsx';
import DetailRow from '../components/ui/DetailRow.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import StatusProgress from '../components/ui/StatusProgress.jsx';
import { FOOD_ORDER_CANCELLED_MESSAGE, FOOD_ORDER_STEPS } from '../config/food.js';
import { CANCELLABLE_FOOD_ORDER_STATUS } from '../config/statuses.js';
import useCancelAction from '../hooks/useCancelAction.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import { formatItemCount } from '../utils/foodCart.js';
import { sumPrices } from '../utils/price.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/my-food-orders" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to my food orders
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Order #{order.id}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="mb-6 space-y-3" aria-live="polite">
        <Alert type="success">{success}</Alert>
        <Alert type="error">{error}</Alert>
      </div>

      <div className="mb-6 empty:hidden">
        <PaymentPanel
          type="food_order"
          order={order}
          onPaid={reloadAfterPayment}
          onExpired={() => reloadAfterPayment('')}
        />
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Order status</h2>
        <StatusProgress
          status={order.status}
          steps={FOOD_ORDER_STEPS}
          label="Order progress"
          cancelledMessage="This order was cancelled."
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Items <span className="text-sm font-normal text-slate-500">({formatItemCount(items.length)})</span>
            </h2>
            <FoodOrderItems items={items} />
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Delivery</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Room">
                <Link to={`/my-bookings/${booking.id}`} className="text-teal-700 hover:text-teal-800">
                  Room {booking.room.room_number} · Booking #{booking.id}
                </Link>
              </DetailRow>
              <DetailRow label="Ordered at">{formatDate(order.created_at, { withTime: true })}</DetailRow>
              <DetailRow label="Note">
                <span className="whitespace-pre-line">{order.note || '-'}</span>
              </DetailRow>
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Price</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Subtotal">{formatCurrency(subtotal)}</DetailRow>
              {discount > 0 && (
                <DetailRow label="Discount">- {formatCurrency(discount)}</DetailRow>
              )}
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">
                  {formatCurrency(order.total_price)}
                </dd>
              </div>
            </dl>
          </Card>

          <ReviewPanel type={'food_order'} itemId={order.id} status={order.status} />

          {canCancel && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Cancellation</h2>
              <p className="mt-2 text-sm text-slate-600">
                You can cancel this order until the hotel confirms it.
              </p>
              <Button variant="danger" fullWidth className="mt-4" onClick={openDialog}>
                Cancel order
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        {...dialogProps}
        title="Cancel this order?"
        message={`Order #${order.id} (${formatItemCount(items.length)}, ${formatCurrency(order.total_price)}) will be cancelled.`}
        confirmLabel="Yes, cancel order"
        cancelLabel="Keep order"
        variant="danger"
      />
    </div>
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
      errorClassName="mx-auto max-w-5xl px-4 py-10"
    >
      {(data) => <OrderDetails key={data.id} initialOrder={data} initialMessage={flashMessage} />}
    </DetailLoader>
  );
}
