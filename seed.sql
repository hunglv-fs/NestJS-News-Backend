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