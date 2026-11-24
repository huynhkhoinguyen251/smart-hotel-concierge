import usePageTitle from '../../hooks/usePageTitle.js';
import DetailLayout from '../detail/DetailLayout.jsx';
import { DetailSection } from '../detail/DetailParts.jsx';
import DetailRow from '../ui/DetailRow.jsx';

// Khách (họ tên, email) ở mọi trang chi tiết của admin. Số điện thoại hiện khi API có trả.
export function AdminGuestSection({ user, title = 'Guest' }) {
  return (
    <DetailSection title={title}>
      <dl className="text-sm">
        <DetailRow label="Name">
          <span className="wrap-anywhere">{user?.full_name ?? '-'}</span>
        </DetailRow>
        <DetailRow label="Email">
          {user?.email ? (
            <a href={`mailto:${user.email}`} className="wrap-anywhere text-sea hover:text-sea-hover hover:underline">
              {user.email}
            </a>
          ) : (
            '-'
          )}
        </DetailRow>
        {user?.phone && <DetailRow label="Phone">{user.phone}</DetailRow>}
      </dl>
    </DetailSection>
  );
}

// Trang chi tiết của admin: khung chung DetailLayout, thêm thanh chuyển mục (subNav) ở trên cùng.
export default function AdminDetailLayout({ subNav, ...props }) {
  usePageTitle(`Admin: ${props.title}`);
  return (
    <div className="mx-auto max-w-6xl">
      {subNav && <div className="mb-4">{subNav}</div>}
      <DetailLayout {...props} />
    </div>
  );
}
