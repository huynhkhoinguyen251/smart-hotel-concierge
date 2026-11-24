// Mô tả và vài tiện nghi nổi bật của mỗi loại phòng, để hiện trong danh sách phòng.
// Tiện nghi càng ít loại phòng có thì càng đáng hiện (bồn tắm trước Wi-Fi).
// roomTypes: kết quả GET /room-types. Trả Map: id loại phòng -> { description, amenities }.
export const getRoomTypeDetails = (roomTypes, limit = 4) => {
  const counts = new Map();
  roomTypes.forEach((type) =>
    (type.amenities ?? []).forEach(({ id }) => counts.set(id, (counts.get(id) ?? 0) + 1)),
  );
  return new Map(
    roomTypes.map(({ id, description, amenities = [] }) => [
      id,
      {
        description,
        amenities: [...amenities]
          .sort((a, b) => counts.get(a.id) - counts.get(b.id) || a.id - b.id)
          .slice(0, limit),
      },
    ]),
  );
};
