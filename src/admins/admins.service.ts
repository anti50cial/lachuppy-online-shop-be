import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayload } from 'src/app.models';
import { PrismaService } from 'src/prisma/prisma.service';
// import { UpdateAdminDto } from './dto/update-admin.dto';
// import { addMinutes } from 'date-fns';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async findAll(loggedInUser: JwtPayload) {
    let admins: {
      id: string;
      email: string;
      name: string;
      suspended: boolean;
      _count: { dishes: number };
    }[];
    if (loggedInUser.isSystem) {
      admins = await this.prisma.admin.findMany({
        select: {
          _count: { select: { dishes: { where: { dropped: false } } } },
          name: true,
          email: true,
          id: true,
          suspended: true,
        },
      });
    } else {
      admins = await this.prisma.admin.findMany({
        select: {
          _count: { select: { dishes: { where: { dropped: false } } } },
          name: true,
          email: true,
          id: true,
          suspended: true,
        },
        where: { isSystem: false },
      });
    }

    return { data: { admins } };
  }

  async findOne(loggedInUser: JwtPayload, id: string) {
    let admin: {
      name: string;
      id: string;
      email: string;
      joinedAt: Date;
      suspended: boolean;
      permissions: string[];
      isSystem: boolean;
      keyCardId: string | null;
    } | null;
    if (loggedInUser.isSystem) {
      admin = await this.prisma.admin.findUnique({
        where: { id },
        omit: { hash: true },
      });
    } else {
      admin = await this.prisma.admin.findUnique({
        where: { id, isSystem: false },
        omit: { hash: true },
      });
    }

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }
    return { data: { admin } };
  }

  // update(id: number, updateAdminDto: UpdateAdminDto) {
  //   return `This action updates a #${id} admin`;
  // }

  async suspend(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (admin?.isSystem) {
      throw new ForbiddenException('You cannot suspend the system.');
    }
    if (!admin) {
      throw new NotFoundException('Admin not found.');
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

  async restore(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found.');
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

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
