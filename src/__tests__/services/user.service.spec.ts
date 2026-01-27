import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../modules/user/user.service';
import { RoleService } from '../../modules/rbac/services/role.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Role } from '../../modules/rbac/entities/role.entity';
import { CreateUserDto } from '../../modules/user/dto/create-user.dto';
import { UpdateUserDto } from '../../modules/user/dto/update-user.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
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

  const mockUserWithoutSensitiveData = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        approvedArticles: [],
        authoredArticles: [],
        editedArticles: [],
        roles: [],
        userRoles: [],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([mockUser] as any);

      const result = await service.findAll();

      expect(result).toEqual([{
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        approvedArticles: [],
        authoredArticles: [],
        editedArticles: [],
        password: 'hashedpassword',
        refreshToken: null,
        roles: [],
        userRoles: [],
      }]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.findOne(1);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        approvedArticles: [],
        authoredArticles: [],
        editedArticles: [],
        password: 'hashedpassword',
        refreshToken: null,
        roles: [],
        userRoles: [],
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        approvedArticles: [],
        authoredArticles: [],
        editedArticles: [],
        password: 'hashedpassword',
        refreshToken: null,
        roles: [],
        userRoles: [],
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findOneByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      jest.spyOn(userRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserWithoutSensitiveData as any);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(userRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should hash password when updating password', async () => {
      const updateUserDto: UpdateUserDto = {
        password: 'newpassword123',
      };

      jest.spyOn(userRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserWithoutSensitiveData as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashednewpassword' as never);

      await service.update(1, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(userRepository.update).toHaveBeenCalledWith(1, { password: 'hashednewpassword' });
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      jest.spyOn(userRepository, 'delete').mockResolvedValue({} as any);

      const result = await service.remove(1);

      expect(result).toEqual({});
    });
  });

  describe('assignRole', () => {
    it('should assign role to user successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserWithoutSensitiveData as any);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole as any);
      jest.spyOn(userRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserWithoutSensitiveData as any);

      const result = await service.assignRole(1, '1');

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(userRepository.update).toHaveBeenCalledWith(1, { roles: [{ id: '1' }] });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.assignRole(999, '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when role not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.assignRole(1, '999')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to assign admin role', async () => {
      const adminRole = {
        ...mockRole,
        name: 'admin',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(adminRole as any);

      await expect(service.assignRole(1, '1')).rejects.toThrow(BadRequestException);
    });
  });
});