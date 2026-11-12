import { useCallback, useEffect, useState } from 'react';

// Gọi API khi trang mở và mỗi khi deps đổi. Trả { data, error, loading, retry }.
// deps chỉ gồm giá trị đơn giản (chuỗi, số). Kết quả của lần gọi cũ bị bỏ qua
// nếu deps đã đổi trước khi nó trả về.
export default function useFetch(fetcher, deps) {
  const [attempt, setAttempt] = useState(0);
  // Mỗi bộ deps (kèm số lần thử lại) là một "khóa" riêng.
  const requestKey = JSON.stringify([...deps, attempt]);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    let active = true;
    fetcher()
      .then((data) => {
        if (active) setResult({ key: requestKey, data, error: null });
      })
      .catch((error) => {
        if (active) setResult({ key: requestKey, data: null, error });
      });
    return () => {
      active = false;
    };
    // fetcher là hàm mới mỗi lần render, nên chỉ theo dõi khóa.
  }, [requestKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  // Kết quả đang có thuộc về khóa cũ nghĩa là request mới chưa trả về.
  const loading = result.key !== requestKey;
  return { data: result.data, error: loading ? null : result.error, loading, retry };
}
