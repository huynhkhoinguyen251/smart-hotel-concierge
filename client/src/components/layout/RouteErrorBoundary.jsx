import { Component } from 'react';
import Button from '../ui/Button.jsx';
import PlainMessage from '../ui/PlainMessage.jsx';

// Lỗi khi tải file của một trang, ví dụ mất mạng hoặc web vừa có bản mới nên file cũ không còn.
const CHUNK_ERROR = /dynamically imported module|module script|Loading chunk|preload/i;

const MESSAGES = {
  chunk: {
    title: 'This page could not be loaded',
    message: 'The website may have just been updated, or your connection was interrupted. Reload the page to continue.',
  },
  other: {
    title: 'Something went wrong',
    message: 'This page stopped working. Reload the page to try again.',
  },
};

// Bắt lỗi khi dựng trang, để khách thấy một thông báo và nút "Reload page" thay vì trang trắng.
// resetKey đổi (sang trang khác) thì bỏ lỗi và dựng lại.
export default class RouteErrorBoundary extends Component {
  state = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    return props.resetKey === state.resetKey ? null : { error: null, resetKey: props.resetKey };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const text = CHUNK_ERROR.test(error.message) ? MESSAGES.chunk : MESSAGES.other;
    return (
      <div role="alert">
        <PlainMessage {...text} action={<Button onClick={() => window.location.reload()}>Reload page</Button>} />
      </div>
    );
  }
}
