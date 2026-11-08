import { withTransaction } from '../../config/db.js';
import * as roomImagesModel from '../../models/roomImages.model.js';
import * as roomsModel from '../../models/rooms.model.js';
import AppError from '../../utils/AppError.js';

const ROOM_NOT_FOUND = 'Room not found';
const IMAGE_NOT_FOUND = 'Image not found';

// Quy tắc chung của các hàm dưới đây: mọi thao tác ghi ảnh của một phòng đều khóa dòng phòng
// trước tiên trong transaction. Nhờ vậy hai yêu cầu cùng lúc trên một phòng chạy lần lượt,
// và mỗi phòng luôn chỉ có đúng một ảnh chính.

// Thêm ảnh. Ảnh đầu tiên của phòng tự thành ảnh chính.
export const addImage = (roomId, { image_url, is_primary }) =>
  withTransaction(async (conn) => {
    if (!(await roomsModel.lockRoomById(roomId, conn))) {
      throw new AppError(404, ROOM_NOT_FOUND);
    }

    const makePrimary = is_primary === true || !(await roomImagesModel.hasImages(roomId, conn));
    if (makePrimary) {
      await roomImagesModel.clearPrimaryImage(roomId, conn);
    }

    const id = await roomImagesModel.createImage(
      { room_id: roomId, image_url, is_primary: makePrimary },
      conn,
    );
    return roomImagesModel.findImageById(id, conn);
  });

// Tìm phòng của ảnh trước khi mở transaction, rồi khóa phòng và đọc lại ảnh bên trong.
// Lần đọc thứ hai diễn ra sau khi đã khóa, nên thấy được ảnh nếu nó vừa bị xóa.
const runWithLockedImage = async (imageId, work) => {
  const image = await roomImagesModel.findImageById(imageId);
  if (!image) {
    throw new AppError(404, IMAGE_NOT_FOUND);
  }

  return withTransaction(async (conn) => {
    await roomsModel.lockRoomById(image.room_id, conn);
    const current = await roomImagesModel.findImageById(imageId, conn);
    if (!current) {
      throw new AppError(404, IMAGE_NOT_FOUND);
    }
    return work(current, conn);
  });
};

// Đặt ảnh chính mới và bỏ ảnh chính cũ.
export const setPrimaryImage = (imageId) =>
  runWithLockedImage(imageId, async (image, conn) => {
    await roomImagesModel.clearPrimaryImage(image.room_id, conn);
    await roomImagesModel.setPrimaryImage(image.id, conn);
    return roomImagesModel.findImageById(image.id, conn);
  });

// Xóa ảnh. Nếu đó là ảnh chính, ảnh còn lại có id nhỏ nhất trở thành ảnh chính.
export const deleteImage = (imageId) =>
  runWithLockedImage(imageId, async (image, conn) => {
    await roomImagesModel.deleteImage(image.id, conn);

    if (image.is_primary) {
      const nextId = await roomImagesModel.findFirstImageId(image.room_id, conn);
      if (nextId !== null) {
        await roomImagesModel.setPrimaryImage(nextId, conn);
      }
    }
  });
