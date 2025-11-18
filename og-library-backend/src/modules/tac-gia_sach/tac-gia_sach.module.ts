import { Module } from '@nestjs/common';
import { TacGiaSachService } from './tac-gia_sach.service';
import { TacGiaSachController } from './tac-gia_sach.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TacGia_Sach, TacGia_SachSchema } from './schemas/tac-gia_sach.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TacGia_Sach.name, schema: TacGia_SachSchema },
    ]),
  ],
  controllers: [TacGiaSachController],
  providers: [TacGiaSachService],
})
export class TacGiaSachModule {}
