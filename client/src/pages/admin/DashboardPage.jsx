import Card from '../../components/ui/Card.jsx';
import PageTitle from '../../components/ui/PageTitle.jsx';
import useAuth from '../../hooks/useAuth.js';

// Trang tạm. Thống kê và biểu đồ sẽ làm ở bước sau.
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Dashboard" subtitle={`Welcome, ${user.full_name}.`} />
      <Card>
        <p className="text-slate-700">
          Statistics and charts will appear here. Use the menu to manage the hotel.
        </p>
      </Card>
    </div>
  );
}
