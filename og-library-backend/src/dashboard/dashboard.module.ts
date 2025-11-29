import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NguoiDung,
  NguoiDungSchema,
} from '../modules/nguoi-dung/schemas/nguoi-dung.schema';
import { Sach, SachSchema } from '../modules/sach/schemas/sach.schema';
import {
  MuonTra,
  MuonTraSchema,
} from '../modules/muon-tra/schemas/muon-tra.schema';
import {
  ChiTietMuonTra,
  ChiTietMuonTraSchema,
} from '../modules/chi-tiet-muon-tra/schemas/chi-tiet-muon-tra.schema';
import {
  PhieuPhat,
  PhieuPhatSchema,
} from '../modules/phieu-phat/schemas/phieu-phat.schema';
import {
  VaiTro,
  VaiTroSchema,
} from '../modules/vai-tro/schemas/vai-tro.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sach.name, schema: SachSchema },
      { name: VaiTro.name, schema: VaiTroSchema },
      { name: NguoiDung.name, schema: NguoiDungSchema },
      { name: MuonTra.name, schema: MuonTraSchema },
      { name: ChiTietMuonTra.name, schema: ChiTietMuonTraSchema },
      { name: PhieuPhat.name, schema: PhieuPhatSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
