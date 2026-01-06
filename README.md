# NestJS News Backend

A NestJS backend application with Fastify adapter, PostgreSQL, and Prisma ORM following domain-driven design principles.

## Features

- **Fastify Adapter** - High performance HTTP server
- **TypeScript Strict Mode** - Enhanced type safety
- **PostgreSQL + TypeORM** - Database with type-safe ORM
- **RBAC (Role-Based Access Control)** - Roles and permissions system
- **JWT Authentication** - Secure authentication with refresh tokens
- **Global Exception Filter** - Centralized error handling
- **Global Validation Pipe** - Request validation
- **Logging Interceptor** - Request/response logging
- **Domain-Driven Design** - Organized folder structure

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
copy .env.example .env
```

3. Update database URL in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nestjs_news_db?schema=public"
```

4. **Setup database with one command** (creates tables & seeds data):
```bash
npm run db:setup
```

This will automatically:
- Create all tables using TypeORM entities
- Seed roles, permissions, users, and sample articles
- Default login: `admin@example.com` / `password123`

5. Start development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

For detailed database setup information, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## API Endpoints

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Articles
- `GET /articles` - Get all articles
- `GET /articles/:id` - Get article by ID
- `POST /articles` - Create article
- `PATCH /articles/:id` - Update article
- `DELETE /articles/:id` - Delete article

## Project Structure

```
src/
├── modules/          # Domain modules
│   ├── user/
│   └── article/
├── common/           # Shared utilities
│   ├── filters/
│   └── interceptors/
├── infrastructure/   # External services
│   └── database/
└── config/          # Configuration
```