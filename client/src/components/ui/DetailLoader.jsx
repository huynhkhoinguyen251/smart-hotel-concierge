import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import ErrorState from './ErrorState.jsx';
import NotFoundView from './NotFoundView.jsx';
import { PageSpinner } from './Spinner.jsx';

// Tải một mục theo :id cho trang chi tiết (của khách và của admin).
// - load(id): hàm gọi API.
// - notFound: props của NotFoundView { title, message, to, linkLabel }.
// - notFoundStatuses: các mã lỗi hiện NotFoundView. Trang của khách thêm 403 (đơn của người khác)
//   để không lộ đơn có tồn tại hay không.
// - errorClassName: khung bọc ErrorState (trang của khách cần lề; trang admin đã nằm trong layout).
// - children(data): dựng nội dung; nên gắn key theo id để component con giữ dữ liệu trong state.
export default function DetailLoader({ load, notFound, notFoundStatuses = [400, 404], errorClassName, children }) {
  const { id } = useParams();
  const request = useFetch(() => load(id), [id]);

  if (request.loading) return <PageSpinner />;
  if (request.error) {
    if (notFoundStatuses.includes(request.error.status)) return <NotFoundView {...notFound} />;
    const error = (
      <>
        <h1 className="sr-only">Could not load this page</h1>
        <ErrorState message={request.error.message} onRetry={request.retry} />
      </>
    );
    return errorClassName ? <div className={errorClassName}>{error}</div> : error;
  }
  return children(request.data);
}
