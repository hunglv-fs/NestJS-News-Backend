import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from '../user/entities/user.entity';
import { RbacController } from './rbac.controller';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, RolePermission, UserRole, User]),
  ],
  controllers: [RbacController],
  providers: [RoleService, PermissionService, RolesGuard, PermissionsGuard],
  exports: [RoleService, PermissionService, RolesGuard, PermissionsGuard],
})
export class RbacModule { }
