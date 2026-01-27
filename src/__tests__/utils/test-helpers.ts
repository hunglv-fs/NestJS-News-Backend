import { User } from '../../modules/user/entities/user.entity';
import { Role } from '../../modules/rbac/entities/role.entity';
import { Article, ArticleStatus } from '../../modules/article/entities/article.entity';
import { Category } from '../../modules/category/entities/category.entity';
import { Permission } from '../../modules/rbac/entities/permission.entity';
import { UserRole } from '../../modules/rbac/entities/user-role.entity';
import { RolePermission } from '../../modules/rbac/entities/role-permission.entity';

export class TestHelpers {
  static createMockUser(overrides: Partial<User> = {}): User {
    return {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
      refreshToken: null,
      userRoles: [],
      roles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      authoredArticles: [],
      editedArticles: [],
      approvedArticles: [],
      ...overrides,
    };
  }

  static createMockRole(overrides: Partial<Role> = {}): Role {
    return {
      id: '1',
      name: 'test-role',
      description: 'Test role',
      userRoles: [],
      users: [],
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockArticle(overrides: Partial<Article> = {}): Article {
    return {
      id: 1,
      title: 'Test Article',
      content: 'Test content',
      slug: 'test-article',
      status: ArticleStatus.DRAFT,
      version: 1,
      authorId: 1,
      editorId: undefined,
      approverId: undefined,
      publishedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: undefined,
      editor: undefined,
      approver: undefined,
      category: undefined,
      ...overrides,
    };
  }

  static createMockCategory(overrides: Partial<Category> = {}): Category {
    return {
      id: 1,
      name: 'Test Category',
      description: 'Test category description',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockPermission(overrides: Partial<Permission> = {}): Permission {
    return {
      id: '1',
      name: 'test-permission',
      description: 'Test permission',
      roles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockUserRole(overrides: Partial<UserRole> = {}): UserRole {
    return {
      id: '1',
      userId: 1,
      roleId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: undefined,
      role: undefined,
      ...overrides,
    };
  }

  static createMockRolePermission(overrides: Partial<RolePermission> = {}): RolePermission {
    return {
      id: '1',
      roleId: '1',
      permissionId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: undefined,
      permission: undefined,
      ...overrides,
    };
  }

  static createMockJwtPayload(sub: number, email: string) {
    return {
      sub,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  }

  static createMockRequest(user?: User) {
    return {
      user,
      headers: {},
      body: {},
      params: {},
      query: {},
    };
  }

  static createMockResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  }

  static createMockRepository<T>() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      findByIds: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
  }

  static createMockJwtService() {
    return {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
  }

  static createMockConfigService() {
    return {
      get: jest.fn(),
    };
  }

  static createMockBcrypt() {
    return {
      hash: jest.fn(),
      compare: jest.fn(),
    };
  }
}