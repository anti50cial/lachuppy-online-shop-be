import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { KeyCardsModule } from 'src/key-cards/key-cards.module';

@Module({
  imports: [PrismaModule, KeyCardsModule],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
