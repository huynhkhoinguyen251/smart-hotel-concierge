import { getMyFoodOrders } from '../api/foodOrders.api.js';
import AccountListPage from '../components/layout/AccountListPage.jsx';
import { FoodOrderRow } from '../components/orders/OrderRows.jsx';
import Alert from '../components/ui/Alert.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import { FOOD_ORDER_STATUS_TABS } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import { toQueryString } from '../utils/queryString.js';

const PAGE_SIZE = 10;

// Đơn đồ ăn của tôi. Tab trạng thái và trang hiện tại nằm trên địa chỉ trang.
export default function MyFoodOrdersPage() {
  const flashMessage = useFlashMessage();
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const { values, selected, page, goToPage } = useUrlFilters({ status: FOOD_ORDER_STATUS_TABS });
  const { status } = values;
  const list = useFetch(() => getMyFoodOrders({ status, page, limit: PAGE_SIZE }), [status, page]);

  return (
    <AccountListPage
      title="My food orders"
      subtitle="Your food and drink orders, newest first."
      notice={
        <Alert type="success" className="mb-6">
          {flashMessage}
        </Alert>
      }
      tabs={{
        label: 'Filter by status',
        tabs: FOOD_ORDER_STATUS_TABS,
        active: status,
        getLink: (value) => `/my-food-orders${toQueryString({ status: value })}`,
      }}
      list={list}
      items={list.data?.foodOrders}
      empty={{
        title: status ? `No ${selected.status.label.toLowerCase()} orders` : 'No food orders yet',
        message: 'When you order food or drinks to your room, they will appear here.',
        action: <ButtonLink to="/food">Browse the menu</ButtonLink>,
      }}
      pagination={{ page, limit: PAGE_SIZE, total: list.data?.pagination?.total ?? 0, onPageChange: goToPage }}
      listLabel="Food orders"
      renderItem={(order) => <FoodOrderRow key={order.id} order={order} />}
    />
  );
}
