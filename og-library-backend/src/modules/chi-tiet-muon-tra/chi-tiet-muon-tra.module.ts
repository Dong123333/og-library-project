import { Module } from '@nestjs/common';
import { ChiTietMuonTraService } from './chi-tiet-muon-tra.service';
import { ChiTietMuonTraController } from './chi-tiet-muon-tra.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ChiTietMuonTra,
  ChiTietMuonTraSchema,
} from './schemas/chi-tiet-muon-tra.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChiTietMuonTra.name, schema: ChiTietMuonTraSchema },
    ]),
  ],
  controllers: [ChiTietMuonTraController],
  providers: [ChiTietMuonTraService],
})
export class ChiTietMuonTraModule {}
