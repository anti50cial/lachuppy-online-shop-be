import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { DishesModule } from './dishes/dishes.module';
import { OrdersModule } from './orders/orders.module';

import { PaystackModule } from './paystack/paystack.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    OrdersModule,
    DishesModule,
    PaystackModule,
    AdminsModule,
  ],
  // controllers: [AppController],
})
export class AppModule {}
