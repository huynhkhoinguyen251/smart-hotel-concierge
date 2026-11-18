import { useEffect, useId, useRef, useState } from 'react';
import { addAdminRoomImage } from '../../../api/adminRooms.api.js';
import { uploadAdminImage } from '../../../api/adminUploads.api.js';
import { IMAGE_ACCEPT, IMAGE_URL_MAX_LENGTH } from '../../../config/adminCatalog.js';
import { formatFileSize, validateImageFile, validateImageUrl } from '../../../utils/catalogValidation.js';
import Alert from '../../ui/Alert.jsx';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';

// Ô "Use as primary image" dùng chung cho hai cách thêm ảnh.
function PrimaryCheckbox({ checked, onChange, disabled }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-slate-700">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
      />
      Use as primary image
    </label>
  );
}

// Cách 1: chọn file trên máy → kiểm tra loại và dung lượng → xem trước → upload → gắn vào phòng.
function FileUpload({ room, onAdded }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [primary, setPrimary] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Thu hồi link xem trước cũ để không giữ ảnh trong bộ nhớ trình duyệt.
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const reset = () => {
    setFile(null);
    setPreviewUrl('');
    setPrimary(false);
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
    setBusy(true);
    setError('');
    try {
      const { image_url } = await uploadAdminImage(file, setProgress);
      await addAdminRoomImage(room.id, { image_url, is_primary: primary });
      reset();
      onAdded('The image has been uploaded.');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setBusy(false);
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
            <PrimaryCheckbox checked={primary} onChange={setPrimary} disabled={busy} />
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
                Upload image
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

// Cách 2: dán link ảnh (http(s)://... hoặc /uploads/...).
function UrlForm({ room, onAdded }) {
  const [url, setUrl] = useState('');
  const [primary, setPrimary] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const urlError = validateImageUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }
    setBusy(true);
    try {
      await addAdminRoomImage(room.id, { image_url: url.trim(), is_primary: primary });
      setUrl('');
      setPrimary(false);
      onAdded('The image has been added.');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3" aria-label="Add image by URL">
      <Input
        label="Image URL"
        value={url}
        onChange={(event) => {
          setUrl(event.target.value);
          setError('');
        }}
        maxLength={IMAGE_URL_MAX_LENGTH}
        placeholder="https://... or /uploads/..."
        error={error}
        disabled={busy}
      />
      <PrimaryCheckbox checked={primary} onChange={setPrimary} disabled={busy} />
      <Button type="submit" size="sm" loading={busy}>
        Add image
      </Button>
    </form>
  );
}

const MODES = [
  { value: '', label: 'Upload a file' },
  { value: 'url', label: 'Paste a URL' },
];

// Thêm ảnh cho phòng. Chọn cách bằng hai nút; lựa chọn chỉ giữ trong state của trang.
// onAdded(message) để trang cha tải lại danh sách ảnh và hiện thông báo.
export default function RoomImageUploader({ room, onAdded }) {
  const [mode, setMode] = useState('');
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Add an image</h3>
      <div className="mb-4 flex gap-2" role="group" aria-label="How to add the image">
        {MODES.map((item) => (
          <Button
            key={item.value || 'file'}
            size="sm"
            variant={mode === item.value ? 'primary' : 'secondary'}
            aria-pressed={mode === item.value}
            onClick={() => setMode(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {mode === 'url' ? <UrlForm room={room} onAdded={onAdded} /> : <FileUpload room={room} onAdded={onAdded} />}
    </div>
  );
}
