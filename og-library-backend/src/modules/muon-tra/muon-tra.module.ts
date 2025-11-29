import { Module } from '@nestjs/common';
import { MuonTraService } from './muon-tra.service';
import { MuonTraController } from './muon-tra.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MuonTra, MuonTraSchema } from './schemas/muon-tra.schema';
import {
  ChiTietMuonTra,
  ChiTietMuonTraSchema,
} from '../chi-tiet-muon-tra/schemas/chi-tiet-muon-tra.schema';
import { Sach, SachSchema } from '../sach/schemas/sach.schema';
import { PhieuPhatModule } from '../phieu-phat/phieu-phat.module';
import { ThongBaoModule } from '../thong-bao/thong-bao.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MuonTra.name, schema: MuonTraSchema },
      { name: ChiTietMuonTra.name, schema: ChiTietMuonTraSchema },
      { name: Sach.name, schema: SachSchema },
    ]),
    PhieuPhatModule,
    ThongBaoModule,
  ],
  controllers: [MuonTraController],
  providers: [MuonTraService],
  exports: [MuonTraService],
})
export class MuonTraModule {}
