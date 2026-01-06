# Database Migration & Seeding

## Giới thiệu

Project này sử dụng TypeORM với PostgreSQL. Để đơn giản hóa việc setup database, chúng tôi đã tạo một script migration tự động.

## Cấu trúc

```
├── seed.sql                    # Seed data cơ bản
├── seed-workflow.sql           # Seed data với workflow (đầy đủ hơn)
└── src/
    ├── data-source.ts          # TypeORM DataSource configuration
    └── scripts/
        └── seed.ts             # Script để seed database
```

## Cách sử dụng

### 1. Cấu hình Database

Đảm bảo file `.env` đã được cấu hình đúng:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/nestjs_news_db?schema=public"
```

### 2. Chạy Migration & Seed

Chỉ cần chạy **một lệnh duy nhất**:

```bash
npm run db:setup
```

Script này sẽ:
- ✅ Kết nối với database
- ✅ Xóa toàn bộ dữ liệu cũ (TRUNCATE)
- ✅ Chạy seed data từ `seed-workflow.sql`
- ✅ Tạo roles, permissions, users và articles mẫu

### 3. Dữ liệu được tạo

Sau khi chạy script, database sẽ có:

**Roles:**
- `admin` - Administrator role với full access

**Permissions (10):**
- `users:create`, `users:read`, `users:update`, `users:delete`
- `articles:create`, `articles:read`, `articles:update`, `articles:delete`
- `articles:approve`, `articles:publish`

**Users (3):**
- `admin@example.com` - Admin User
- `editor@example.com` - Editor User  
- `reporter@example.com` - Reporter User

**Password mặc định:** `password123`

**Articles (3):**
- Getting Started with NestJS (DRAFT)
- Understanding TypeScript (SUBMITTED)
- Database Design Best Practices (PUBLISHED)

## Lưu ý

- Script sử dụng `TRUNCATE ... RESTART IDENTITY CASCADE` để xóa toàn bộ dữ liệu
- Auto-increment counters sẽ được reset về 1
- Tất cả foreign key constraints sẽ được xử lý tự động
- Script sử dụng `seed-workflow.sql` (phiên bản đầy đủ hơn so với `seed.sql`)

## Troubleshooting

### Lỗi kết nối database
Kiểm tra:
1. PostgreSQL đang chạy
2. `DATABASE_URL` trong `.env` đúng
3. Database đã được tạo

### Lỗi permissions
Đảm bảo user database có quyền:
- CREATE
- DROP
- TRUNCATE
- INSERT

## Scripts khác

```bash
# Start development server
npm run start:dev

# Build project
npm run build

# Run tests
npm test
```
