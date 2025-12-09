import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from 'src/app.models'; // Or wherever your interface is

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthRequest>();
    if (!user || !user.role) {
      throw new UnauthorizedException(
        'You are not allowed to view this resource',
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw new UnauthorizedException('You are allowed to view this resource');
    }

    return true;
  }
}
