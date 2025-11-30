import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaystackService } from 'src/paystack/paystack.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly PaystackService: PaystackService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    return await this.prisma.order.create({
      data: {
        customerName: createOrderDto.name,
        deliveryAddress: createOrderDto.address,
        email: createOrderDto.email,
        phone: createOrderDto.phoneNumber,
        txreference: createOrderDto.txreference,
        totalPrice: createOrderDto.totalPrice,
        items: {
          createMany: {
            data: createOrderDto.orderItems,
          },
        },
      },
    });
  }

  async initialize(initializePaymentDto: InitializePaymentDto) {
    let totalPrice: number = 0;
    const cartItems = initializePaymentDto.cart;
    const orderItems: {
      priceAtPurchase: number;
      productId: string;
      quantity: number;
    }[] = [];

    for (const item of cartItems) {
      const dish = await this.prisma.dish.findUnique({
        where: { id: item.id, available: true },
      });
      if (!dish) {
        throw new NotFoundException('One or more dishes do not exist.');
      }
      orderItems.push({
        priceAtPurchase: dish.price.toNumber(),
        productId: item.id,
        quantity: item.quantity,
      });
      totalPrice += dish.price.toNumber() * item.quantity;
    }
    const res = await this.PaystackService.initialize({
      metadata: {
        first_name: initializePaymentDto.name.split(' ')[0],
        last_name: initializePaymentDto.name.split(' ').at(-1) || '',
      },
      amount: totalPrice,
      email: initializePaymentDto.email,
    });
    const createdOrderItems = await this.create({
      ...initializePaymentDto,
      orderItems,
      txreference: res.data.reference,
      totalPrice,
    });
    if (!createdOrderItems) {
      throw new BadRequestException('An error occurred, try again.');
    }

    return {
      data: { access_code: res.data.access_code },
      message: res.message,
    };
  }

  async complete(ref: string) {
    const order = await this.prisma.order.findUnique({
      where: { txreference: ref },
    });

    if (!order) {
      throw new NotFoundException(
        "Order with that transaction reference doesn't exist.",
      );
    }

    const transaction = await this.PaystackService.verify(ref);

    if (
      transaction.data.status !== 'success' ||
      transaction.data.amount !== Number(order.totalPrice) * 100
    ) {
      throw new BadRequestException(
        'Payment could not be verified, contact admins or try again.',
      );
    }

    try {
      await this.prisma.order.update({
        where: { txreference: ref },
        data: { status: 'PENDING' },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Could not update your order, contact the admins.',
      );
    }
    return {
      message: 'Payment verified, order has been saved successfully.',
      data: { reference: transaction.data.reference },
    };
  }

  async findPendingOrders() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
      },
      include: { items: true },
      orderBy: {
        orderedAt: 'asc',
      },
    });
    return { data: { orders } };
  }

  async findProcessingOrders() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'PROCESSING',
      },
      include: { items: true },
      orderBy: {
        orderedAt: 'asc',
      },
    });
    return { data: { orders } };
  }

  async findOrdersHistory() {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { status: 'COMPLETED' },
          { status: 'DISMISSED' },
          { status: 'CANCELLED' },
        ],
      },
      include: { items: true },
      orderBy: {
        orderedAt: 'desc',
      },
    });
    return { data: { orders } };
  }

  async count() {
    const totalOrderCount = await this.prisma.order.count({
      where: { NOT: { status: 'NOTYETPAID' } },
    });
    const pendingOrderCount = await this.prisma.order.count({
      where: {
        status: 'PENDING',
      },
    });
    const processingOrderCount = await this.prisma.order.count({
      where: {
        status: 'PROCESSING',
      },
    });
    const completedOrderCount = await this.prisma.order.count({
      where: { status: 'COMPLETED' },
    });

    return {
      data: {
        totalOrderCount,
        pendingOrderCount,
        processingOrderCount,
        completedOrderCount,
      },
    };
  }

  async markAs(id: string, status: 'PROCESSING' | 'COMPLETED' | 'DISMISSED') {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.status === 'NOTYETPAID') {
      throw new BadRequestException('Order has not been paid for');
    }
    if (
      order.status === 'CANCELLED' ||
      order.status === 'COMPLETED' ||
      order.status === 'DISMISSED'
    ) {
      throw new BadRequestException(
        'This order has either been cancelled or completed.',
      );
    }
    if (status === 'COMPLETED' && order.status === 'PENDING') {
      throw new BadRequestException(
        'Order has to be processed before it can be completed',
      );
    }
    await this.prisma.order.update({ where: { id }, data: { status } });
    // Notify customers about status change
    return { message: 'Order status changed successfully.' };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} order`;
  // }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
