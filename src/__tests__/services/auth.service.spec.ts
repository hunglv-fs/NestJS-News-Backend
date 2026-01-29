import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../modules/auth/auth.service';
import { UserService } from '../../modules/user/user.service';
import { RoleService } from '../../modules/rbac/services/role.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Role } from '../../modules/rbac/entities/role.entity';
import { UserRole } from '../../modules/rbac/entities/user-role.entity';
import { ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../modules/auth/dto/login.dto';
import { RegisterDto } from '../../modules/auth/dto/register.dto';
import { AdminRegisterDto } from '../../modules/auth/dto/admin-register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let userRoleRepository: Repository<UserRole>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userService: UserService;
  let roleService: RoleService;

  const mockUser = {
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
  };

  const mockRole = {
    id: '1',
    name: 'register-user',
    description: 'Register user role',
    userRoles: [],
    users: [],
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRole = {
    id: '1',
    userId: 1,
    roleId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    role: mockRole,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: RoleService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    userRoleRepository = module.get<Repository<UserRole>>(getRepositoryToken(UserRole));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UserService>(UserService);
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole as any);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as any);
      jest.spyOn(userRoleRepository, 'create').mockReturnValue(mockUserRole as any);
      jest.spyOn(userRoleRepository, 'save').mockResolvedValue(mockUserRole as any);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access-token');
      jest.spyOn(service as any, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        accessToken: 'access-token',
        refreshToken: 'access-token',
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when register-user role not found', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access-token');
      jest.spyOn(service as any, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        accessToken: 'access-token',
        refreshToken: 'access-token',
      });
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('adminLogin', () => {
    // TODO: This test is difficult to implement due to complex role relationship mocking
    // The adminLogin method checks for admin role through userRoles relationship
    // which requires proper TypeORM entity relationships to be mocked correctly
    // Skipping this test for now as it's not critical for core functionality
    it('should login admin successfully', async () => {
      const loginDto: LoginDto = {
        email: 'admin@example.com',
        password: 'password123',
      };

      const adminRole = { ...mockRole, name: 'admin' };
      const adminUserRole = { ...mockUserRole, role: adminRole };
      const adminUser = {
        ...mockUser,
        email: 'admin@example.com',
        userRoles: [adminUserRole],
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(adminUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access-token');
      jest.spyOn(service as any, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.adminLogin(loginDto);

      expect(result).toEqual({
        user: {
          id: 1,
          email: 'admin@example.com',
          name: 'Test User',
          roles: ['admin'],
        },
        accessToken: 'access-token',
        refreshToken: 'access-token',
      });
    });

    it('should throw UnauthorizedException when user does not have admin role', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      const regularUser = {
        ...mockUser,
        email: 'user@example.com',
        userRoles: [],
        roles: [],
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(regularUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(service.adminLogin(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('adminRegister', () => {
    it('should register admin user successfully', async () => {
      const adminRegisterDto: AdminRegisterDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        roleId: '1',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole as any);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as any);
      jest.spyOn(userRoleRepository, 'create').mockReturnValue(mockUserRole as any);
      jest.spyOn(userRoleRepository, 'save').mockResolvedValue(mockUserRole as any);

      const result = await service.adminRegister(adminRegisterDto);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        approvedArticles: [],
        authoredArticles: [],
        editedArticles: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        roles: [],
        userRoles: [],
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      const adminRegisterDto: AdminRegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        roleId: '1',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

      await expect(service.adminRegister(adminRegisterDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when role not found', async () => {
      const adminRegisterDto: AdminRegisterDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        roleId: 'nonexistent',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.adminRegister(adminRegisterDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to create admin role', async () => {
      const adminRegisterDto: AdminRegisterDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        roleId: '1',
      };

      const adminRole = {
        ...mockRole,
        name: 'admin',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(adminRole as any);

      await expect(service.adminRegister(adminRegisterDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        ...mockUser,
        refreshToken: 'valid-refresh-token',
      } as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('new-access-token');
      jest.spyOn(service as any, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.refreshTokens(1, 'valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-access-token',
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.refreshTokens(1, 'invalid-refresh-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      jest.spyOn(userRepository, 'update').mockResolvedValue({} as any);

      await service.logout(1);

      expect(userRepository.update).toHaveBeenCalledWith(1, { refreshToken: null });
    });
  });
});