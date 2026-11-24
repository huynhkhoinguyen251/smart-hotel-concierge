import Button from '../ui/Button.jsx';
import Bone, { BoneGroup } from '../ui/Bone.jsx';

// Một mục của Dashboard, tự tải dữ liệu riêng: đang tải thì khung xám cùng cỡ nội dung, lỗi thì báo lỗi
// kèm nút "Try again" chỉ cho mục đó. Nhờ vậy một request lỗi không làm hỏng cả trang.
// request: kết quả của useFetch; children(data) dựng nội dung khi đã có dữ liệu; action: ở góc phải.
// skeletonClass: chiều cao của khung chờ, bằng chiều cao nội dung thật để trang không bị giật.
export default function AsyncSection({ title, request, action, skeletonClass = 'h-56', className = '', children }) {
  const renderBody = () => {
    if (request.loading) {
      return (
        <BoneGroup>
          <Bone className={skeletonClass} />
        </BoneGroup>
      );
    }
    if (request.error) {
      return (
        <div className="rounded-control bg-danger-tint px-4 py-4 text-sm text-danger-hover" role="alert">
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
    <section aria-label={title} className={`min-w-0 p-4 sm:p-6 ${className}`}>
      <div className="mb-4 flex min-h-10 flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {renderBody()}
    </section>
  );
}
