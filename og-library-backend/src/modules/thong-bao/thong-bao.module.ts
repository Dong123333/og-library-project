import { Module } from '@nestjs/common';
import { ThongBaoService } from './thong-bao.service';
import { ThongBaoController } from './thong-bao.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ThongBao, ThongBaoSchema } from './schemas/thong-bao.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThongBao.name, schema: ThongBaoSchema },
    ]),
  ],
  controllers: [ThongBaoController],
  providers: [ThongBaoService],
  exports: [ThongBaoService],
})
export class ThongBaoModule {}
