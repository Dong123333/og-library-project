import { Module } from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDungController } from './nguoi-dung.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NguoiDung, NguoiDungSchema } from './schemas/nguoi-dung.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NguoiDung.name, schema: NguoiDungSchema },
    ]),
  ],
  controllers: [NguoiDungController],
  providers: [NguoiDungService],
})
export class NguoiDungModule {}
