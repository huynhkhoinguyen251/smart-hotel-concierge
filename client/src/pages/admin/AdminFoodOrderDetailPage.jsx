import { Link } from 'react-router-dom';
import { getAdminFoodOrder, updateAdminFoodOrderStatus } from '../../api/adminFoodOrders.api.js';
import AdminDetailLayout, { AdminActionsCard, AdminGuestCard } from '../../components/admin/AdminDetailLayout.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import FoodOrderItems from '../../components/food/FoodOrderItems.jsx';
import Card from '../../components/ui/Card.jsx';
import DetailRow from '../../components/ui/DetailRow.jsx';
import { FOOD_SECTION_NAV } from '../../config/adminCatalog.js';
import { FOOD_ORDER_ADMIN_ACTIONS, getActions } from '../../config/adminRequests.js';
import { FOOD_ORDER_STEPS } from '../../config/food.js';
import useAdminItem from '../../hooks/useAdminItem.js';
import { formatItemCount } from '../../utils/foodCart.js';
import { sumPrices } from '../../utils/price.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';
import PaymentInfoCard from '../../components/payments/PaymentInfoCard.jsx';

function FoodOrderDetails({ initialOrder }) {
  const { item: order, message, actionProps } = useAdminItem(initialOrder);
  const { booking, items } = order;
  const actions = getActions(FOOD_ORDER_ADMIN_ACTIONS, order.status);
  const subtotal = sumPrices(items.map((item) => item.line_total));
  const discount = Number(order.discount_amount) || 0;

  return (
    <AdminDetailLayout
      subNav={<AdminSubNav {...FOOD_SECTION_NAV} />}
      backTo="/admin/food-orders"
      backLabel="Back to food orders"
      title={`Food order #${order.id}`}
      status={order.status}
      createdAt={order.created_at}
      createdLabel="Ordered on"
      message={message}
      steps={FOOD_ORDER_STEPS}
      progressLabel="Order progress"
      cancelledMessage="This order was cancelled."
      main={
        <>
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Items <span className="text-sm font-normal text-slate-500">({formatItemCount(items.length)})</span>
            </h2>
            <FoodOrderItems items={items} />
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Delivery</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Room">Room {booking?.room?.room_number}</DetailRow>
              <DetailRow label="Booking">
                <Link to={`/admin/bookings/${booking?.id}`} className="text-teal-700 hover:text-teal-800">
                  Booking #{booking?.id}
                </Link>
              </DetailRow>
              <DetailRow label="Note">
                <span className="whitespace-pre-line">{order.note || '-'}</span>
              </DetailRow>
            </dl>
          </Card>
        </>
      }
      side={
        <>
          <AdminGuestCard user={order.user} />
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Price</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Subtotal">{formatCurrency(subtotal)}</DetailRow>
              {discount > 0 && <DetailRow label="Discount">- {formatCurrency(discount)}</DetailRow>}
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">{formatCurrency(order.total_price)}</dd>
              </div>
            </dl>
          </Card>
          <PaymentInfoCard order={order} />
          <AdminActionsCard emptyText="No more actions for this order.">
            {actions.length > 0 && (
              <AdminStatusActions
                actions={actions}
                update={(action) => updateAdminFoodOrderStatus(order.id, action.status)}
                getDisabledReason={getConfirmDisabledReason(order)}
                itemLabel={`food order #${order.id}`}
                {...actionProps}
              />
            )}
          </AdminActionsCard>
        </>
      }
    />
  );
}

// /admin/food-orders/:id
export default function AdminFoodOrderDetailPage() {
  return (
    <DetailLoader
      load={getAdminFoodOrder}
      notFound={{
        title: 'Food order not found',
        message: 'This food order does not exist.',
        to: '/admin/food-orders',
        linkLabel: 'Back to food orders',
      }}
    >
      {(data) => <FoodOrderDetails key={data.id} initialOrder={data} />}
    </DetailLoader>
  );
}
