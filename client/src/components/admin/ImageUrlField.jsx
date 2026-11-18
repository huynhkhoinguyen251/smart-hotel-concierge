import { useState } from 'react';
import RoomImage from '../rooms/RoomImage.jsx';
import Button from '../ui/Button.jsx';
import { ImageFileInput, ImageModeSwitch, ImageUrlInput } from './ImageInputs.jsx';

// Ảnh duy nhất của một dịch vụ, món ăn hoặc tour (cột image_url), dùng trong form của hộp thoại.
// value: link ảnh hiện tại ('' = không có ảnh); onChange(url) đổi giá trị trong form.
// Ảnh chỉ được lưu khi admin bấm Save của form. "Remove image" đặt '' (gửi null).
// onBusyChange(busy): đang upload, để form khóa nút Save.
export default function ImageUrlField({ label = 'Image', itemName, value, onChange, error, onBusyChange, disabled }) {
  const [mode, setMode] = useState('');
  const [note, setNote] = useState('');
  const alt = itemName ? `Image of ${itemName}` : 'Image preview';

  const choose = (url, text) => {
    onChange(url);
    setNote(text);
  };

  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">{label}</legend>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <RoomImage src={value || null} alt={alt} className="aspect-[4/3] w-full shrink-0 rounded-lg sm:w-40" />
        <div className="min-w-0 space-y-2 text-sm">
          {value ? (
            <>
              <p className="break-all text-slate-600">{value}</p>
              <Button size="sm" variant="secondary" onClick={() => choose('', 'The image will be removed when you save.')}>
                Remove image
              </Button>
            </>
          ) : (
            <p className="text-slate-500">No image. Guests see a grey placeholder.</p>
          )}
          {note && (
            <p className="text-xs text-teal-800" aria-live="polite">
              {note}
            </p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-900">{value ? 'Replace the image' : 'Add an image'}</p>
        <ImageModeSwitch mode={mode} onChange={setMode} />
        {mode === 'url' ? (
          <ImageUrlInput
            submitLabel="Use this image"
            onSubmit={(url) => choose(url, 'Image chosen. Save to keep it.')}
          />
        ) : (
          <ImageFileInput
            onBusyChange={onBusyChange}
            onUploaded={(url) => choose(url, 'Image uploaded. Save to keep it.')}
          />
        )}
      </div>
    </fieldset>
  );
}
