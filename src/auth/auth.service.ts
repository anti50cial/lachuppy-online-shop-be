import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { JwtPayload } from 'src/app.models';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { PermissionType } from './permissions';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signJwt(data: JwtPayload, expiry?: any) {
    return await this.jwt.signAsync(
      {
        sub: data.sub,
        email: data.email,
        permissions: data.permissions,
        isSystem: data.isSystem ? data.isSystem : undefined,
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { expiresIn: expiry },
    );
  }

  async validateUser(data: SignInDto): Promise<JwtPayload | null> {
    const user = await this.prisma.admin.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        hash: true,
        email: true,
        suspended: true,
        permissions: true,
        isSystem: true,
      },
    });
    if (user) {
      const passwordVerified = await argon.verify(user.hash, data.password);
      if (passwordVerified) {
        return {
          sub: user.id,
          email: user.email,
          suspended: user.suspended,
          permissions: user.permissions as PermissionType[],
          isSystem: user.isSystem ? user.isSystem : undefined,
        };
      }
    }
    return null;
  }

  async createAdmin(data: SignUpDto) {
    const { keyCard, email, name, password, cpassword } = data;
    const verifiedKeyCard = await this.prisma.keyCard.findUnique({
      where: {
        code: keyCard,
        isUsed: false,
        isValid: true,
      },
    });

    if (cpassword !== password) {
      throw new BadRequestException('Passwords do not match');
    }
    if (!verifiedKeyCard) {
      throw new UnauthorizedException(
        'Invalid access code provided, contact admins!',
      );
    }
    const hash = await argon.hash(password, { type: argon.argon2id });
    try {
      const [newUser] = await this.prisma.$transaction([
        this.prisma.admin.create({
          data: {
            email,
            name,
            hash,
            permissions: verifiedKeyCard.permissions,
            keyCard: { connect: { id: verifiedKeyCard.id } },
          },
          select: { name: true, email: true },
        }),
        this.prisma.keyCard.update({
          where: { code: verifiedKeyCard.code },
          data: { isUsed: true },
        }),
      ]);

      return {
        message: `Admin '${newUser.name}' created successfully, proceed to sign in`,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Could not create new admin, contact admins',
      );
    }
  }

  async onModuleInit() {
    const userCount = await this.prisma.admin.count();
    if (userCount === 0) {
      const email: string = this.config.getOrThrow('SUPER_USER_EMAIL');
      const hash: string = await argon.hash(
        this.config.getOrThrow('SUPER_USER_PASS'),
        { type: argon.argon2id },
      );
      const superUser = await this.prisma.admin.create({
        data: { name: 'SYSTEM', email, hash, isSystem: true },
        select: { name: true },
      });
      if (superUser) {
        console.log('System initialized successfully!');
      } else {
        console.log('System initialization was not successful!');
      }
    } else {
      console.log('System already initialized!');
    }
  }
}
