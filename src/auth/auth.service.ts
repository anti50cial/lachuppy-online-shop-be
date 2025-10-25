import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtPayload } from 'src/app.models';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signJwt(data: JwtPayload, expiry?: any) {
    return await this.jwt.signAsync(
      { sub: data.sub, email: data.email },
      { expiresIn: expiry },
    );
  }

  async validateUser(data: SignInDto): Promise<JwtPayload | null> {
    const user = await this.prisma.admin.findUnique({
      where: { email: data.email },
      select: { id: true, hash: true, email: true, role: true },
    });
    if (user) {
      const passwordVerified = await argon.verify(user.hash, data.password);
      if (passwordVerified) {
        return { sub: user.id, email: user.email, role: user.role };
      }
    }
    return null;
  }
  async createAdmin(data: SignUpDto) {
    const { accessCode, email, name, password, cpassword } = data;
    const verifiedAccessCode = await this.prisma.accessCode.findUnique({
      where: {
        code: accessCode,
        valid: true,
      },
    });
    if (cpassword !== password) {
      throw new BadRequestException('Passwords do not match');
    }
    if (!verifiedAccessCode) {
      throw new UnauthorizedException(
        'Invalid access code provided, contact admins!',
      );
    }
    const hash = await argon.hash(password, { type: argon.argon2id });
    try {
      const [newUser] = await this.prisma.$transaction([
        this.prisma.admin.create({
          data: { email, name, hash, role: 'Admin' },
          select: { name: true, email: true },
        }),
        this.prisma.accessCode.update({
          where: { code: verifiedAccessCode.code },
          data: { valid: true },
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
        data: { name: 'SYSTEM SUPER USER', email, hash, role: 'Superuser' },
        select: { name: true },
      });
      if (superUser) {
        console.log('System initialized successfully!');
      }
    } else {
      console.log('System already initialized!');
    }
  }
}
