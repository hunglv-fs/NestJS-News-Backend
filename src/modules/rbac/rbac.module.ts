import { Module } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  controllers: [RbacController],
  providers: [RoleService, PermissionService, RolesGuard, PermissionsGuard],
  exports: [RoleService, PermissionService, RolesGuard, PermissionsGuard],
})
export class RbacModule {}