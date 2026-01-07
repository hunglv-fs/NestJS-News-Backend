-- Insert roles
INSERT INTO "roles" ("id", "name", "description", "updatedAt") VALUES 
('admin-role-id', 'admin', 'Administrator role with full access', CURRENT_TIMESTAMP),
('staff-role-id', 'staff', 'Staff role with article management permissions', CURRENT_TIMESTAMP),
('register-user-role-id', 'register-user', 'Default role for registered users', CURRENT_TIMESTAMP);

-- Insert permissions
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
('perm-roles-assign', 'roles:assign', 'Assign roles to users', CURRENT_TIMESTAMP);

-- Assign all permissions to admin role
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-admin-1', 'admin-role-id', 'perm-users-create'),
('rp-admin-2', 'admin-role-id', 'perm-users-read'),
('rp-admin-3', 'admin-role-id', 'perm-users-update'),
('rp-admin-4', 'admin-role-id', 'perm-users-delete'),
('rp-admin-5', 'admin-role-id', 'perm-articles-create'),
('rp-admin-6', 'admin-role-id', 'perm-articles-read'),
('rp-admin-7', 'admin-role-id', 'perm-articles-update'),
('rp-admin-8', 'admin-role-id', 'perm-articles-delete'),
('rp-admin-9', 'admin-role-id', 'perm-articles-approve'),
('rp-admin-10', 'admin-role-id', 'perm-roles-assign');

-- Assign permissions to staff role
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-staff-1', 'staff-role-id', 'perm-articles-create'),
('rp-staff-2', 'staff-role-id', 'perm-articles-read'),
('rp-staff-3', 'staff-role-id', 'perm-articles-update'),
('rp-staff-4', 'staff-role-id', 'perm-articles-delete'),
('rp-staff-5', 'staff-role-id', 'perm-articles-approve');

-- Assign permissions to register-user role
INSERT INTO "role_permissions" ("id", "roleId", "permissionId") VALUES 
('rp-user-1', 'register-user-role-id', 'perm-articles-read'),
('rp-user-2', 'register-user-role-id', 'perm-articles-create');

-- Insert sample users (password: 'password123' for all)
INSERT INTO "users" ("email", "password", "name", "roleId", "updatedAt") VALUES 
('admin@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Admin User', 'admin-role-id', CURRENT_TIMESTAMP),
('jane@example.com', '$2b$10$x4Sh/hGRdQaxany4tlIxA.k48L4U6.aRG.nsNGEnt/j0RSEklXVMm', 'Jane Smith', 'register-user-role-id', CURRENT_TIMESTAMP);

-- Insert sample articles
INSERT INTO "articles" ("title", "content", "authorId", "updatedAt") VALUES 
('Getting Started with NestJS', 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications...', 1, CURRENT_TIMESTAMP),
('Understanding TypeScript', 'TypeScript is a strongly typed programming language that builds on JavaScript...', 2, CURRENT_TIMESTAMP),
('Database Design Best Practices', 'When designing a database, there are several key principles to follow...', 1, CURRENT_TIMESTAMP);