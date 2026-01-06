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

-- Insert sample users (password: 'password123' for all)
INSERT INTO "users" ("email", "password", "name", "roleId", "updatedAt") VALUES 
('admin@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Admin User', 'admin-role-id', CURRENT_TIMESTAMP),
('editor@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Editor User', 'admin-role-id', CURRENT_TIMESTAMP),
('reporter@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Reporter User', 'admin-role-id', CURRENT_TIMESTAMP);

-- Insert sample articles with workflow
INSERT INTO "articles" ("title", "slug", "content", "status", "authorId", "editorId", "updatedAt") VALUES 
('Getting Started with NestJS', 'getting-started-with-nestjs-1734616307530', 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications...', 'DRAFT', 1, NULL, CURRENT_TIMESTAMP),
('Understanding TypeScript', 'understanding-typescript-1734616307531', 'TypeScript is a strongly typed programming language that builds on JavaScript...', 'SUBMITTED', 3, 2, CURRENT_TIMESTAMP),
('Database Design Best Practices', 'database-design-best-practices-1734616307532', 'When designing a database, there are several key principles to follow...', 'PUBLISHED', 1, 2, CURRENT_TIMESTAMP);