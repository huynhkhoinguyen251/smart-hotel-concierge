# Script database

Script dành cho MySQL 8.0. Database `smart_hotel_concierge` phải được tạo sẵn trước khi chạy.

## Thứ tự chạy

1. `schema.sql`: tạo 22 bảng.
2. `seed.sql`: thêm dữ liệu mẫu.

**Cách 1: MySQL Workbench.** Mở từng file theo thứ tự trên và bấm Execute (biểu tượng tia sét).

**Cách 2: dòng lệnh.** Chạy tại thư mục gốc của repo, rồi nhập mật khẩu MySQL của bạn khi được hỏi:

```powershell
mysql -u root -p --default-character-set=utf8mb4 -e "source database/schema.sql"
mysql -u root -p --default-character-set=utf8mb4 -e "source database/seed.sql"
```

## Lưu ý

- `schema.sql` chạy lại được nhiều lần, vì không tạo lại bảng đã có.
- `seed.sql` chỉ chạy một lần trên các bảng còn trống. Nếu chạy lại, MySQL sẽ báo lỗi trùng `id`.

## Tài khoản test

| Vai trò | Email | Mật khẩu test |
|---|---|---|
| admin | `admin@smarthotel.test` | `Admin@123` |
| user | `an.tran@example.com` | `User@123` |
| user | `binh.le@example.com` | `User@123` |
| user | `chi.pham@example.com` | `User@123` |

Đây chỉ là mật khẩu test cho môi trường phát triển. Không dùng các tài khoản này khi deploy production.
