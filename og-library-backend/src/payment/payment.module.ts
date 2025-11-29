import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';
import { PhieuPhatModule } from '../modules/phieu-phat/phieu-phat.module';

@Module({
  imports: [ConfigModule, PhieuPhatModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
