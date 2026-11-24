import NotFoundView from '../components/ui/NotFoundView.jsx';

// Hiện khi người dùng đã đăng nhập nhưng không có quyền admin.
export default function ForbiddenPage() {
  return (
    <main>
      <NotFoundView
        title="Access not allowed"
        message="You do not have permission to view this page. It is only available to hotel staff."
        to="/"
        linkLabel="Back to home"
      />
    </main>
  );
}
