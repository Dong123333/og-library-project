import { Module } from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDungController } from './nguoi-dung.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NguoiDung, NguoiDungSchema } from './schemas/nguoi-dung.schema';
import { VaiTro, VaiTroSchema } from '../vai-tro/schemas/vai-tro.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NguoiDung.name, schema: NguoiDungSchema },
      { name: VaiTro.name, schema: VaiTroSchema },
    ]),
  ],
  controllers: [NguoiDungController],
  providers: [NguoiDungService],
  exports: [NguoiDungService],
})
export class NguoiDungModule {}
