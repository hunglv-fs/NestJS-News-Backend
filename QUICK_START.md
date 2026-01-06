# Quick Start Guide

## 🚀 Khởi động nhanh

### Bước 1: Cài đặt
```bash
npm install
```

### Bước 2: Cấu hình database
```bash
# Copy file .env
copy .env.example .env

# Sửa DATABASE_URL trong .env
DATABASE_URL="postgresql://username:password@localhost:5432/nestjs_news_db"
```

### Bước 3: Setup database (CHỈ MỘT LỆNH!)
```bash
npm run db:setup
```

### Bước 4: Chạy server
```bash
npm run start:dev
```

## 🎯 Thông tin đăng nhập mặc định

Sau khi chạy `npm run db:setup`, bạn có thể đăng nhập với:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | Admin |
| editor@example.com | password123 | Admin |
| reporter@example.com | password123 | Admin |

## 📝 Scripts hữu ích

```bash
# Setup/Reset database (xóa data cũ và seed lại)
npm run db:setup

# Chạy development server
npm run start:dev

# Build production
npm run build

# Chạy production
npm run start:prod

# Run tests
npm test

# Lint code
npm run lint
```

## 🔧 Troubleshooting

### Database connection error?
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra DATABASE_URL trong .env
3. Đảm bảo database đã được tạo:
   ```sql
   CREATE DATABASE nestjs_news_db;
   ```

### Port đã được sử dụng?
Thay đổi PORT trong file `.env`:
```env
PORT=3001
```

## 📚 Tài liệu chi tiết

- [README.md](./README.md) - Tổng quan project
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Chi tiết về database setup
