import useMediaQuery from './useMediaQuery.js';

// true khi người dùng bật "reduce motion" trong hệ điều hành.
export default function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
