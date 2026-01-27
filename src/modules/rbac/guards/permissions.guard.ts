import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    const userWithPermissions = await this.userRepository.findOne({
      where: { id: user.id },
      relations: {
        roles: {
          permissions: {
            permission: true,
          },
        },
      },
    });

    if (!userWithPermissions?.roles?.[0]) {
      return false;
    }

    const userPermissions = userWithPermissions.roles[0].permissions.map(
      rp => rp.permission.name
    );

    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }
}