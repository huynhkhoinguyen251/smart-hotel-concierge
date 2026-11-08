# Database scripts

Scripts for MySQL 8.0. The `smart_hotel_concierge` database must exist before you run them.

## Run order

1. `schema.sql`: creates the 22 tables.
2. `seed.sql`: inserts the sample data.

**Option 1: MySQL Workbench.** Open each file in the order above and click Execute (the lightning bolt icon).

**Option 2: command line.** Run these from the repository root and enter your MySQL password when prompted:

```powershell
mysql -u root -p --default-character-set=utf8mb4 -e "source database/schema.sql"
mysql -u root -p --default-character-set=utf8mb4 -e "source database/seed.sql"
```

## Notes

- `schema.sql` can be run more than once, because it does not recreate existing tables.
- `seed.sql` can only be run once, on empty tables. Running it again fails with duplicate `id` errors.

## Rebuild the database from scratch

> **Warning:** these steps delete the whole `smart_hotel_concierge` database, including every table and all data in it. This cannot be undone.

Use this when you want a clean copy of the sample data, for example after testing or after `schema.sql` or `seed.sql` has changed.

1. Drop and recreate the database:

   ```sql
   DROP DATABASE IF EXISTS smart_hotel_concierge;
   CREATE DATABASE smart_hotel_concierge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   In MySQL Workbench, paste these two lines into a query tab and click Execute. From the command line, run:

   ```powershell
   mysql -u root -p -e "DROP DATABASE IF EXISTS smart_hotel_concierge; CREATE DATABASE smart_hotel_concierge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. Run `schema.sql`, then `seed.sql`, as described in [Run order](#run-order).

## Test accounts

| Role | Email | Test password |
|---|---|---|
| admin | `admin@smarthotel.test` | `Admin@123` |
| user | `an.tran@example.com` | `User@123` |
| user | `binh.le@example.com` | `User@123` |
| user | `chi.pham@example.com` | `User@123` |

These passwords are for the development environment only. Do not use these accounts in production.
