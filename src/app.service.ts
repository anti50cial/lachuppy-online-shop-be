import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; res: number } {
    return {
      message: 'Hello World!',
      res: Math.floor(Math.random() * 99999999999),
    };
  }
}
