import { Link } from 'react-router-dom';
import { getAdminFoodOrder, updateAdminFoodOrderStatus } from '../../api/adminFoodOrders.api.js';
import AdminDetailLayout, { AdminGuestSection } from '../../components/admin/AdminDetailLayout.jsx';
import { DetailFact, DetailFacts, DetailPriceSection, DetailSection } from '../../components/detail/DetailParts.jsx';
import OrderItemsTable from '../../components/food/OrderItemsTable.jsx';
import SectionNav from '../../components/ui/SectionNav.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import { FOOD_SECTION_NAV } from '../../config/adminCatalog.js';
import { FOOD_ORDER_ADMIN_ACTIONS, getActions } from '../../config/adminRequests.js';
import { FOOD_ORDER_STEPS } from '../../config/food.js';
import useAdminItem from '../../hooks/useAdminItem.js';
import { formatItemCount } from '../../utils/foodCart.js';
import { sumPrices } from '../../utils/price.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';
import PaymentInfoCard from '../../components/payments/PaymentInfoCard.jsx';
import { getDiscountLabel } from '../../config/vouchers.js';

function FoodOrderDetails({ initialOrder }) {
  const { item: order, message, actionProps } = useAdminItem(initialOrder);
  const { booking, items } = order;
  const actions = getActions(FOOD_ORDER_ADMIN_ACTIONS, order.status);
  const subtotal = sumPrices(items.map((item) => item.line_total));
  const discount = Number(order.discount_amount) || 0;

  return (
    <AdminDetailLayout
      subNav={<SectionNav {...FOOD_SECTION_NAV} />}
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
      actions={
        actions.length > 0 && (
          <AdminStatusActions
            actions={actions}
            update={(action) => updateAdminFoodOrderStatus(order.id, action.status)}
            getDisabledReason={getConfirmDisabledReason(order)}
            itemLabel={`food order #${order.id}`}
            {...actionProps}
          />
        )
      }
      actionsEmptyText="No more actions for this order."
      main={
        <>
          <DetailSection title="Items" subtitle={formatItemCount(items.length)}>
            <OrderItemsTable items={items} />
          </DetailSection>
          <DetailSection title="Delivery">
            <DetailFacts>
              <DetailFact label="Room">Room {booking?.room?.room_number}</DetailFact>
              <DetailFact label="Booking">
                <Link to={`/admin/bookings/${booking?.id}`} className="text-sea hover:text-sea-hover hover:underline">
                  Booking #{booking?.id}
                </Link>
              </DetailFact>
              <DetailFact label="Note">
                <span className="whitespace-pre-line">{order.note || '-'}</span>
              </DetailFact>
            </DetailFacts>
          </DetailSection>
        </>
      }
      side={
        <>
          <AdminGuestSection user={order.user} />
          <DetailPriceSection
            rows={[
              { label: 'Subtotal', value: formatCurrency(subtotal) },
              ...(discount > 0
                ? [{ label: getDiscountLabel(order.voucher?.code), value: `- ${formatCurrency(discount)}` }]
                : []),
            ]}
            total={order.total_price}
          />
          <PaymentInfoCard order={order} />
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
