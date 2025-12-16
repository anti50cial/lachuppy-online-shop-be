import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { KeyCardsModule } from 'src/key-cards/key-cards.module';

@Module({
  imports: [PrismaModule, KeyCardsModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
