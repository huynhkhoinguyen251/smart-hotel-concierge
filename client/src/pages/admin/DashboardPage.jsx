import { useSearchParams } from 'react-router-dom';
import {
  getFeedbackStats,
  getMonthlyRevenue,
  getStatsOverview,
  getTopRooms,
  getTopServices,
} from '../../api/adminStats.api.js';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AsyncSection from '../../components/admin/AsyncSection.jsx';
import AttentionList from '../../components/admin/AttentionList.jsx';
import BookingStatusList from '../../components/admin/BookingStatusList.jsx';
import RevenueChart from '../../components/admin/charts/RevenueChart.jsx';
import RevenueSourceChart from '../../components/admin/charts/RevenueSourceChart.jsx';
import FeedbackSummary from '../../components/admin/FeedbackSummary.jsx';
import PlainFigures from '../../components/admin/PlainFigures.jsx';
import RevenueTable from '../../components/admin/RevenueTable.jsx';
import { TopRoomsTable, TopServicesTable } from '../../components/admin/TopTables.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Select from '../../components/ui/Select.jsx';
import { getRevenueYears, TOP_LIST_LIMIT } from '../../config/adminStats.js';
import useAuth from '../../hooks/useAuth.js';
import useFetch from '../../hooks/useFetch.js';

const PANEL = 'rounded-panel border border-line-soft bg-white';
// Hai mục cạnh nhau trong một khung, ngăn bằng đường kẻ.
const DIVIDED = 'divide-y divide-line-soft xl:divide-x xl:divide-y-0';

// /admin: việc cần làm trước, rồi số liệu và biểu đồ. Trang thống kê. Mỗi mục tự tải và tự báo lỗi, nên một request lỗi không làm hỏng cả trang.
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
    <>
      <AdminPageHeader title="Dashboard" subtitle={`Welcome, ${user.full_name}.`} />

      <div className="space-y-6">
        <section aria-labelledby="attention-heading" className={`p-4 sm:p-6 ${PANEL}`}>
          <h2 id="attention-heading" className="mb-3 text-lg font-semibold text-ink">
            Needs attention
          </h2>
          <AttentionList />
        </section>

        <section aria-label="Figures" className="px-4 py-2 sm:px-6">
          <PlainFigures overview={overview} feedback={feedback} />
        </section>

        <div className={PANEL}>
          <AsyncSection
            title={`Revenue by month (${year})`}
            request={revenue}
            action={yearSelect}
            skeletonClass="h-[25.5rem] sm:h-[24.25rem]"
          >
            {(data) => (
              <>
                <RevenueChart months={data.months} year={year} />
                <RevenueTable months={data.months} year={year} />
              </>
            )}
          </AsyncSection>
        </div>

        <div className={`grid xl:grid-cols-2 ${PANEL} ${DIVIDED}`}>
          <AsyncSection title="Revenue by source" request={overview} skeletonClass="h-56">
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
          <AsyncSection title="Bookings by status" request={overview} skeletonClass="h-56">
            {(data) => <BookingStatusList byStatus={data.bookings.by_status} />}
          </AsyncSection>
        </div>

        <div className={`grid xl:grid-cols-2 ${PANEL} ${DIVIDED}`}>
          <AsyncSection title="Top rooms" request={topRooms} skeletonClass="h-80">
            {(items) => <TopRoomsTable items={items} />}
          </AsyncSection>
          <AsyncSection title="Top services" request={topServices} skeletonClass="h-80">
            {(items) => <TopServicesTable items={items} />}
          </AsyncSection>
        </div>

        <div className={PANEL}>
          <AsyncSection title="Guest feedback" request={feedback} skeletonClass="h-64">
            {(data) => <FeedbackSummary feedback={data} />}
          </AsyncSection>
        </div>
      </div>
    </>
  );
}
