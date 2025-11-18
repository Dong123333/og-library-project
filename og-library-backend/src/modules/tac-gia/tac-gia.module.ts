import { Module } from '@nestjs/common';
import { TacGiaService } from './tac-gia.service';
import { TacGiaController } from './tac-gia.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TacGia, TacGiaSchema } from './schemas/tac-gia.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TacGia.name, schema: TacGiaSchema }]),
  ],
  controllers: [TacGiaController],
  providers: [TacGiaService],
})
export class TacGiaModule {}
