import client from './client.js';

// Upload một ảnh (multipart/form-data, trường "image"). Trả { image_url } dạng /uploads/<tên>.
// Phải ghi đè Content-Type mặc định (application/json) của client: nếu còn header JSON,
// axios sẽ đổi FormData thành chuỗi JSON và file không tới được server. Với multipart/form-data,
// axios giữ nguyên FormData, rồi trên trình duyệt tự bỏ header để trình duyệt thêm boundary.
// onProgress(percent) được gọi trong lúc gửi file.
export const uploadAdminImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  const body = await client.post('/admin/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return body.data;
};
