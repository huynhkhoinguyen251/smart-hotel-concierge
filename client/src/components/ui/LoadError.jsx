import Alert from './Alert.jsx';
import ErrorState from './ErrorState.jsx';

// Lỗi khi tải một danh sách: 400 (bộ lọc sai) hiện thông báo của backend;
// lỗi khác (mất mạng, 500...) hiện ErrorState kèm nút thử lại.
export default function LoadError({ error, onRetry }) {
  return error.status === 400 ? (
    <Alert type="error">{error.message}</Alert>
  ) : (
    <ErrorState message={error.message} onRetry={onRetry} />
  );
}
