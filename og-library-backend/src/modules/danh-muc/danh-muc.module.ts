import { Module } from '@nestjs/common';
import { DanhMucService } from './danh-muc.service';
import { DanhMucController } from './danh-muc.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DanhMuc, DanhMucSchema } from './schemas/danh-muc.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DanhMuc.name, schema: DanhMucSchema }]),
  ],
  controllers: [DanhMucController],
  providers: [DanhMucService],
})
export class DanhMucModule {}
