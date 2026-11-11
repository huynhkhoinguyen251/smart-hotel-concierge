import Card from '../ui/Card.jsx';

// Khung chung của trang đăng nhập và đăng ký: một thẻ ở giữa màn hình.
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex justify-center bg-slate-50 px-4 py-12 sm:py-16">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
      </Card>
    </div>
  );
}
