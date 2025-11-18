import { Module } from '@nestjs/common';
import { MuonTraService } from './muon-tra.service';
import { MuonTraController } from './muon-tra.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MuonTra, MuonTraSchema } from './schemas/muon-tra.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MuonTra.name, schema: MuonTraSchema }]),
  ],
  controllers: [MuonTraController],
  providers: [MuonTraService],
})
export class MuonTraModule {}
