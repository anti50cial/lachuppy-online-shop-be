import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from 'src/app.models';
import { PermissionType } from 'src/auth/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<PermissionType>(
      'has-permission',
      context.getHandler(),
    );
    if (!requiredPermission) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<AuthRequest>();
    if (user.isSystem) {
      return true;
    }
    if (user.permissions.length === 0) {
      throw new ForbiddenException(
        'A permission error occured, contact the admins.',
      );
    }
    if (!user.permissions.includes(requiredPermission)) {
      throw new ForbiddenException(
        "You're not allowed to perform this action/view this resource.",
      );
    }
    return true;
  }
}
