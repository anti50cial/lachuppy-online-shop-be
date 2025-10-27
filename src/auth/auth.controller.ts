import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { AuthRequest } from 'src/app.models';
import { LocalAuthGuard } from 'src/guards/local-auth/local-auth.guard';
import { SignUpDto } from './dto/signup.dto';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { AdminsService } from 'src/admins/admins.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminsService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const access_token = await this.authService.signJwt(
      request.user,
      this.config.getOrThrow('JWT_EXPIRES_IN'),
    );
    const refresh_token = await this.authService.signJwt(request.user, '7D');
    const message = 'Signed in successfully.';
    const data = {
      user: {
        id: request.user.sub,
        email: request.user.email,
        role: request.user.role,
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
    const user = await this.adminService.findOne(request.user.sub);
    const data = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
    const message = 'Session refreshed successfully';
    return { data, message };
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'You are logged out' };
  }

  @Post('signup')
  signup(@Body() data: SignUpDto) {
    return this.authService.createAdmin(data);
  }
}
