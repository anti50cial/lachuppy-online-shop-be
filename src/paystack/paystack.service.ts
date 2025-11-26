import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, OnModuleInit } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

@Injectable()
export class PaystackService implements OnModuleInit {
  constructor(
    private readonly HttpService: HttpService,
    private readonly ConfigService: ConfigService,
  ) {}
  private readonly paystackApiUrl = 'https://api.paystack.co/transaction';
  private secretKey!: string;
  async initialize(data: {
    metadata: {
      first_name: string;
      last_name: string;
    };
    email: string;
    amount: number;
  }) {
    let res: AxiosResponse<
      {
        status: boolean;
        message: string;
        data: {
          authorization_url: string;
          access_code: string;
          reference: string;
        };
      },
      any,
      unknown
    >;
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
    try {
      res = await lastValueFrom(
        this.HttpService.post<{
          status: boolean;
          message: string;
          data: {
            authorization_url: string;
            access_code: string;
            reference: string;
          };
        }>(
          `${this.paystackApiUrl}/initialize`,
          { ...data, amount: data.amount * 100 },
          { headers },
        ),
      );

      return res.data;
    } catch (error) {
      console.log(error);
      throw new BadGatewayException(
        'Could not initialize payment process, try again.',
      );
    }
  }
  async verify(reference: string) {
    let res: AxiosResponse<
      {
        status: boolean;
        message: string;
        data: {
          domain: string;
          status: string;
          reference: string;
          amount: number;
          metadata: {
            first_name: string;
            last_name: string;
          };
        };
      },
      any,
      unknown
    >;
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
    };
    try {
      res = await lastValueFrom(
        this.HttpService.get<{
          status: boolean;
          message: string;
          data: {
            domain: string;
            status: string;
            reference: string;
            amount: number;
            metadata: {
              first_name: string;
              last_name: string;
            };
          };
        }>(`${this.paystackApiUrl}/verify/${reference}`, { headers }),
      );

      return res.data;
    } catch (error) {
      console.log(error);
      throw new BadGatewayException(
        'Could not initialize payment process, try again.',
      );
    }
  }
  onModuleInit() {
    this.secretKey = this.ConfigService.getOrThrow('PAYSTACK_SECRET_KEY');
  }
}
