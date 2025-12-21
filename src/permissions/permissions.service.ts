import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayload } from 'src/app.models';
import {
  PERMISSION_DETAILS,
  PERMISSIONS,
  PermissionType,
} from 'src/auth/permissions';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}
  getPossiblePermissions() {
    return { data: { possiblePermissions: PERMISSION_DETAILS } };
  }

  async updateAdminPermissions(
    loggedInUser: JwtPayload,
    targetAdminId: string,
    updatePermissionDto: UpdatePermissionDto,
  ) {
    const targetAdmin = await this.prisma.admin.findUnique({
      where: { id: targetAdminId },
    });

    if (!targetAdmin) {
      throw new NotFoundException('That admin does not exist.');
    }
    if (targetAdmin.isSystem) {
      throw new ForbiddenException('You cannot edit the system.');
    }
    if (targetAdminId === loggedInUser.sub) {
      throw new ForbiddenException('You cannot modify your own permissions.');
    }
    if (
      !loggedInUser.isSystem &&
      targetAdmin.permissions.includes(PERMISSIONS.IS_HIGH_LEVEL)
    ) {
      throw new ForbiddenException(
        "You cannot modify an high level admin's permissions. Contact tech support.",
      );
    }
    const permissionsAreValid = updatePermissionDto.permissions.every((p) =>
      Object.values(PERMISSIONS).includes(p as PermissionType),
    );
    if (!permissionsAreValid) {
      throw new BadRequestException('Invalid permissions provided.');
    }
    await this.prisma.admin.update({
      where: { id: targetAdminId },
      data: { permissions: updatePermissionDto.permissions },
    });
    return { message: 'Permissions successfully updated.' };
  }

  getPermissionDetails(key: PermissionType) {
    const permission_details = PERMISSION_DETAILS.find((p) => p.key === key);
    if (!permission_details) {
      return false;
    }
    return permission_details;
  }
}
