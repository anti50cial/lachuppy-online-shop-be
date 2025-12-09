import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/app.models';
import { PrismaService } from 'src/prisma/prisma.service';
// import { UpdateAdminDto } from './dto/update-admin.dto';
import { $Enums } from 'generated/prisma';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async generate(loggedInUser: JwtPayload) {
    const code = crypto.randomUUID();
    const code_ = await this.prisma.signupCode.create({
      data: {
        code,
        generatedBy: { connect: { id: loggedInUser.sub } },
      },
      include: { generatedBy: true },
    });
    console.log(code_);
    return { data: { code } };
  }

  async findAll(loggedInUser: JwtPayload) {
    let admins: {
      id: string;
      role: $Enums.Role;
      email: string;
      name: string;
      suspended: boolean;
      // _count: { dishes: number };
    }[];
    if (loggedInUser.role === 'Superuser') {
      admins = await this.prisma.admin.findMany({
        select: {
          // _count: { select: { dishes: { where: { dropped: false } } } },
          name: true,
          email: true,
          id: true,
          role: true,
          suspended: true,
        },
      });
    } else {
      admins = await this.prisma.admin.findMany({
        select: {
          // _count: { select: { dishes: { where: { dropped: false } } } },
          name: true,
          email: true,
          id: true,
          role: true,
          suspended: true,
        },
        where: { role: { not: 'Superuser' } },
      });
    }

    return { data: { admins } };
  }

  async findOne(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      omit: { hash: true },
    });
    return { data: { admin } };
  }

  // update(id: number, updateAdminDto: UpdateAdminDto) {
  //   return `This action updates a #${id} admin`;
  // }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
  isAuthorized(
    authorizedRole: 'Superuser' | 'TopAdmin' | 'Admin',
    currentRole: 'Superuser' | 'TopAdmin' | 'Admin',
  ) {
    if (authorizedRole === 'Superuser' && currentRole !== 'Superuser') {
      return false;
    }
    if (
      authorizedRole === 'TopAdmin' &&
      currentRole !== 'TopAdmin' &&
      currentRole !== 'Superuser'
    ) {
      return false;
    }

    return true;
  }
}
