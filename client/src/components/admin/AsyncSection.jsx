import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Spinner from '../ui/Spinner.jsx';

// Một mục của Dashboard, tự tải dữ liệu riêng: đang tải thì vòng xoay, lỗi thì báo lỗi kèm
// nút "Try again" chỉ cho mục đó. Nhờ vậy một request lỗi không làm hỏng cả trang.
// request: kết quả của useFetch; children(data) dựng nội dung khi đã có dữ liệu; action: nút ở góc phải.
export default function AsyncSection({ title, request, action, className = '', children }) {
  const renderBody = () => {
    if (request.loading) {
      return (
        <div className="flex min-h-32 items-center justify-center text-teal-700">
          <Spinner />
        </div>
      );
    }
    if (request.error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700" role="alert">
          <p>Could not load this section. {request.error.message}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={request.retry}>
            Try again
          </Button>
        </div>
      );
    }
    return children(request.data);
  };

  return (
    <Card className={`min-w-0 ${className}`}>
      <section aria-label={title}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {action}
        </div>
        {renderBody()}
      </section>
    </Card>
  );
}
