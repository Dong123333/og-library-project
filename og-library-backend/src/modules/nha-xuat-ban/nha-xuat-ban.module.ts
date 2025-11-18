import { Module } from '@nestjs/common';
import { NhaXuatBanService } from './nha-xuat-ban.service';
import { NhaXuatBanController } from './nha-xuat-ban.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NhaXuatBan, NhaXuatBanSchema } from './schemas/nha-xuat-ban.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NhaXuatBan.name, schema: NhaXuatBanSchema },
    ]),
  ],
  controllers: [NhaXuatBanController],
  providers: [NhaXuatBanService],
})
export class NhaXuatBanModule {}
