import { useMemo } from 'react';
import { StyleProvider } from '@ant-design/cssinjs';
import { App, ConfigProvider } from 'antd';
import { createTheme } from '../../config/theme.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';

const WAVE = { disabled: true };

// Áp dụng theme của Ant Design một lần cho cả ứng dụng.
// - StyleProvider layer: đưa CSS của antd vào @layer antd, để lớp Tailwind ghi đè được (xem index.css).
// - App component={false}: không bọc thêm thẻ div, nên cỡ chữ của trang không bị đổi.
export default function ThemeProvider({ children }) {
  const reducedMotion = useReducedMotion();
  const theme = useMemo(() => createTheme({ motion: !reducedMotion }), [reducedMotion]);

  return (
    <StyleProvider layer>
      <ConfigProvider theme={theme} wave={WAVE}>
        <App component={false}>{children}</App>
      </ConfigProvider>
    </StyleProvider>
  );
}
