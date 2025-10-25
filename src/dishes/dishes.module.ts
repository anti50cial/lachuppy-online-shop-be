import { Module } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    MulterModule.register({
      dest: '/uploads',
    }),
  ],
  controllers: [DishesController],
  providers: [DishesService, JwtStrategy],
})
export class DishesModule {}
