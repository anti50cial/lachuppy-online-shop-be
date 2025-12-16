import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayload } from 'src/app.models';
import { PERMISSION_DETAILS, PermissionType } from 'src/auth/permissions';
import { CreateKeycardDto } from './dto/create-keycard.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DateTime } from 'luxon';
import * as crypto from 'crypto';

@Injectable()
export class KeyCardsService {
  constructor(private prisma: PrismaService) {}

  async generate(loggedInUser: JwtPayload, data: CreateKeycardDto) {
    const permissionsToGrant = data.permissions;
    const possiblePermissions =
      this.getPossiblePermissions(loggedInUser).data.possiblePermissions;
    if (permissionsToGrant.length === 0) {
      throw new BadRequestException(
        'Every keycard must have at least one permission',
      );
    }
    for (const permission of permissionsToGrant) {
      if (!possiblePermissions.find((p) => p.key === permission)) {
        throw new ForbiddenException(
          "You cannot grant permissions you don't have.",
        );
      }
    }

    const keycard = crypto.randomBytes(10).toString('hex');
    const expiresAt = DateTime.now().plus({ minutes: 30 }).toJSDate();
    await this.prisma.keyCard.create({
      data: {
        code: keycard,
        expiresAt,
        permissions: [...permissionsToGrant],
        generatedBy: { connect: { id: loggedInUser.sub } },
      },
      include: { generatedBy: true },
    });
    return {
      data: { keycard },
      message: 'Keycard generated successfully.',
    };
  }

  async getKeycards() {
    const query = await this.prisma.keyCard.findMany({
      where: { isUsed: false, isValid: true },
      omit: { generatorId: true, isUsed: true, isValid: true },
      include: {
        generatedBy: { select: { name: true, id: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });
    const _keycards = query.filter((k) => !this.isExpired(k));
    const keycards = _keycards.map((k) => ({
      ...k,
      permissions: [
        ...k.permissions.map((p) =>
          PERMISSION_DETAILS.find((i) => i.key === p),
        ),
      ],
    }));
    return { data: { keycards } };
  }

  getPossiblePermissions(loggedInUser: JwtPayload) {
    if (loggedInUser.isSystem) {
      return { data: { possiblePermissions: PERMISSION_DETAILS } };
    }
    const possiblePermissions: typeof PERMISSION_DETAILS = [];
    for (const permission of loggedInUser.permissions) {
      const permission_details = this.getPermissionDetails(permission);
      if (!permission_details) {
        throw new BadRequestException(
          'An error has occurred, try contacting the admins',
        );
      }
      possiblePermissions.push(permission_details);
    }
    return { data: { possiblePermissions } };
  }

  async revokeKeyCard(id: string) {
    const keyCard = await this.prisma.keyCard.findUnique({
      where: { id, isUsed: false, isValid: true },
    });
    if (!keyCard) {
      throw new NotFoundException('Keycard not found.');
    }
    await this.prisma.keyCard.update({
      where: { id },
      data: { isValid: false },
    });
    return { message: 'Keycard revoked.' };
  }

  getPermissionDetails(key: PermissionType) {
    const permission_details = PERMISSION_DETAILS.find((p) => p.key === key);
    if (!permission_details) {
      return false;
    }
    return permission_details;
  }

  isExpired(keyCard: { expiresAt: Date }) {
    if (
      DateTime.now()
        .diff(DateTime.fromJSDate(keyCard.expiresAt), ['minutes'])
        .toObject().minutes! > 0
    ) {
      return true;
    }
    return false;
  }
}
