import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayload } from 'src/app.models';
import { PERMISSION_DETAILS, PERMISSIONS } from 'src/auth/permissions';
import { PrismaService } from 'src/prisma/prisma.service';
// import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(loggedInUser: JwtPayload) {
    const admins = await this.prisma.admin.findMany({
      select: {
        _count: {
          select: {
            dishes: { where: { dropped: false } },
          },
        },
        name: true,
        email: true,
        id: true,
        suspended: true,
      },
      where: { isSystem: loggedInUser.isSystem ? undefined : false },
    });
    return { data: { admins } };
  }

  async findOne(loggedInUser: JwtPayload, id: string) {
    const _admin = await this.prisma.admin.findUnique({
      where: { id, isSystem: loggedInUser.isSystem ? undefined : false },
      omit: { hash: true, keyCardId: true, isSystem: true },
      include: {
        _count: {
          select: {
            dishes: { where: { dropped: false } },
          },
        },
        dishes: {
          where: { dropped: false },
          omit: {
            description: true,
            available: true,
            createdAt: true,
            dropped: true,
            updatedAt: true,
            creatorId: true,
          },
          include: { imgs: { select: { location: true }, take: 1 } },
        },
      },
    });

    if (!_admin) {
      throw new NotFoundException('Admin not found.');
    }

    const admin = {
      ..._admin,
      permissions: PERMISSION_DETAILS.map((p) => ({
        ...p,
        checked: !!_admin.permissions.find((_p) => p.key === _p),
      })),
    };

    return { data: { admin } };
  }

  async findMe(loggedInUser: JwtPayload) {
    const _admin = await this.prisma.admin.findUnique({
      where: {
        id: loggedInUser.sub,
        isSystem: loggedInUser.isSystem ? undefined : false,
      },
      omit: { hash: true, keyCardId: true, isSystem: true },
      include: {
        _count: {
          select: {
            dishes: { where: { dropped: false } },
          },
        },
        dishes: {
          where: { dropped: false },
          omit: {
            description: true,
            available: true,
            createdAt: true,
            dropped: true,
            updatedAt: true,
            creatorId: true,
          },
          include: { imgs: { select: { location: true }, take: 1 } },
        },
      },
    });

    if (!_admin) {
      throw new NotFoundException('Admin not found.');
    }

    const admin = {
      ..._admin,
      permissions: PERMISSION_DETAILS.map((p) => ({
        ...p,
      })),
    };

    return { data: { admin } };
  }

  // update(id: number, updateAdminDto: UpdateAdminDto) {
  //   return `This action updates a #${id} admin`;
  // }

  async suspend(loggedInUser: JwtPayload, id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (admin?.isSystem) {
      throw new ForbiddenException('You cannot suspend the system.');
    }
    if (
      admin?.permissions.includes(PERMISSIONS.IS_HIGH_LEVEL) &&
      !loggedInUser.isSystem
    ) {
      throw new ForbiddenException("You can't suspend an high level admin.");
    }
    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }
    if (admin.id === loggedInUser.sub) {
      throw new BadRequestException("Sorry, you can't suspend yourself.");
    }
    await this.prisma.admin.update({
      where: {
        id,
        isSystem: false,
      },
      data: {
        suspended: true,
      },
    });
    return { message: 'Admin is now suspended.' };
  }

  async restore(loggedInUser: JwtPayload, id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }
    if (
      admin?.permissions.includes(PERMISSIONS.IS_HIGH_LEVEL) &&
      !loggedInUser.isSystem
    ) {
      throw new ForbiddenException("You can't restore an high level admin.");
    }
    if (admin.id === loggedInUser.sub) {
      throw new BadRequestException("Sorry, you can't restore yourself.");
    }
    await this.prisma.admin.update({
      where: {
        id,
        isSystem: false,
      },
      data: {
        suspended: false,
      },
    });
    return { message: 'Admin is now restored.' };
  }

  // remove(id: number) {
  //   return `This action removes a #${id} admin`;
  // }
}
