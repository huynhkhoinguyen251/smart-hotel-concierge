import { useEffect, useId, useRef, useState } from 'react';
import { Progress, Segmented } from 'antd';
import { uploadAdminImage } from '../../api/adminUploads.api.js';
import { IMAGE_ACCEPT, IMAGE_URL_MAX_LENGTH } from '../../config/adminCatalog.js';
import { formatFileSize, validateImageFile, validateImageUrl } from '../../utils/catalogValidation.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

// Các phần dùng chung để thêm một ảnh: chọn cách (upload file / dán link), upload file, dán link.
// Dùng cho ảnh phòng (RoomImageUploader) và ảnh của dịch vụ, món ăn, tour (ImageUrlField).
// Không dùng thẻ <form>, vì ImageUrlField nằm bên trong form của hộp thoại (form lồng form không hợp lệ).

const IMAGE_MODES = [
  { value: 'file', label: 'Upload a file' },
  { value: 'url', label: 'Paste a URL' },
];

// Chọn cách thêm ảnh. mode: '' (upload file) hoặc 'url'.
export function ImageModeSwitch({ mode, onChange, disabled }) {
  return (
    <Segmented
      aria-label="How to add the image"
      className="mb-4"
      options={IMAGE_MODES}
      value={mode || 'file'}
      disabled={disabled}
      onChange={(value) => onChange(value === 'file' ? '' : value)}
    />
  );
}

// Chọn file → kiểm tra loại và dung lượng → xem trước → upload (POST /admin/uploads) → onUploaded(image_url).
// onUploaded có thể là hàm async (ví dụ gắn ảnh vào phòng); lỗi của nó cũng hiện ở đây.
// renderExtra(busy): phần thêm dưới tên file (ví dụ ô "Use as primary image").
// onBusyChange(busy): báo cho trang cha biết đang upload (ví dụ để khóa nút Save).
export function ImageFileInput({ onUploaded, renderExtra, onBusyChange, submitLabel = 'Upload image' }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Thu hồi link xem trước cũ để không giữ ảnh trong bộ nhớ trình duyệt.
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const changeBusy = (value) => {
    setBusy(value);
    onBusyChange?.(value);
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (event) => {
    const chosen = event.target.files?.[0] ?? null;
    setError('');
    setProgress(0);
    if (!chosen) {
      reset();
      return;
    }
    const fileError = validateImageFile(chosen);
    if (fileError) {
      setError(fileError);
      reset();
      return;
    }
    setFile(chosen);
    setPreviewUrl(URL.createObjectURL(chosen));
  };

  const handleUpload = async () => {
    changeBusy(true);
    setError('');
    try {
      const { image_url } = await uploadAdminImage(file, setProgress);
      await onUploaded(image_url);
      reset();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      changeBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          Image file
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handleFile}
          disabled={busy}
          className="block w-full text-sm text-ink file:mr-3 file:h-10 file:cursor-pointer file:rounded-control file:border file:border-solid file:border-line file:bg-white file:px-4 file:text-sm file:font-semibold file:text-ink hover:file:border-sea hover:file:text-sea"
        />
        <p className="mt-1 text-xs text-ink-soft">JPEG, PNG or WebP, up to 5 MB.</p>
      </div>

      {file && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <img src={previewUrl} alt="Preview of the chosen image" className="aspect-[4/3] w-full rounded-control object-cover sm:w-40" />
          <div className="min-w-0 space-y-3 text-sm">
            <p className="break-all text-ink">
              {file.name} <span className="text-ink-soft">({formatFileSize(file.size)})</span>
            </p>
            {renderExtra?.(busy)}
            {busy && (
              <div>
                <Progress
                  percent={progress}
                  showInfo={false}
                  size="small"
                  aria-label="Upload progress"
                />
                <p className="mt-1 text-xs text-ink-soft">{progress < 100 ? `Uploading ${progress}%` : 'Saving...'}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" loading={busy} onClick={handleUpload}>
                {submitLabel}
              </Button>
              <Button size="sm" variant="secondary" disabled={busy} onClick={reset}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
      <div aria-live="polite">
        <Alert type="error">{error}</Alert>
      </div>
    </div>
  );
}

// Dán link ảnh (http(s)://... hoặc /uploads/...) → onSubmit(url). onSubmit có thể là hàm async.
// Nhấn Enter trong ô nhập cũng gửi, và không gửi form bên ngoài.
export function ImageUrlInput({ onSubmit, renderExtra, submitLabel = 'Add image', label = 'Image URL' }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const urlError = validateImageUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }
    setBusy(true);
    try {
      await onSubmit(url.trim());
      setUrl('');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3" role="group" aria-label="Add image by URL">
      <Input
        label={label}
        value={url}
        onChange={(event) => {
          setUrl(event.target.value);
          setError('');
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          }
        }}
        maxLength={IMAGE_URL_MAX_LENGTH}
        placeholder="https://... or /uploads/..."
        error={error}
        disabled={busy}
      />
      {renderExtra?.(busy)}
      <Button size="sm" variant="secondary" loading={busy} onClick={submit}>
        {submitLabel}
      </Button>
    </div>
  );
}
