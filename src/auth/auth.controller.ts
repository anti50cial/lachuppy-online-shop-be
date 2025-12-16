import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import type { AuthRequest } from 'src/app.models';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { LocalAuthGuard } from 'src/guards/local-auth/local-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signin(request, res);
  }

  @UseGuards(AuthGuard('refresh'))
  @Post('refresh-session')
  async refreshSession(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    const access_token = await this.authService.signJwt(
      request.user,
      this.config.getOrThrow('JWT_EXPIRES_IN'),
    );
    const refresh_token = await this.authService.signJwt(request.user, '7D');
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
    const user = await this.prisma.admin.findUnique({
      where: { id: request.user.sub },
    });
    if (!user) {
      throw new NotFoundException(
        'Profile not found, try contacting the admins',
      );
    }
    const data = {
      user: {
        id: user.id,
        email: user.email,
        permissions: user.permissions,
        isSystem: user.isSystem ? user.isSystem : undefined,
      },
    };
    const message = 'Session refreshed successfully';
    return { data, message };
  }
  @UseGuards(JwtGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') === 'PRODUCTION',
      sameSite: 'lax',
      path: '/api',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') === 'PRODUCTION',
      sameSite: 'lax',
      path: '/api',
    });
    return { message: 'You are logged out' };
  }

  @Post('signup')
  signup(@Body() data: SignUpDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.createAdmin(data, res);
  }
}
