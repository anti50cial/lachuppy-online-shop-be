import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
// import { APP_INTERCEPTOR } from '@nestjs/core';
// import { ResponseInterceptor } from './interceptors/response/response.interceptor';
import { DishesModule } from './dishes/dishes.module';
import { OrdersModule } from './orders/orders.module';

import { PaystackModule } from './paystack/paystack.module';

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
        // signOptions: {
        //   expiresIn: config.getOrThrow('JWT_EXPIRES_IN'),
        // },
      }),
    }),
    OrdersModule,
    DishesModule,
    PaystackModule,
  ],
  // controllers: [AppController],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ResponseInterceptor,
    // },
  ],
})
export class AppModule {}
