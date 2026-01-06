import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RbacController {
  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  @Post('roles')
  @Roles('admin')
  @ApiOperation({ summary: 'Create role (Admin only)' })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('roles')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all roles (Admin only)' })
  findAllRoles() {
    return this.roleService.findAll();
  }

  @Get('roles/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get role by ID (Admin only)' })
  findOneRole(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Post('roles/assign')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign role to user (Admin only)' })
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.roleService.assignToUser(assignRoleDto);
  }

  @Delete('roles/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete role (Admin only)' })
  removeRole(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Post('permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'Create permission (Admin only)' })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get('permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all permissions (Admin only)' })
  findAllPermissions() {
    return this.permissionService.findAll();
  }

  @Get('permissions/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get permission by ID (Admin only)' })
  findOnePermission(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Post('permissions/assign')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign permission to role (Admin only)' })
  assignPermission(@Body() assignPermissionDto: AssignPermissionDto) {
    return this.permissionService.assignToRole(assignPermissionDto);
  }

  @Delete('permissions/roles/:roleId/:permissionId')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove permission from role (Admin only)' })
  removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.permissionService.removeFromRole(roleId, permissionId);
  }

  @Delete('permissions/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete permission (Admin only)' })
  removePermission(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}