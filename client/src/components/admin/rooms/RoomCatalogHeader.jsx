import { Link } from 'react-router-dom';
import { ROOM_CATALOG_TABS } from '../../../config/adminCatalog.js';
import AdminSubNav from '../AdminSubNav.jsx';

// Phần đầu chung của mục Rooms: tiêu đề, nút chính (ví dụ "Add room") và tab Rooms / Room types / Amenities.
// action: { to, label } tùy chọn.
export default function RoomCatalogHeader({ title, subtitle, action }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-slate-600">{subtitle}</p>}
        </div>
        {action && (
          <Link
            to={action.to}
            className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            {action.label}
          </Link>
        )}
      </div>
      <AdminSubNav tabs={ROOM_CATALOG_TABS} label="Room catalog" />
    </>
  );
}
