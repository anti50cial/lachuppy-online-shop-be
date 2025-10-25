import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { APP_INTERCEPTOR } from '@nestjs/core';
// import { ResponseInterceptor } from './interceptors/response/response.interceptor';
import { OrdersModule } from './orders/orders.module';
import { DishesModule } from './dishes/dishes.module';

@Module({
  imports: [
    AuthModule,
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
