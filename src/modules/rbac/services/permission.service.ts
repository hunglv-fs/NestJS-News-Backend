import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { AssignPermissionDto } from '../dto/assign-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) { }

  async create(createPermissionDto: CreatePermissionDto) {
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      throw new ConflictException('Permission already exists');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll() {
    return this.permissionRepository.find();
  }

  async findOne(id: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: {
        roles: {
          role: true,
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async assignToRole(assignPermissionDto: AssignPermissionDto) {
    const { roleId, permissionId } = assignPermissionDto;

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    const permission = await this.permissionRepository.findOne({ where: { id: permissionId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const existingAssignment = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });

    if (existingAssignment) {
      throw new ConflictException('Permission already assigned to role');
    }

    const assignment = this.rolePermissionRepository.create({ role, permission }); // or roleId, permissionId
    const saved = await this.rolePermissionRepository.save(assignment);

    return {
      ...saved,
      role,
      permission
    };
  }

  async removeFromRole(roleId: string, permissionId: string) {
    const assignment = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });

    if (!assignment) {
      throw new NotFoundException('Permission assignment not found');
    }

    return this.rolePermissionRepository.remove(assignment);
  }

  async remove(id: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const roleCount = await this.rolePermissionRepository.count({ where: { permissionId: id } });

    if (roleCount > 0) {
      throw new ConflictException('Cannot delete permission assigned to roles');
    }

    return this.permissionRepository.remove(permission);
  }
}