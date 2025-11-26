import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaystackModule } from 'src/paystack/paystack.module';

@Module({
  imports: [PrismaModule, PaystackModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
