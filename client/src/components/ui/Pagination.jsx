import { Pagination as AntPagination } from 'antd';

const LABELS = { prev: 'Previous', next: 'Next' };

// Nút Previous/Next bằng chữ; số trang giữ mặc định của antd. Thẻ <li> bên ngoài nhận bàn phím.
const renderItem = (page, type, element) =>
  LABELS[type] ? (
    <button type="button" tabIndex={-1} className="ant-pagination-item-link w-auto! px-3 text-sm">
      {LABELS[type]}
    </button>
  ) : (
    element
  );

// Phân trang. Chỉ có một trang thì không hiện.
export default function Pagination({ page, limit, total, onPageChange, className = '' }) {
  if (Math.ceil(total / limit) <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className={className}>
      <AntPagination
        align="center"
        current={page}
        pageSize={limit}
        total={total}
        showSizeChanger={false}
        showLessItems
        showTitle={false}
        itemRender={renderItem}
        onChange={onPageChange}
      />
    </nav>
  );
}
