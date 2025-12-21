import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from 'src/app.models';
import { PERMISSIONS, PermissionType } from 'src/auth/permissions';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<PermissionType>(
      'has-permission',
      context.getHandler(),
    );
    if (!requiredPermission) {
      return true;
    }
    const { user: sessionUser } = context
      .switchToHttp()
      .getRequest<AuthRequest>();
    const user = await this.prisma.admin.findUniqueOrThrow({
      where: { id: sessionUser.sub },
    });
    if (user.isSystem || user.permissions.includes(PERMISSIONS.IS_HIGH_LEVEL)) {
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
