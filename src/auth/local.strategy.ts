import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtPayload } from 'src/app.models';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<JwtPayload> {
    const user: JwtPayload | null = await this.authService.validateUser({
      email,
      password,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials provided.');
    }
    return user;
  }
}
