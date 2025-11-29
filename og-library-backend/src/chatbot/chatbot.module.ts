import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sach, SachSchema } from '../modules/sach/schemas/sach.schema';
import { MuonTraModule } from '../modules/muon-tra/muon-tra.module';
import {
  DanhMuc,
  DanhMucSchema,
} from '../modules/danh-muc/schemas/danh-muc.schema';
import {
  TacGia,
  TacGiaSchema,
} from '../modules/tac-gia/schemas/tac-gia.schema';
import {
  NhaXuatBan,
  NhaXuatBanSchema,
} from '../modules/nha-xuat-ban/schemas/nha-xuat-ban.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sach.name, schema: SachSchema }]),
    MongooseModule.forFeature([{ name: DanhMuc.name, schema: DanhMucSchema }]),
    MongooseModule.forFeature([{ name: TacGia.name, schema: TacGiaSchema }]),
    MongooseModule.forFeature([
      { name: NhaXuatBan.name, schema: NhaXuatBanSchema },
    ]),
    MuonTraModule,
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
