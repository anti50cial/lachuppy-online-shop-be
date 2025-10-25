import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { AuthRequest } from 'src/app.models';
import { LocalAuthGuard } from 'src/guards/local-auth/local-auth.guard';
import { SignUpDto } from './dto/signup.dto';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private config: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const access_token = await this.authService.signJwt(request.user, '5H'); //adjust later
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
    // cookies here
    return {
      message,
      data,
    };
  }

  @Post('signup')
  signup(@Body() data: SignUpDto) {
    return this.authService.createAdmin(data);
  }
}
