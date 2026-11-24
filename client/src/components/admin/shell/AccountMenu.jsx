import { DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth.js';

// Nút tài khoản ở góc phải thanh trên của khu admin; trong danh sách có Logout.
export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    {
      key: 'account',
      type: 'group',
      label: <span className="block max-w-56 text-xs wrap-anywhere text-ink-soft">{user.email}</span>,
    },
    { type: 'divider' },
    { key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'Logout' },
  ];

  const handleClick = ({ key }) => {
    if (key !== 'logout') return;
    logout();
    navigate('/');
  };

  return (
    <Dropdown menu={{ items, onClick: handleClick }} trigger={['click']} placement="bottomRight" autoFocus>
      <button
        type="button"
        aria-haspopup="menu"
        aria-label={user.full_name}
        className="flex h-11 items-center gap-2 rounded-control px-2 text-sm font-medium text-ink hover:bg-ground"
      >
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-full bg-sea-tint text-xs font-bold text-sea"
        >
          {user.full_name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-40 truncate sm:inline">{user.full_name}</span>
        <DownOutlined aria-hidden="true" className="text-xs" />
      </button>
    </Dropdown>
  );
}
