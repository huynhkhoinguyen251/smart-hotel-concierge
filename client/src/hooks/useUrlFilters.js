import { useSearchParams } from 'react-router-dom';
import { cleanParams, readPage } from '../utils/queryString.js';
import scrollToTop from '../utils/scrollToTop.js';

// Bộ lọc của một trang danh sách, đọc từ địa chỉ trang (?status=...&page=2).
// schema: { tên: rule } theo đúng thứ tự trên địa chỉ trang. rule là một trong hai:
// - options: [{ value, label }] (tab hoặc ô chọn). Giá trị lạ thì lấy options[0] (thường là "All").
// - read(searchParams): hàm tự đọc và kiểm tra (ngày, id, từ khóa...), trả '' khi không có.
// Trả:
// - values: { tên: giá trị đã kiểm tra }; selected: { tên: option đang chọn } cho các rule là options.
// - page, searchParams, setSearchParams.
// - updateUrl(changes): đổi một vài bộ lọc, giữ các bộ lọc còn lại.
// - goToPage(n): chuyển trang (trang 1 thì bỏ ?page) rồi cuộn lên đầu trang.
export default function useUrlFilters(schema) {
  const [searchParams, setSearchParams] = useSearchParams();
  const values = {};
  const selected = {};
  Object.entries(schema).forEach(([name, rule]) => {
    if (typeof rule === 'function') {
      values[name] = rule(searchParams);
      return;
    }
    const raw = searchParams.get(name) ?? '';
    selected[name] = rule.find((option) => option.value === raw) ?? rule[0];
    values[name] = selected[name].value;
  });
  const page = readPage(searchParams);

  const updateUrl = (changes) => setSearchParams(cleanParams({ ...values, ...changes }));
  const goToPage = (nextPage) => {
    updateUrl({ page: nextPage > 1 ? nextPage : '' });
    scrollToTop();
  };

  return { values, selected, page, searchParams, setSearchParams, updateUrl, goToPage };
}
