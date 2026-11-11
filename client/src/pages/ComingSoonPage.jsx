import Card from '../components/ui/Card.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';

// Trang tạm cho các phần sẽ làm ở bước sau.
export default function ComingSoonPage({ title }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageTitle title={title} />
      <Card className="text-center">
        <p className="text-lg font-semibold text-slate-800">Coming soon</p>
        <p className="mt-1 text-sm text-slate-500">This page is under construction.</p>
      </Card>
    </div>
  );
}
