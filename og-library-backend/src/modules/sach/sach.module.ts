import { Module } from '@nestjs/common';
import { SachService } from './sach.service';
import { SachController } from './sach.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sach, SachSchema } from './schemas/sach.schema';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
import { DanhMuc, DanhMucSchema } from '../danh-muc/schemas/danh-muc.schema';
import { TacGia, TacGiaSchema } from '../tac-gia/schemas/tac-gia.schema';
import {
  NhaXuatBan,
  NhaXuatBanSchema,
} from '../nha-xuat-ban/schemas/nha-xuat-ban.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sach.name, schema: SachSchema },
      { name: DanhMuc.name, schema: DanhMucSchema },
      { name: TacGia.name, schema: TacGiaSchema },
      { name: NhaXuatBan.name, schema: NhaXuatBanSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [SachController],
  providers: [SachService],
})
export class SachModule {}
