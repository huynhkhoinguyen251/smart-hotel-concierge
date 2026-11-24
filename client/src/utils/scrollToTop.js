// Cuộn lên đầu trang. Người dùng bật "reduce motion" thì nhảy thẳng, không cuộn mượt.
export default function scrollToTop() {
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
}
