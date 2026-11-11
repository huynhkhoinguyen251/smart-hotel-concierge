const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

// 1800000 thành "1,800,000 VND". Giá trị không phải số thì trả chuỗi rỗng.
export default function formatCurrency(amount) {
  const value = Number(amount);
  if (amount === null || amount === undefined || Number.isNaN(value)) {
    return '';
  }
  return `${numberFormat.format(value)} VND`;
}
