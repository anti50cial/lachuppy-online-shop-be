import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  create(@Body() initializePaymentDto: InitializePaymentDto) {
    return this.ordersService.initialize(initializePaymentDto);
  }

  @Get('complete/:reference')
  complete(@Param('reference') reference: string) {
    return this.ordersService.complete(reference);
  }

  @UseGuards(JwtGuard)
  @Get('pending')
  findAll() {
    return this.ordersService.findUnfinishedOrders();
  }

  @UseGuards(JwtGuard)
  @Get('count')
  count() {
    return this.ordersService.count();
  }

  @UseGuards(JwtGuard)
  @Get(':id/mark-as/:status')
  markOrder(
    @Param('status') status: 'PROCESSING' | 'COMPLETED' | 'DISMISSED',
    @Param('id') id: string,
  ) {
    return this.ordersService.markAs(id, status);
  }

  // @UseGuards(JwtGuard)
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ordersService.findOne(+id);
  // }

  // @UseGuards(JwtGuard)
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.ordersService.update(+id, updateOrderDto);
  // }

  // @UseGuards(JwtGuard)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ordersService.remove(+id);
  // }
}
