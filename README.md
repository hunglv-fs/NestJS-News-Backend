# NestJS News Backend

A NestJS backend application with Fastify adapter, PostgreSQL, and Prisma ORM following domain-driven design principles.

## Features

- **Fastify Adapter** - High performance HTTP server
- **TypeScript Strict Mode** - Enhanced type safety
- **PostgreSQL + Prisma** - Database with type-safe ORM
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

3. Update database URL in `.env`

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run migrations:
```bash
npm run prisma:migrate
```

6. Start development server:
```bash
npm run start:dev
```

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