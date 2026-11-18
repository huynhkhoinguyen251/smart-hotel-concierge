import { useEffect, useId, useRef, useState } from 'react';
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
  { value: '', label: 'Upload a file' },
  { value: 'url', label: 'Paste a URL' },
];

// Hai nút chọn cách thêm ảnh.
export function ImageModeSwitch({ mode, onChange, disabled }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="How to add the image">
      {IMAGE_MODES.map((item) => (
        <Button
          key={item.value || 'file'}
          size="sm"
          variant={mode === item.value ? 'primary' : 'secondary'}
          aria-pressed={mode === item.value}
          disabled={disabled}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
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
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          Image file
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handleFile}
          disabled={busy}
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
        />
        <p className="mt-1 text-xs text-slate-500">JPEG, PNG or WebP, up to 5 MB.</p>
      </div>

      {file && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <img src={previewUrl} alt="Preview of the chosen image" className="aspect-[4/3] w-full rounded-lg object-cover sm:w-40" />
          <div className="min-w-0 space-y-3 text-sm">
            <p className="break-all text-slate-700">
              {file.name} <span className="text-slate-500">({formatFileSize(file.size)})</span>
            </p>
            {renderExtra?.(busy)}
            {busy && (
              <div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="Upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div className="h-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{progress < 100 ? `Uploading ${progress}%` : 'Saving...'}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" loading={busy} onClick={handleUpload}>
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
      <Button size="sm" loading={busy} onClick={submit}>
        {submitLabel}
      </Button>
    </div>
  );
}
