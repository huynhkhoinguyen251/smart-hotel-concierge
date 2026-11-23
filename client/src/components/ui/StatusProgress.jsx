import { Steps } from 'antd';
import { getStatusConfig } from '../../config/statuses.js';
import Alert from './Alert.jsx';

const CLASS_NAMES = { itemTitle: 'text-sm font-medium' };
const LAST_STEP_CLASS_NAMES = { section: 'min-h-0' };

const getStepStatus = (index, currentIndex, lastIndex) => {
  // Bước cuối (completed) cũng hiện dấu tích, vì đơn đã xong hết.
  if (index < currentIndex || (index === currentIndex && index === lastIndex)) return 'finish';
  return index === currentIndex ? 'process' : 'wait';
};

// Tiến trình trạng thái theo các bước (đơn đồ ăn, đơn tour, đơn vận chuyển...).
// steps: các trạng thái theo thứ tự. Đơn bị hủy không nằm trên đường này, nên hiện cancelledMessage.
// Điện thoại: các bước xếp dọc; màn hình rộng: xếp ngang.
export default function StatusProgress({ status, steps, cancelledMessage, label = 'Progress' }) {
  if (status === 'cancelled') {
    return <Alert type="error">{cancelledMessage}</Alert>;
  }

  const currentIndex = steps.indexOf(status);

  return (
    <Steps
      role="list"
      aria-label={label}
      titlePlacement="vertical"
      classNames={CLASS_NAMES}
      current={currentIndex}
      items={steps.map((step, index) => ({
        key: step,
        title: getStatusConfig(step).label,
        status: getStepStatus(index, currentIndex, steps.length - 1),
        // Bước cuối không chừa khoảng trống bên dưới khi xếp dọc.
        classNames: index === steps.length - 1 ? LAST_STEP_CLASS_NAMES : undefined,
        role: 'listitem',
        'aria-current': index === currentIndex ? 'step' : undefined,
      }))}
    />
  );
}
