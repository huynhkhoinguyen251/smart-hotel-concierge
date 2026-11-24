import NotFoundView from '../components/ui/NotFoundView.jsx';

export default function NotFoundPage() {
  return (
    <NotFoundView
      title="Page not found"
      message="The page you are looking for does not exist."
      to="/"
      linkLabel="Back to home"
    />
  );
}
