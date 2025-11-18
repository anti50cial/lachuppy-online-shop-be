import { Module } from '@nestjs/common';
import { AdminsModule } from 'src/admins/admins.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [PrismaModule, AdminsModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
