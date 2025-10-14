import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { AuthRequest } from 'src/app.models';
import { LocalAuthGuard } from 'src/guards/local-auth/local-auth.guard';
import { SignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(@Req() request: AuthRequest) {
    const access_token = await this.authService.signJwt(request.user);
    return { access_token };
  }

  @Post('signup')
  signup(@Body() data: SignUpDto) {
    return this.authService.createAdmin(data);
  }
}
