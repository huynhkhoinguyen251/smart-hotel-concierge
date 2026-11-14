import { Link, useSearchParams } from 'react-router-dom';
import { getMyFoodOrders } from '../api/foodOrders.api.js';
import FoodOrderCard from '../components/food/FoodOrderCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { FOOD_ORDER_STATUS_TABS } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import { cleanParams, readPage, toQueryString } from '../utils/queryString.js';

const PAGE_SIZE = 10;

// Đơn đồ ăn của tôi. Tab trạng thái và trang hiện tại nằm trên địa chỉ trang.
export default function MyFoodOrdersPage() {
  const flashMessage = useFlashMessage();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get('status') ?? '';
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const activeTab =
    FOOD_ORDER_STATUS_TABS.find((tab) => tab.value === rawStatus) ?? FOOD_ORDER_STATUS_TABS[0];
  const status = activeTab.value;
  const page = readPage(searchParams);

  const list = useFetch(() => getMyFoodOrders({ status, page, limit: PAGE_SIZE }), [status, page]);

  const goToPage = (nextPage) => {
    setSearchParams(cleanParams({ status, page: nextPage > 1 ? nextPage : '' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) {
      return list.error.status === 400 ? (
        <Alert type="error">{list.error.message}</Alert>
      ) : (
        <ErrorState message={list.error.message} onRetry={list.retry} />
      );
    }
    if (list.data.foodOrders.length === 0) {
      return (
        <EmptyState
          title={status ? `No ${activeTab.label.toLowerCase()} orders` : 'No food orders yet'}
          message="When you order food or drinks to your room, they will appear here."
          action={
            <Link
              to="/food"
              className="inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Browse the menu
            </Link>
          }
        />
      );
    }
    return (
      <>
        <div className="space-y-4">
          {list.data.foodOrders.map((order) => (
            <FoodOrderCard key={order.id} order={order} />
          ))}
        </div>
        <Pagination
          className="mt-8"
          page={page}
          limit={PAGE_SIZE}
          total={list.data.pagination?.total ?? 0}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageTitle title="My food orders" subtitle="Your food and drink orders, newest first." />
      <Alert type="success" className="mb-6">
        {flashMessage}
      </Alert>
      <FilterTabs
        label="Filter by status"
        className="mb-6"
        tabs={FOOD_ORDER_STATUS_TABS}
        active={status}
        getLink={(value) => `/my-food-orders${toQueryString({ status: value })}`}
      />
      {renderList()}
    </div>
  );
}
