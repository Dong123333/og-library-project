import { Module } from '@nestjs/common';
import { PhieuPhatService } from './phieu-phat.service';
import { PhieuPhatController } from './phieu-phat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PhieuPhat, PhieuPhatSchema } from './schemas/phieu-phat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhieuPhat.name, schema: PhieuPhatSchema },
    ]),
  ],
  controllers: [PhieuPhatController],
  providers: [PhieuPhatService],
})
export class PhieuPhatModule {}
