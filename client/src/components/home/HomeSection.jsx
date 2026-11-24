import useFetch from '../../hooks/useFetch.js';
import ErrorState from '../ui/ErrorState.jsx';
import MoreLink from '../ui/MoreLink.jsx';

// Một phần của trang chủ: tiêu đề, link "xem thêm" và nội dung. Mỗi phần tự tải và tự báo lỗi,
// nên một API hỏng không làm mất các phần khác.
// load: hàm gọi API; skeleton: khung chờ; children(data): nội dung.
export default function HomeSection({ title, to, linkLabel, load, skeleton, children }) {
  const { data, error, loading, retry } = useFetch(load, []);

  const renderBody = () => {
    if (loading) return skeleton;
    if (error) return <ErrorState message={error.message} onRetry={retry} />;
    return children(data);
  };

  return (
    <section className="shell mt-20 lg:mt-28">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 lg:mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
        <MoreLink to={to}>{linkLabel}</MoreLink>
      </div>
      {renderBody()}
    </section>
  );
}
