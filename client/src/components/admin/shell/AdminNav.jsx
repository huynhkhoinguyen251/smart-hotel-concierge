import {
  BarChartOutlined,
  CalendarOutlined,
  CarOutlined,
  CoffeeOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  HomeOutlined,
  MessageOutlined,
  StarOutlined,
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_GROUPS } from '../../../config/navigation.js';

const ICONS = {
  '/admin': BarChartOutlined,
  '/admin/bookings': CalendarOutlined,
  '/admin/services': CustomerServiceOutlined,
  '/admin/food-orders': CoffeeOutlined,
  '/admin/tourism': CarOutlined,
  '/admin/tickets': MessageOutlined,
  '/admin/rooms': HomeOutlined,
  '/admin/reviews': StarOutlined,
  '/admin/users': TeamOutlined,
  '/admin/payments': CreditCardOutlined,
  '/admin/vouchers': TagOutlined,
};

const getLinkClass =
  (collapsed) =>
  ({ isActive }) =>
    `flex h-10 items-center gap-3 rounded-control text-sm font-medium transition-colors duration-150 focus-visible:outline-white ${
      collapsed ? 'justify-center' : 'px-3'
    } ${isActive ? 'bg-sea text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'}`;

// Danh sách link của khu admin, chia nhóm. Dùng trong cột trái (máy tính) và ngăn kéo (màn hình nhỏ).
// collapsed: chỉ hiện biểu tượng; tên mục nằm trong tooltip và cho trình đọc màn hình.
export default function AdminNav({ collapsed = false, onNavigate }) {
  return (
    <nav aria-label="Admin" className="space-y-5">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.label || 'main'}>
          {group.label && (
            <p className={collapsed ? 'mx-3 mb-3 border-t border-white/20' : 'mb-1 px-3 text-xs text-white/70'}>
              <span className={collapsed ? 'sr-only' : ''}>{group.label}</span>
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.to];
              return (
                <li key={item.to}>
                  <Tooltip title={collapsed ? item.label : ''} placement="right">
                    <NavLink to={item.to} end={item.end} className={getLinkClass(collapsed)} onClick={onNavigate}>
                      <Icon aria-hidden="true" className="text-base" />
                      <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
                    </NavLink>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
