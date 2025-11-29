import { Module } from '@nestjs/common';
import { PhieuPhatService } from './phieu-phat.service';
import { PhieuPhatController } from './phieu-phat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PhieuPhat, PhieuPhatSchema } from './schemas/phieu-phat.schema';
import { ThongBaoModule } from '../thong-bao/thong-bao.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhieuPhat.name, schema: PhieuPhatSchema },
    ]),
    ThongBaoModule,
  ],
  controllers: [PhieuPhatController],
  providers: [PhieuPhatService],
  exports: [PhieuPhatService],
})
export class PhieuPhatModule {}
