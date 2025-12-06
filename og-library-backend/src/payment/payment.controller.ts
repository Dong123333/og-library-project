import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { Public } from '../decorator/customize';
import { ConfigService } from '@nestjs/config';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create_url')
  createPaymentUrl(
    @Body() body: { amount: number; orderId: string },
    @Req() req: Request,
  ) {
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const url = this.paymentService.createPaymentUrl(
      body.amount,
      body.orderId,
      ipAddr as string,
    );
    return { url };
  }

  @Get('vnpay_return')
  @Public()
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const result = await this.paymentService.verifyReturnUrl(query);
    const url = this.configService.get<string>('FRONTEND_URL');
    if (result.status === 'success') {
      return res.redirect(`${url}/payment-result?status=1`);
    } else {
      return res.redirect(`${url}/payment-result?status=0`);
    }
  }
}
