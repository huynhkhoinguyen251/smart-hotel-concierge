import { ROOM_CATALOG_NAV } from '../../../config/adminCatalog.js';
import ButtonLink from '../../ui/ButtonLink.jsx';
import AdminPageHeader from '../AdminPageHeader.jsx';
import SectionNav from '../../ui/SectionNav.jsx';

// Phần đầu chung của mục Rooms: tiêu đề, nút chính (ví dụ "Add room") và thanh Rooms / Room types / Amenities.
// action: { to, label } tùy chọn.
export default function RoomCatalogHeader({ title, subtitle, action }) {
  return (
    <AdminPageHeader
      title={title}
      subtitle={subtitle}
      action={action && <ButtonLink to={action.to}>{action.label}</ButtonLink>}
      subNav={<SectionNav {...ROOM_CATALOG_NAV} />}
    />
  );
}
