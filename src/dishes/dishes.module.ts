import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: '/uploads',
    }),
  ],
  controllers: [DishesController],
  providers: [DishesService, JwtStrategy],
})
export class DishesModule {}
