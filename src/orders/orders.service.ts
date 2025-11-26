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
        where: { id: item.id },
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

    return { data: res };
  }

  async complete(ref: string) {
    const order = await this.prisma.order.findUnique({
      where: { txreference: ref },
    });

    if (!order) {
      throw new NotFoundException(
        "Order with that transaction reference doesn't exist",
      );
    }

    const transaction = await this.PaystackService.verify(ref);

    if (
      transaction.data.status !== 'success' ||
      transaction.data.amount !== Number(order.totalPrice) * 100
    ) {
      throw new BadRequestException(
        'Payment could not be verified, contact admins or try again',
      );
    }

    try {
      await this.prisma.order.update({
        where: { txreference: ref },
        data: { paid: true },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Could not update your order, contact the admins',
      );
    }
    return { data: transaction };
    // return this.PaystackService.verify(ref);
  }

  async findPendingOrders() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        paid: true,
      },
    });
    return { data: { orders } };
  }

  async count() {
    const totalOrderCount = await this.prisma.order.count({
      where: { paid: true },
    });
    const pendingOrderCount = await this.prisma.order.count({
      where: {
        status: 'PENDING',
        paid: true,
      },
    });
    const completedOrderCount = await this.prisma.order.count({
      where: { status: 'COMPLETED' },
    });

    return {
      data: { totalOrderCount, pendingOrderCount, completedOrderCount },
    };
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
