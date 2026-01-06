-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "roleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert default admin role
INSERT INTO "roles" ("id", "name", "description", "updatedAt") VALUES ('admin-role-id', 'admin', 'Administrator role with full access', CURRENT_TIMESTAMP);

-- Insert default permissions
INSERT INTO "permissions" ("id", "name", "description", "updatedAt") VALUES 
('perm-users-create', 'users:create', 'Create users', CURRENT_TIMESTAMP),
('perm-users-read', 'users:read', 'Read users', CURRENT_TIMESTAMP),
('perm-users-update', 'users:update', 'Update users', CURRENT_TIMESTAMP),
('perm-users-delete', 'users:delete', 'Delete users', CURRENT_TIMESTAMP),
('perm-articles-create', 'articles:create', 'Create articles', CURRENT_TIMESTAMP),
('perm-articles-read', 'articles:read', 'Read articles', CURRENT_TIMESTAMP),
('perm-articles-update', 'articles:update', 'Update articles', CURRENT_TIMESTAMP),
('perm-articles-delete', 'articles:delete', 'Delete articles', CURRENT_TIMESTAMP);

-- Assign all permissions to admin role
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-1', 'admin-role-id', 'perm-users-create'),
('rp-2', 'admin-role-id', 'perm-users-read'),
('rp-3', 'admin-role-id', 'perm-users-update'),
('rp-4', 'admin-role-id', 'perm-users-delete'),
('rp-5', 'admin-role-id', 'perm-articles-create'),
('rp-6', 'admin-role-id', 'perm-articles-read'),
('rp-7', 'admin-role-id', 'perm-articles-update'),
('rp-8', 'admin-role-id', 'perm-articles-delete');

-- Insert sample users (password: 'password123' for all)
INSERT INTO "users" ("email", "password", "name", "roleId", "updatedAt") VALUES 
('admin@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Admin User', 'admin-role-id', CURRENT_TIMESTAMP),
('john@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'John Doe', 'admin-role-id', CURRENT_TIMESTAMP),
('jane@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Jane Smith', NULL, CURRENT_TIMESTAMP);

-- Insert sample articles
INSERT INTO "articles" ("title", "content", "authorId", "updatedAt") VALUES 
('Getting Started with NestJS', 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications...', 1, CURRENT_TIMESTAMP),
('Understanding TypeScript', 'TypeScript is a strongly typed programming language that builds on JavaScript...', 2, CURRENT_TIMESTAMP),
('Database Design Best Practices', 'When designing a database, there are several key principles to follow...', 1, CURRENT_TIMESTAMP);