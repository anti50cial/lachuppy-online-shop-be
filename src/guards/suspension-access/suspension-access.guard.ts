import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthRequest } from 'src/app.models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SuspensionAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user: reqUser } = context.switchToHttp().getRequest<AuthRequest>();

    const user = await this.prisma.admin.findUnique({
      where: { id: reqUser.sub },
      select: { suspended: true },
    });

    if (!user) {
      throw new UnauthorizedException('User account not found.');
    }

    if (user.suspended) {
      throw new ForbiddenException(
        'Your account has been suspended. Contact support.',
      );
    }

    return true;
  }
}
