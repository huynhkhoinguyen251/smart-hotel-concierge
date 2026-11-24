import { useRef } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button as AntButton, Dropdown } from 'antd';

// Thao tác của một dòng: tối đa một nút hiện ra (primary), còn lại trong danh sách "More".
// - primary: nút hoặc link đã dựng sẵn (có thể null).
// - items: [{ key, label, danger, disabled, reason, onClick }]. Thao tác nguy hiểm là chữ đỏ.
//   Thao tác bị khóa vẫn hiện lý do ngay dưới tên.
// - itemLabel: ví dụ "booking #8", dùng cho trình đọc màn hình. note: dòng ghi chú nhỏ bên dưới.
export default function RowActions({ primary, items = [], itemLabel, note, disabled = false }) {
  const moreRef = useRef(null);

  const menuItems = items.map((item) => ({
    key: item.key,
    danger: item.danger,
    disabled: item.disabled || Boolean(item.reason),
    label: (
      <>
        {item.label}
        <span className="sr-only">, {itemLabel}</span>
        {item.reason && <span className="block text-xs text-ink-soft">{item.reason}</span>}
      </>
    ),
  }));

  const handleClick = ({ key }) => {
    const action = items.find((item) => item.key === key);
    // Chờ danh sách xử lý xong phím Enter, rồi trả con trỏ về nút More trước khi chạy thao tác:
    // hộp thoại đóng lại thì con trỏ quay về đúng dòng này.
    setTimeout(() => {
      moreRef.current?.focus();
      action?.onClick();
    }, 0);
  };

  return (
    <div className="lg:flex lg:flex-col lg:items-end">
      <div className="flex items-center gap-2">
        {primary}
        {menuItems.length > 0 && (
          <Dropdown
            menu={{ items: menuItems, onClick: handleClick }}
            trigger={['click']}
            placement="bottomRight"
            autoFocus
            disabled={disabled}
          >
            <AntButton
              ref={moreRef}
              size="small"
              icon={<DownOutlined className="text-xs" />}
              iconPlacement="end"
              disabled={disabled}
              aria-haspopup="menu"
              aria-label={`More actions for ${itemLabel}`}
            >
              More
            </AntButton>
          </Dropdown>
        )}
      </div>
      {note && <p className="mt-1 max-w-56 text-xs text-pretty text-ink-soft lg:text-right">{note}</p>}
    </div>
  );
}
