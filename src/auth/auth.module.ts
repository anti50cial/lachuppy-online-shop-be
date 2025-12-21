import { Module } from '@nestjs/common';
import { KeyCardsModule } from 'src/key-cards/key-cards.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [PrismaModule, KeyCardsModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
