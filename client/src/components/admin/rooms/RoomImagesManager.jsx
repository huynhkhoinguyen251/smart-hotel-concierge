import { useState } from 'react';
import { deleteAdminRoomImage, setAdminRoomImagePrimary } from '../../../api/adminRooms.api.js';
import RoomImage from '../../rooms/RoomImage.jsx';
import Alert from '../../ui/Alert.jsx';
import Button from '../../ui/Button.jsx';
import ConfirmDialog from '../../ui/ConfirmDialog.jsx';
import { AdminSection } from '../AdminDetailLayout.jsx';
import RoomImageUploader from './RoomImageUploader.jsx';

// Ảnh của một phòng: lưới ảnh (ảnh chính đứng đầu, có nhãn "Primary"), đặt ảnh chính, xóa ảnh,
// và thêm ảnh mới. Sau mỗi thay đổi gọi onChanged() để trang cha tải lại phòng (ảnh mới nhất).
// RoomImage dùng getImageUrl, nên ảnh /uploads/... được tải từ địa chỉ của backend.
export default function RoomImagesManager({ room, onChanged }) {
  const [message, setMessage] = useState({ type: 'success', text: '' });
  const [busyId, setBusyId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const images = room.images ?? [];

  const done = async (text) => {
    await onChanged();
    setMessage({ type: 'success', text });
  };

  const handlePrimary = async (image) => {
    setBusyId(image.id);
    try {
      await setAdminRoomImagePrimary(image.id);
      await done('The primary image has been changed.');
    } catch (apiError) {
      setMessage({ type: 'error', text: apiError.message });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    const image = deleting;
    setBusyId(image.id);
    try {
      await deleteAdminRoomImage(image.id);
      setDeleting(null);
      await done(
        image.is_primary && images.length > 1
          ? 'The image has been deleted. The next image is now the primary image.'
          : 'The image has been deleted.',
      );
    } catch (apiError) {
      setDeleting(null);
      setMessage({ type: 'error', text: apiError.message });
    } finally {
      setBusyId(null);
    }
  };

  const position = (image) => images.findIndex((item) => item.id === image.id) + 1;

  return (
    <AdminSection title="Images" subtitle="The primary image is shown first on the room list and the room page.">
      <div className="mb-3 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-ink-soft">This room has no images yet. Guests see a drawing instead.</p>
      ) : (
        <ul className="grid gap-x-5 gap-y-6 sm:grid-cols-2" aria-label={`Images of room ${room.room_number}`}>
          {images.map((image, index) => (
            <li key={image.id}>
              <div className="relative">
                <RoomImage
                  src={image.image_url}
                  alt={`Room ${room.room_number}, image ${index + 1}`}
                  className="aspect-[4/3] w-full rounded-panel"
                />
                {image.is_primary && (
                  <span className="absolute top-2 left-2 rounded-sm bg-white px-2 py-0.5 text-xs font-semibold text-ink">
                    Primary
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {!image.is_primary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busyId === image.id && !deleting}
                    disabled={busyId !== null}
                    aria-label={`Set image ${index + 1} of room ${room.room_number} as primary`}
                    onClick={() => handlePrimary(image)}
                  >
                    Set as primary
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  danger
                  disabled={busyId !== null}
                  aria-label={`Delete image ${index + 1} of room ${room.room_number}`}
                  onClick={() => setDeleting(image)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <RoomImageUploader room={room} onAdded={done} />
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting ? `Delete image ${position(deleting)} of room ${room.room_number}?` : ''}
        message={
          deleting?.is_primary && images.length > 1
            ? 'This is the primary image. The next image will become the primary image.'
            : 'The image will be removed from this room.'
        }
        confirmLabel="Yes, delete image"
        cancelLabel="Keep image"
        variant="danger"
        loading={busyId !== null}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </AdminSection>
  );
}
