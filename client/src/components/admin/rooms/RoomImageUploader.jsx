import { useState } from 'react';
import { Checkbox } from 'antd';
import { addAdminRoomImage } from '../../../api/adminRooms.api.js';
import { ImageFileInput, ImageModeSwitch, ImageUrlInput } from '../ImageInputs.jsx';

// Ô "Use as primary image" dùng chung cho hai cách thêm ảnh.
function PrimaryCheckbox({ checked, onChange, disabled }) {
  return (
    <Checkbox checked={checked} onChange={(event) => onChange(event.target.checked)} disabled={disabled}>
      Use as primary image
    </Checkbox>
  );
}

// Thêm ảnh cho phòng: upload file (kiểm tra loại, dung lượng, xem trước, tiến trình) hoặc dán link,
// rồi gắn ảnh vào phòng (POST /admin/rooms/:id/images). Phần chọn file và dán link ở ImageInputs.jsx.
// onAdded(message) để trang cha tải lại danh sách ảnh và hiện thông báo.
export default function RoomImageUploader({ room, onAdded }) {
  const [mode, setMode] = useState('');
  const [primary, setPrimary] = useState(false);

  const addImage = async (imageUrl, message) => {
    await addAdminRoomImage(room.id, { image_url: imageUrl, is_primary: primary });
    setPrimary(false);
    onAdded(message);
  };

  const renderPrimary = (busy) => <PrimaryCheckbox checked={primary} onChange={setPrimary} disabled={busy} />;

  return (
    <div className="rounded-control bg-ground p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink">Add an image</h3>
      <ImageModeSwitch
        mode={mode}
        onChange={(value) => {
          setMode(value);
          setPrimary(false);
        }}
      />
      {mode === 'url' ? (
        <ImageUrlInput onSubmit={(url) => addImage(url, 'The image has been added.')} renderExtra={renderPrimary} />
      ) : (
        <ImageFileInput
          onUploaded={(url) => addImage(url, 'The image has been uploaded.')}
          renderExtra={renderPrimary}
        />
      )}
    </div>
  );
}
