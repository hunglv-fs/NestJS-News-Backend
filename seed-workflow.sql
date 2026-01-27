-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS "user_roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" INTEGER NOT NULL,
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_user_roles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_user_roles_roleId" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE,
    CONSTRAINT "UQ_user_roles_userId_roleId" UNIQUE ("userId", "roleId")
);

-- Insert default admin role
INSERT INTO "roles" ("id", "name", "description", "updatedAt") VALUES ('admin-role-id', 'admin', 'Administrator role with full access', CURRENT_TIMESTAMP);

-- Insert register-user role
INSERT INTO "roles" ("id", "name", "description", "updatedAt") VALUES ('register-user-role-id', 'register-user', 'Default role for registered users', CURRENT_TIMESTAMP);

-- Insert publisher role
INSERT INTO "roles" ("id", "name", "description", "updatedAt") VALUES ('publisher-role-id', 'publisher', 'Role for publishing articles', CURRENT_TIMESTAMP);

-- Insert approver role
INSERT INTO "roles" ("id", "name", "description", "updatedAt") VALUES ('approver-role-id', 'approver', 'Role for approving articles', CURRENT_TIMESTAMP);

-- Insert editor role
INSERT INTO "roles" ("id", "name", "description", "updatedAt") VALUES ('editor-role-id', 'editor', 'Role for editing articles', CURRENT_TIMESTAMP);

-- Insert writer role
INSERT INTO "roles" ("id", "name", "description", "updatedAt") VALUES ('writer-role-id', 'writer', 'Role for writing articles', CURRENT_TIMESTAMP);

-- Insert default permissions
INSERT INTO "permissions" ("id", "name", "description", "updatedAt") VALUES 
('perm-users-create', 'users:create', 'Create users', CURRENT_TIMESTAMP),
('perm-users-read', 'users:read', 'Read users', CURRENT_TIMESTAMP),
('perm-users-update', 'users:update', 'Update users', CURRENT_TIMESTAMP),
('perm-users-delete', 'users:delete', 'Delete users', CURRENT_TIMESTAMP),
('perm-articles-create', 'articles:create', 'Create articles', CURRENT_TIMESTAMP),
('perm-articles-read', 'articles:read', 'Read articles', CURRENT_TIMESTAMP),
('perm-articles-update', 'articles:update', 'Update articles', CURRENT_TIMESTAMP),
('perm-articles-delete', 'articles:delete', 'Delete articles', CURRENT_TIMESTAMP),
('perm-articles-approve', 'articles:approve', 'Approve articles', CURRENT_TIMESTAMP),
('perm-articles-publish', 'articles:publish', 'Publish articles', CURRENT_TIMESTAMP);

-- Assign all permissions to admin role
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-1', 'admin-role-id', 'perm-users-create'),
('rp-2', 'admin-role-id', 'perm-users-read'),
('rp-3', 'admin-role-id', 'perm-users-update'),
('rp-4', 'admin-role-id', 'perm-users-delete'),
('rp-5', 'admin-role-id', 'perm-articles-create'),
('rp-6', 'admin-role-id', 'perm-articles-read'),
('rp-7', 'admin-role-id', 'perm-articles-update'),
('rp-8', 'admin-role-id', 'perm-articles-delete'),
('rp-9', 'admin-role-id', 'perm-articles-approve'),
('rp-10', 'admin-role-id', 'perm-articles-publish');

-- Assign permissions to register-user role (basic read access)
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-11', 'register-user-role-id', 'perm-articles-read');

-- Assign permissions to writer role (can create and update articles)
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-12', 'writer-role-id', 'perm-articles-create'),
('rp-13', 'writer-role-id', 'perm-articles-read'),
('rp-14', 'writer-role-id', 'perm-articles-update');

-- Assign permissions to editor role (can edit, read, and submit articles for approval)
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-15', 'editor-role-id', 'perm-articles-create'),
('rp-16', 'editor-role-id', 'perm-articles-read'),
('rp-17', 'editor-role-id', 'perm-articles-update'),
('rp-18', 'editor-role-id', 'perm-articles-approve');

-- Assign permissions to approver role (can approve articles)
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-19', 'approver-role-id', 'perm-articles-read'),
('rp-20', 'approver-role-id', 'perm-articles-approve');

-- Assign permissions to publisher role (can publish articles)
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-21', 'publisher-role-id', 'perm-articles-read'),
('rp-22', 'publisher-role-id', 'perm-articles-publish');

-- Insert sample users (password: 'password123' for all)
INSERT INTO "users" ("email", "password", "name", "updatedAt") VALUES 
('admin@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Admin User', CURRENT_TIMESTAMP),
('editor@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Editor User', CURRENT_TIMESTAMP),
('reporter@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Reporter User', CURRENT_TIMESTAMP);

-- Insert user_roles relationships for existing users
INSERT INTO "user_roles" ("userId", "roleId", "updatedAt") VALUES 
(1, 'admin-role-id', CURRENT_TIMESTAMP),
(2, 'admin-role-id', CURRENT_TIMESTAMP),
(3, 'admin-role-id', CURRENT_TIMESTAMP);

-- Insert sample articles with workflow
INSERT INTO "articles" ("title", "slug", "content", "status", "authorId", "editorId", "updatedAt") VALUES 
('Getting Started with NestJS', 'getting-started-with-nestjs-1734616307530', 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications...', 'DRAFT', 1, NULL, CURRENT_TIMESTAMP),
('Understanding TypeScript', 'understanding-typescript-1734616307531', 'TypeScript is a strongly typed programming language that builds on JavaScript...', 'SUBMITTED', 3, 2, CURRENT_TIMESTAMP),
('Database Design Best Practices', 'database-design-best-practices-1734616307532', 'When designing a database, there are several key principles to follow...', 'PUBLISHED', 1, 2, CURRENT_TIMESTAMP);