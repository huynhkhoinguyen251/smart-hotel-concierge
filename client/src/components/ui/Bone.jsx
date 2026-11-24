// Khối xám giữ chỗ trong lúc tải, cùng kích thước với nội dung thật để trang không bị giật.
export default function Bone({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-panel bg-line-soft ${className}`} />;
}

// Bọc các Bone của một phần trang và báo cho trình đọc màn hình là đang tải.
export function BoneGroup({ className = '', children }) {
  return (
    <div role="status" aria-label="Loading" className={className}>
      {children}
    </div>
  );
}
