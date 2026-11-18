import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import ErrorState from '../ui/ErrorState.jsx';
import NotFoundView from '../ui/NotFoundView.jsx';
import { PageSpinner } from '../ui/Spinner.jsx';

// Tải một đơn theo :id cho trang chi tiết của admin. 400 hoặc 404 thì hiện NotFoundView;
// lỗi khác thì báo lỗi kèm nút thử lại. children(data) dựng nội dung; nên gắn key theo id
// để component con giữ đơn trong state và cập nhật sau mỗi lần đổi trạng thái.
export default function AdminDetailLoader({ load, notFound, children }) {
  const { id } = useParams();
  const request = useFetch(() => load(id), [id]);

  if (request.loading) return <PageSpinner />;
  if (request.error) {
    if ([400, 404].includes(request.error.status)) {
      return (
        <NotFoundView
          title={notFound.title}
          message={notFound.message}
          to={notFound.to}
          linkLabel={notFound.linkLabel}
        />
      );
    }
    return <ErrorState message={request.error.message} onRetry={request.retry} />;
  }
  return children(request.data);
}
