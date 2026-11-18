import { getAdminFoodOrders, updateAdminFoodOrderStatus } from '../../api/adminFoodOrders.api.js';
import { GuestCell, MoneyCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import { FOOD_ORDER_ADMIN_ACTIONS, getActions } from '../../config/adminRequests.js';
import { FOOD_ORDER_STATUS_TABS } from '../../config/statuses.js';
import { formatItemCount } from '../../utils/foodCart.js';
import formatDate from '../../utils/formatDate.js';

const itemLabel = (order) => `food order #${order.id}`;

// API danh sách chỉ trả item_count, không trả các món, nên ở đây hiện số món;
// tên từng món xem ở trang chi tiết.
const COLUMNS = [
  {
    key: 'order',
    header: 'Order',
    render: (order) => (
      <TitleCell
        status={order.status}
        title={`Order #${order.id}`}
        detail={formatDate(order.created_at, { withTime: true })}
      />
    ),
  },
  { key: 'guest', header: 'Guest', render: (order) => <GuestCell user={order.user} /> },
  {
    key: 'room',
    header: 'Deliver to',
    render: (order) => (
      <>
        <p className="text-slate-900">Room {order.booking?.room?.room_number}</p>
        <p className="text-xs text-slate-500">Booking #{order.booking?.id}</p>
      </>
    ),
  },
  {
    key: 'items',
    header: 'Items',
    render: (order) => (
      <>
        <p className="text-slate-900">{formatItemCount(order.item_count)}</p>
        {order.note && <p className="truncate text-xs text-slate-500" title={order.note}>Note: {order.note}</p>}
      </>
    ),
  },
  { key: 'total', header: 'Total', align: 'right', render: (order) => <MoneyCell amount={order.total_price} /> },
];

// /admin/food-orders: đơn đồ ăn của khách.
export default function AdminFoodOrdersPage() {
  return (
    <AdminRequestListPage
      title="Food orders"
      subtitle="Food and drink orders for room delivery, newest first."
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
            itemLabel={itemLabel(order)}
            {...actionProps}
          />
        ),
      }}
    />
  );
}
