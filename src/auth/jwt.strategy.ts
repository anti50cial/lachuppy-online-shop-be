import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
  if (!req || !req.cookies) return null;
  return req.cookies['access_token'] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: config.getOrThrow('JWT_SECRET'),
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    console.log('payload');
    console.log('verified');
    return payload;
    // return { userId: payload.sub, username: payload.email };
  }
}
