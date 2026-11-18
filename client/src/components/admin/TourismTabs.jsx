import AdminSubNav from './AdminSubNav.jsx';

const TABS = [
  { to: '/admin/tourism', label: 'Tour bookings' },
  { to: '/admin/tourism/transport', label: 'Transport' },
];

// Tab phụ của mục Tourism: đơn tour và đơn vận chuyển là hai trang riêng.
export default function TourismTabs() {
  return <AdminSubNav tabs={TABS} label="Tourism sections" />;
}
