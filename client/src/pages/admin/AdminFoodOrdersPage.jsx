import { getAdminFoodOrders, updateAdminFoodOrderStatus } from '../../api/adminFoodOrders.api.js';
import { BadgesCell, GuestCell, MoneyCell, StackCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import SectionNav from '../../components/ui/SectionNav.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import { FOOD_SECTION_NAV } from '../../config/adminCatalog.js';
import { FOOD_ORDER_ADMIN_ACTIONS, getActions } from '../../config/adminRequests.js';
import { FOOD_ORDER_STATUS_TABS } from '../../config/statuses.js';
import { formatItemCount } from '../../utils/foodCart.js';
import formatDate from '../../utils/formatDate.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';

const itemLabel = (order) => `food order #${order.id}`;

// API danh sách chỉ trả item_count, không trả các món, nên ở đây hiện số món;
// tên từng món xem ở trang chi tiết.
const COLUMNS = [
  {
    key: 'order',
    header: 'Order',
    render: (order, link) => (
      <TitleCell
        link={link}
        title={`Order #${order.id}`}
        detail={formatDate(order.created_at, { withTime: true })}
      />
    ),
  },
  { key: 'guest', header: 'Guest', wide: true, render: (order) => <GuestCell user={order.user} /> },
  {
    key: 'room',
    header: 'Deliver to',
    render: (order) => (
      <StackCell
        main={`Room ${order.booking?.room?.room_number}`}
        detail={`Booking #${order.booking?.id}`}
      />
    ),
  },
  {
    key: 'items',
    header: 'Items',
    render: (order) => (
      <StackCell
        main={formatItemCount(order.item_count)}
        detail={
          order.note && (
            <span className="block truncate" title={order.note}>
              Note: {order.note}
            </span>
          )
        }
      />
    ),
  },
  { key: 'total', header: 'Total', align: 'right', render: (order) => <MoneyCell amount={order.total_price} /> },
  {
    key: 'status',
    header: 'Status',
    badges: true,
    render: (order) => <BadgesCell status={order.status} payment={order.payment} />,
  },
];

// /admin/food-orders: đơn đồ ăn của khách.
export default function AdminFoodOrdersPage() {
  return (
    <AdminRequestListPage
      title="Food orders"
      subtitle="Food and drink orders for room delivery, newest first."
      subNav={<SectionNav {...FOOD_SECTION_NAV} />}
      basePath="/admin/food-orders"
      statusTabs={FOOD_ORDER_STATUS_TABS}
      load={getAdminFoodOrders}
      emptyNoun="food orders"
      table={{
        caption: 'Food orders',
        columns: COLUMNS,
        getViewPath: (order) => `/admin/food-orders/${order.id}`,
        getItemLabel: itemLabel,
        renderActions: (order, actionProps) => (
          <AdminStatusActions
            actions={getActions(FOOD_ORDER_ADMIN_ACTIONS, order.status)}
            update={(action) => updateAdminFoodOrderStatus(order.id, action.status)}
            getDisabledReason={getConfirmDisabledReason(order)}
            itemLabel={itemLabel(order)}
            {...actionProps}
          />
        ),
      }}
    />
  );
}
