import { Module } from '@nestjs/common';
import { KeyCardsService } from './key-cards.service';
import { KeyCardsController } from './key-cards.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KeyCardsController],
  providers: [KeyCardsService],
  exports: [KeyCardsService],
})
export class KeyCardsModule {}
