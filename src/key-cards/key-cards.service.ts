import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { DateTime } from 'luxon';
import { JwtPayload } from 'src/app.models';
import { PERMISSION_DETAILS } from 'src/auth/permissions';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateKeycardDto } from './dto/create-keycard.dto';

@Injectable()
export class KeyCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(loggedInUser: JwtPayload, createKeycardDto: CreateKeycardDto) {
    const permissionsToGrant = createKeycardDto.permissions;
    if (permissionsToGrant.length === 0) {
      throw new BadRequestException(
        'Every keycard must have at least one permission',
      );
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
