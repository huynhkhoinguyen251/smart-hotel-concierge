import FilterTabs from '../ui/FilterTabs.jsx';
import ListPanel, { ListBody } from '../ui/ListPanel.jsx';
import PageTitle from '../ui/PageTitle.jsx';

// Khung chung của các trang danh sách của khách (đơn, thanh toán, đánh giá, hỗ trợ):
// tiêu đề, thông báo, thanh chuyển mục, rồi một khung trắng gồm tab lọc, các dòng và phân trang.
// - action: nút bên phải tiêu đề; notice: thông báo đã dựng sẵn; sectionNav: thanh chuyển mục (My trips).
// - tabs: props của FilterTabs, không có thì không hiện tab.
// - list, items, empty, pagination: xem ListBody; renderItem(item) trả một <li>; listLabel: tên danh sách.
export default function AccountListPage({
  title,
  subtitle,
  action,
  notice,
  sectionNav,
  tabs,
  list,
  items,
  empty,
  pagination,
  listLabel,
  renderItem,
}) {
  return (
    <div className="shell py-8 lg:py-12">
      <PageTitle title={title} subtitle={subtitle} action={action} />
      {notice}
      {sectionNav && <div className="mb-4">{sectionNav}</div>}
      <ListPanel tabs={tabs && <FilterTabs {...tabs} />}>
        <ListBody list={list} items={items} empty={empty} pagination={pagination}>
          <ul className="divide-y divide-line-soft" aria-label={listLabel}>
            {items?.map(renderItem)}
          </ul>
        </ListBody>
      </ListPanel>
    </div>
  );
}
