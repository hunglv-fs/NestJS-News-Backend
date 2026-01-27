import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { AssignUserRoleDto } from '../dto/assign-user-role.dto';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) { }

  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll() {
    return this.roleRepository.find({
      relations: {
        permissions: {
          permission: true,
        },
        userRoles: {
          user: true,
        },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: {
        permissions: {
          permission: true,
        },
        userRoles: {
          user: true,
        },
      },
      select: {
        userRoles: {
          user: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async assignRolesToUser(assignUserRoleDto: AssignUserRoleDto) {
    const { email, roleIds } = assignUserRoleDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate all roles exist
    const roles = await this.roleRepository.findByIds(roleIds);
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    // Remove existing user-role relationships
    await this.userRoleRepository.delete({ userId: user.id });

    // Create new user-role relationships
    const userRoles = roleIds.map(roleId => ({
      userId: user.id,
      roleId,
    }));

    await this.userRoleRepository.save(userRoles);

    return {
      message: `Roles assigned to user ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      roles: roles.map(role => ({ id: role.id, name: role.name })),
    };
  }

  async updateRolePermissions(roleId: string, updateRolePermissionsDto: UpdateRolePermissionsDto) {
    const { permissionIds } = updateRolePermissionsDto;

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Validate all permissions exist
    const permissionCount = await this.rolePermissionRepository.count({
      where: { permission: { id: In(permissionIds) } },
    });
    if (permissionCount !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    // Remove existing role-permission relationships
    await this.rolePermissionRepository.delete({ roleId });

    // Create new role-permission relationships
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId,
      permissionId,
    }));

    await this.rolePermissionRepository.save(rolePermissions);

    // Get the updated permissions
    const updatedPermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    return {
      message: `Permissions updated for role ${role.name}`,
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
      permissions: updatedPermissions.map(rp => ({ 
        id: rp.permission.id, 
        name: rp.permission.name 
      })),
    };
  }

  async remove(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if role is assigned to any users
    const userRoleCount = await this.userRoleRepository.count({ where: { roleId: id } });

    if (userRoleCount > 0) {
      throw new ConflictException('Cannot delete role with assigned users');
    }

    return this.roleRepository.remove(role);
  }

  async getUserRoles(userId: number) {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    return userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description,
    }));
  }

  async getRolePermissions(roleId: string) {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    return rolePermissions.map(rp => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
    }));
  }
}
