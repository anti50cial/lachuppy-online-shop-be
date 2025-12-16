import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { OrdersService } from './orders.service';
import { SuspensionAccessGuard } from 'src/guards/suspension-access/suspension-access.guard';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';
import { HasPermission } from 'src/decorators/has-permission/has-permission.decorator';
import { PERMISSIONS } from 'src/auth/permissions';

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

  @UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
  @HasPermission(PERMISSIONS.MANAGE_ORDERS)
  @Get('pending')
  findPendingOrders() {
    return this.ordersService.findPendingOrders();
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
  @HasPermission(PERMISSIONS.MANAGE_ORDERS)
  @Get('processing')
  findProcessingOrders() {
    return this.ordersService.findProcessingOrders();
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
  @HasPermission(PERMISSIONS.MANAGE_ORDERS)
  @Get('history')
  findOrdersHistory() {
    return this.ordersService.findOrdersHistory();
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard)
  @Get('count')
  count() {
    return this.ordersService.count();
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
  @HasPermission(PERMISSIONS.MANAGE_ORDERS)
  @Get(':id/mark-as/:status')
  markOrder(
    @Param('status') status: 'PROCESSING' | 'COMPLETED' | 'DISMISSED',
    @Param('id') id: string,
  ) {
    return this.ordersService.markAs(id, status);
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
  @HasPermission(PERMISSIONS.MANAGE_ORDERS)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // @UseGuards(JwtGuard, SuspensionAccessGuard)
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ordersService.findOne(+id);
  // }

  // @UseGuards(JwtGuard, SuspensionAccessGuard)
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.ordersService.update(+id, updateOrderDto);
  // }

  // @UseGuards(JwtGuard, SuspensionAccessGuard)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ordersService.remove(+id);
  // }
}
