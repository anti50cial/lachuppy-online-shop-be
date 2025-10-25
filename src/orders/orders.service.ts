import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  findAll() {
    const orders = this.prisma.order.findMany();
    return { data: { orders } };
  }

  async count() {
    const totalOrderCount = await this.prisma.order.count();
    const pendingOrderCount = await this.prisma.order.count({
      where: { status: 'PENDING' },
    });
    const completedOrderCount = await this.prisma.order.count({
      where: { status: 'COMPLETED' },
    });

    return {
      data: { totalOrderCount, pendingOrderCount, completedOrderCount },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
