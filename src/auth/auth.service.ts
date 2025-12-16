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
import type { Response } from 'express';
import { JwtPayload, type AuthRequest } from 'src/app.models';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { PermissionType } from './permissions';
import { KeyCardsService } from 'src/key-cards/key-cards.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly KeyCardsService: KeyCardsService,
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

  async signin(request: AuthRequest, res: Response) {
    if (request.user.suspended) {
      throw new UnauthorizedException(
        'Your account has been suspended, contact the admins.',
      );
    }
    const access_token = await this.signJwt(
      request.user,
      this.config.getOrThrow('JWT_EXPIRES_IN'),
    );
    const refresh_token = await this.signJwt(request.user, '7D');
    const message = 'Signed in successfully.';
    const data = {
      user: {
        id: request.user.sub,
        email: request.user.email,
        permissions: request.user.permissions,
        isSystem: request.user.isSystem ? request.user.isSystem : undefined,
      },
    };
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') === 'PRODUCTION',
      sameSite: 'lax',
      path: '/api',
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') === 'PRODUCTION',
      sameSite: 'lax',
      path: '/api',
    });
    return {
      message,
      data,
    };
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

  async createAdmin(data: SignUpDto, res: Response) {
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
          select: {
            email: true,
            id: true,
            permissions: true,
            isSystem: true,
            suspended: true,
          },
        }),
        this.prisma.keyCard.update({
          where: { code: verifiedKeyCard.code },
          data: { isUsed: true },
        }),
      ]);
      const permissions = newUser.permissions.map((p) => {
        const _p = this.KeyCardsService.getPermissionDetails(
          p as PermissionType,
        );
        if (!_p) {
          throw new BadRequestException(
            'An error occured, try contacting the admins.',
          );
        }
        return _p.key;
      });
      const user = {
        ...newUser,
        sub: newUser.id,
        permissions,
      };
      const access_token = await this.signJwt(
        user,
        this.config.getOrThrow('JWT_EXPIRES_IN'),
      );
      const refresh_token = await this.signJwt(user, '7D');

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: this.config.getOrThrow('NODE_ENV') === 'PRODUCTION',
        sameSite: 'lax',
        path: '/api',
      });
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: this.config.getOrThrow('NODE_ENV') === 'PRODUCTION',
        sameSite: 'lax',
        path: '/api',
      });

      return {
        message: `New admin created successfully, proceed to sign in`,
        data: {
          user: {
            id: user.sub,
            email: user.email,
            permissions: user.permissions,
            isSystem: user.isSystem ? user.isSystem : undefined,
          },
        },
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
