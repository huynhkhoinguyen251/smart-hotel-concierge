import { useSearchParams } from 'react-router-dom';
import {
  getFeedbackStats,
  getMonthlyRevenue,
  getStatsOverview,
  getTopRooms,
  getTopServices,
} from '../../api/adminStats.api.js';
import AsyncSection from '../../components/admin/AsyncSection.jsx';
import BookingStatusList from '../../components/admin/BookingStatusList.jsx';
import RevenueChart from '../../components/admin/charts/RevenueChart.jsx';
import RevenueSourceChart from '../../components/admin/charts/RevenueSourceChart.jsx';
import FeedbackSummary from '../../components/admin/FeedbackSummary.jsx';
import RevenueTable from '../../components/admin/RevenueTable.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import { TopRoomsTable, TopServicesTable } from '../../components/admin/TopTables.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import PageTitle from '../../components/ui/PageTitle.jsx';
import Select from '../../components/ui/Select.jsx';
import { getRevenueYears, TOP_LIST_LIMIT } from '../../config/adminStats.js';
import useAuth from '../../hooks/useAuth.js';
import useFetch from '../../hooks/useFetch.js';
import formatCurrency from '../../utils/formatCurrency.js';

// /admin: thống kê. Mỗi mục tự tải và tự báo lỗi, nên một request lỗi không làm hỏng cả trang.
// Năm của biểu đồ doanh thu nằm trên địa chỉ trang (?year=); năm lạ thì dùng năm nay.
export default function DashboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const years = getRevenueYears();
  const rawYear = Number(searchParams.get('year'));
  const year = years.includes(rawYear) ? rawYear : years[0];

  const overview = useFetch(() => getStatsOverview(), []);
  const feedback = useFetch(() => getFeedbackStats(), ['feedback']);
  const revenue = useFetch(() => getMonthlyRevenue(year), ['revenue', year]);
  const topRooms = useFetch(() => getTopRooms(TOP_LIST_LIMIT), ['top-rooms']);
  const topServices = useFetch(() => getTopServices(TOP_LIST_LIMIT), ['top-services']);

  const yearSelect = (
    <Select
      aria-label="Revenue year"
      className="w-28"
      value={String(year)}
      onChange={(event) => setSearchParams({ year: event.target.value })}
      options={years.map((value) => ({ value: String(value), label: String(value) }))}
    />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageTitle title="Dashboard" subtitle={`Welcome, ${user.full_name}.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total revenue"
          request={overview}
          getValue={(data) => ({ value: formatCurrency(data.revenue.total), detail: 'Completed stays and orders' })}
        />
        <StatCard
          label="Bookings"
          request={overview}
          getValue={(data) => ({ value: data.bookings.total, detail: 'Not counting cancelled' })}
        />
        <StatCard
          label="Pending bookings"
          request={overview}
          getValue={(data) => ({ value: data.bookings.by_status.pending ?? 0, detail: 'Waiting for payment' })}
          link={{ to: '/admin/bookings?status=pending', label: 'Review pending bookings' }}
        />
        <StatCard
          label="Guest users"
          request={overview}
          getValue={(data) => ({ value: `${data.users.active} / ${data.users.total}`, detail: 'Active / total' })}
        />
        <StatCard
          label="Average rating"
          request={feedback}
          getValue={(data) =>
            data.review_count > 0
              ? {
                  value: `${Number(data.average_rating).toFixed(1)} / 5`,
                  detail: `${data.review_count} ${data.review_count === 1 ? 'review' : 'reviews'}`,
                }
              : { value: '-', detail: 'No reviews yet' }
          }
        />
      </div>

      <AsyncSection title={`Revenue by month (${year})`} request={revenue} action={yearSelect}>
        {(data) => (
          <>
            <RevenueChart months={data.months} year={year} />
            <RevenueTable months={data.months} year={year} />
          </>
        )}
      </AsyncSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <AsyncSection title="Revenue by source" request={overview}>
          {(data) =>
            Number(data.revenue.total) > 0 ? (
              <RevenueSourceChart revenue={data.revenue} />
            ) : (
              <EmptyState
                title="No revenue yet"
                message="Revenue appears after a stay is checked out or an order is completed."
              />
            )
          }
        </AsyncSection>
        <AsyncSection title="Bookings by status" request={overview}>
          {(data) => <BookingStatusList byStatus={data.bookings.by_status} />}
        </AsyncSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AsyncSection title="Top rooms" request={topRooms}>
          {(items) => <TopRoomsTable items={items} />}
        </AsyncSection>
        <AsyncSection title="Top services" request={topServices}>
          {(items) => <TopServicesTable items={items} />}
        </AsyncSection>
      </div>

      <AsyncSection title="Guest feedback" request={feedback}>
        {(data) => <FeedbackSummary feedback={data} />}
      </AsyncSection>
    </div>
  );
}
